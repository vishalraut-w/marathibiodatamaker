'use strict';
const http=require('node:http'),fsp=require('node:fs/promises'),path=require('node:path');
const {randomBytes,createHash}=require('node:crypto');
const P=require('../data.js'),payments=require('./payment.cjs'),pdf=require('./pdf.cjs');
const Memorial=require('../memorial-data.js');
const tokens=require('./tokens.cjs');
const {normalizeOrigin,requestIsAllowed}=require('./origin.cjs');
const ROOT=path.resolve(__dirname,'..'),HOST=process.env.HOST||'127.0.0.1',PORT=Number(process.env.PORT)||4173;
const ORIGIN=normalizeOrigin(process.env.APP_ORIGIN?.trim())||(process.env.VERCEL_URL?'https://'+process.env.VERCEL_URL:'http://'+HOST+':'+PORT);
const keyId=process.env.RAZORPAY_KEY_ID||'';
const keyMode=keyId.startsWith('rzp_test_')?'test':keyId.startsWith('rzp_live_')?'live':null;
// A live key needs an explicit second opt-in after a successful test-mode checkout.
const paymentsEnabled=process.env.PAYMENTS_ENABLED==='true'&&!!keyMode&&!!process.env.RAZORPAY_KEY_SECRET&&tokens.configured()&&(keyMode==='test'||process.env.ALLOW_LIVE_PAYMENTS==='true');
const rates=new Map();
const fail=(message,status=400)=>Object.assign(Error(message),{status});
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
function rate(req){
 const key=(process.env.VERCEL?req.headers['x-vercel-forwarded-for']:req.socket?.remoteAddress)||'unknown',now=Date.now();
 for(const [ip,state] of rates)if(now-state.start>60000)rates.delete(ip);let state=rates.get(key);
 if(!state||now-state.start>60000){state={start:now,count:0};rates.set(key,state);}
 if(++state.count>40)throw fail('खूप विनंत्या झाल्या आहेत. एक मिनिट थांबून पुन्हा प्रयत्न करा.',429);
}
async function readBody(req){
 let size=0;const chunks=[];
 for await(const chunk of req){size+=chunk.length;if(size>4*1024*1024)throw fail('माहितीची फाइल खूप मोठी आहे.',413);chunks.push(chunk);}
 return Buffer.concat(chunks);
}
function draftFrom(body){
 if(body.draft?.kind==='memorial'){
  const d=Memorial.normalize(body.draft);
  if(!d.rows.some(row=>row.value.trim()))throw fail('आधी तुमची माहिती भरा.',422);
  return d;
 }
 const d=P.normalize(body.draft);
 if(!Object.keys(P.sectionsFor(d)).some(s=>P.entries(d,s).length)&&!P.customSectionEntries(d).length)throw fail('आधी तुमची माहिती भरा.',422);
 return d;
}
function draftDigest(draft){
 if(draft.kind==='memorial')return createHash('sha256').update(JSON.stringify(draft)).digest('hex');
 // Preserve tokens issued for older drafts that have no custom sections or label choice.
 const {labelOverrides,...withoutOverrides}=draft;
 const hasOverrides=Object.keys(labelOverrides||{}).length>0;
 const {customSections,professionLabel,...legacy}=withoutOverrides;
 const canonical=!hasOverrides&&customSections.length===0&&professionLabel==='व्यवसाय'?legacy:hasOverrides?draft:withoutOverrides;
 return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}
function exportFormat(body){const format=body.format??'pdf';if(!['pdf','png'].includes(format))throw fail('PDF किंवा PNG प्रकार निवडा.');return format;}
function sendDocument(res,result,format){res.writeHead(200,{'Content-Type':format==='png'?'image/png':'application/pdf','Content-Disposition':'attachment; filename="parichay-patrika.'+format+'"'});res.end(result);}
function paymentClaims(token,type){
 const claims=tokens.verify(token,type);
 // Honor previously signed ₹49 orders until they expire; new orders use the current price.
 const valid=typeof claims.orderId==='string'&&/^order_[A-Za-z0-9_]+$/.test(claims.orderId)&&[payments.PRICE,4900].includes(claims.amount)&&claims.currency===payments.CURRENCY&&typeof claims.draftDigest==='string'&&/^[a-f0-9]{64}$/.test(claims.draftDigest)&&(!claims.paymentId||typeof claims.paymentId==='string'&&/^pay_[A-Za-z0-9_]+$/.test(claims.paymentId));
 if(!valid||type==='download'&&!claims.paymentId)throw fail(tokens.INVALID_TOKEN,403);
 return claims;
}
function paymentSession(claims,payment){
 // Razorpay's payment creation time is stable across verification retries.
 const start=payment.created_at;
 if(!Number.isSafeInteger(start)||start<=0||start>Math.floor(Date.now()/1000)+60)throw fail('पेमेंटची वेळ तपासता आली नाही. कृपया पुन्हा प्रयत्न करा.',502);
 const expiresAt=(start*1000)+tokens.DOWNLOAD_TOKEN_TTL_MS;
 if(Date.now()>=expiresAt)return {paid:true,expired:true,expiresAt};
 return {paid:true,expired:false,expiresAt,downloadToken:tokens.issue('download',{orderId:claims.orderId,paymentId:payment.id,draftDigest:claims.draftDigest,amount:claims.amount,currency:payments.CURRENCY},{now:start*1000})};
}
async function capturedPaymentFor(claims,paymentId){
 if(typeof paymentId!=='string'||!/^pay_[A-Za-z0-9_]+$/.test(paymentId))return null;
 const payment=await payments.razorpay('payments/'+encodeURIComponent(paymentId));
 return payments.capturedPayment(payment,claims.orderId,claims.amount)?payment:null;
}
async function paymentStatus(claims){
 const result=await payments.razorpay('orders/'+encodeURIComponent(claims.orderId)+'/payments');
 const ids=[...new Set((Array.isArray(result.items)?result.items:[]).map(payment=>payment?.id).filter(id=>typeof id==='string'))].slice(0,25);
 for(const id of ids){const payment=await capturedPaymentFor(claims,id);if(payment)return payment;}
 return null;
}
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
const publicFiles=new Set(['index.html','templates.html','buddhist-templates.html','christian-templates.html','islamic-templates.html','builder.html','islamic-builder.html','preview.html','download.html','privacy.html','varshradh-templates.html','varshradh-builder.html','memorial.css','memorial-data.js','memorial-renderer.js','memorial-app.js','styles.css','paper.css','home.css','home.js','site-nav.js','transliterator.js','templates.css','app.js','data.js','renderer.js','analytics.js','robots.txt','sitemap.xml']);
async function handler(req,res){
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
 res.setHeader('X-Frame-Options','DENY');
 try{
  const url=new URL(req.url,ORIGIN);
  if(url.pathname.startsWith('/api/')){
   res.setHeader('Cache-Control','no-store');rate(req);
   if(req.method==='GET'&&url.pathname==='/api/config')return json(res,200,{paymentsEnabled,keyId:paymentsEnabled?keyId:null,amount:payments.PRICE,currency:payments.CURRENCY});
   if(req.method!=='POST')throw fail('Not found',404);
   if(!requestIsAllowed(req,ORIGIN))throw fail('ही विनंती स्वीकारता येत नाही.',403);
   const raw=await readBody(req);let body;try{body=JSON.parse(raw.toString('utf8'));}catch{throw fail('योग्य माहिती पाठवा.');}
   if(!body||typeof body!=='object'||Array.isArray(body))throw fail('योग्य माहिती पाठवा.');
   if(['/api/pdf/free','/api/export/free'].includes(url.pathname)){
    const format=exportFormat(body),result=await pdf.makePDF(draftFrom(body),true,format);
    return sendDocument(res,result,format);
   }
   if(!paymentsEnabled)throw fail('वॉटरमार्कशिवाय डाउनलोड सध्या उपलब्ध नाही.',503);
   if(url.pathname==='/api/payment/order'){
    const d=draftFrom(body),digest=draftDigest(d);
    await pdf.makePDF(d,true);
    const order=await payments.razorpay('orders','POST',{amount:payments.PRICE,currency:payments.CURRENCY,receipt:randomBytes(16).toString('hex'),notes:{draft_digest:digest},partial_payment:false});
    if(!order.id||order.amount!==payments.PRICE||order.currency!==payments.CURRENCY)throw fail('ऑर्डर तयार झाली नाही.',502);
    const orderToken=tokens.issue('order',{orderId:order.id,draftDigest:digest,amount:payments.PRICE,currency:payments.CURRENCY});
    return json(res,200,{id:order.id,amount:order.amount,currency:order.currency,orderToken});
   }
   if(url.pathname==='/api/payment/verify'){
    const claims=paymentClaims(body.orderToken,'order');
    if(body.razorpay_order_id!==claims.orderId||!payments.signatureIsValid(claims.orderId,body.razorpay_payment_id,body.razorpay_signature,process.env.RAZORPAY_KEY_SECRET))throw fail('पेमेंटची पडताळणी झाली नाही.',403);
    const payment=await capturedPaymentFor(claims,body.razorpay_payment_id);
    if(!payment)throw fail('पेमेंट अद्याप पूर्णपणे प्राप्त झालेले नाही. थोड्या वेळाने स्थिती तपासा.',409);
    return json(res,200,paymentSession(claims,payment));
   }
   if(url.pathname==='/api/payment/status'){
    const claims=paymentClaims(body.orderToken,'order');
    const payment=await paymentStatus(claims);
    return json(res,200,payment?paymentSession(claims,payment):{paid:false});
   }
   if(['/api/pdf/paid','/api/export/paid'].includes(url.pathname)){
    const format=exportFormat(body),claims=paymentClaims(body.downloadToken,'download'),draft=draftFrom(body);
    const payment=await capturedPaymentFor(claims,claims.paymentId);
    if(!payment)throw fail('पेमेंटची पडताळणी आवश्यक आहे.',409);
    return sendDocument(res,await pdf.makePDF(draft,false,format),format);
   }
   throw fail('Not found',404);
  }
  if(req.method!=='GET'&&req.method!=='HEAD')throw fail('Not found',404);
  const relative=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname).slice(1);
  if(!publicFiles.has(relative)&&!/^assets\/[a-zA-Z0-9_.-]+\.(svg|ttf|png|txt)$/.test(relative))throw fail('Not found',404);
  const absolute=path.resolve(ROOT,relative);
  if(!absolute.startsWith(ROOT+path.sep))throw fail('Not found',404);
  const file=await fsp.readFile(absolute);
  res.writeHead(200,{'Content-Type':MIME[path.extname(relative)]||'application/octet-stream','Cache-Control':'no-cache'});
  res.end(req.method==='HEAD'?undefined:file);
 }catch(error){
  if(!res.headersSent)json(res,error.status||500,{message:error.status?error.message:'प्रक्रिया पूर्ण झाली नाही. कृपया पुन्हा प्रयत्न करा.'});
  else res.end();
  if(!error.status)console.error(error.name+': '+error.message);
 }
}
let server;
if(require.main===module&&!process.env.VERCEL){
 server=http.createServer(handler);
 server.listen(PORT,HOST,()=>console.log('MarathiPatrikaMakers: '+ORIGIN));
 async function shutdown(){server.closeAllConnections();server.close();await pdf.close();}
 process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
}
module.exports={handler,server,draftDigest};
