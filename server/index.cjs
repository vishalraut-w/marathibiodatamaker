'use strict';
const http=require('node:http'),fsp=require('node:fs/promises'),path=require('node:path');
const {randomBytes,createHmac,createHash,timingSafeEqual}=require('node:crypto');
const P=require('../data.js'),payments=require('./payment.cjs'),pdf=require('./pdf.cjs');
const orders=require('./orders.cjs');
const ROOT=path.resolve(__dirname,'..'),HOST=process.env.HOST||'127.0.0.1',PORT=Number(process.env.PORT)||4173;
const ORIGIN=process.env.APP_ORIGIN?.replace(/\/$/,'')||(process.env.VERCEL_URL?'https://'+process.env.VERCEL_URL:'http://'+HOST+':'+PORT);
const SESSION_SECRET=process.env.SESSION_SECRET||randomBytes(32).toString('hex');
const paymentsEnabled=process.env.PAYMENTS_ENABLED==='true'&&!!process.env.RAZORPAY_KEY_ID&&!!process.env.RAZORPAY_KEY_SECRET&&!!process.env.RAZORPAY_WEBHOOK_SECRET&&(process.env.SESSION_SECRET?.length>=32)&&orders.configured;
const rates=new Map();
const fail=(message,status=400)=>Object.assign(Error(message),{status});
function sign(value){return createHmac('sha256',SESSION_SECRET).update(value).digest('hex');}
function session(req,res){
 const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('mpm_session='))?.slice(12);
 if(raw){const [id,sig]=raw.split('.');if(/^[a-f0-9]{48}$/.test(id||'')&&/^[a-f0-9]{64}$/.test(sig||'')&&timingSafeEqual(Buffer.from(sig,'hex'),Buffer.from(sign(id),'hex')))return id;}
 const id=randomBytes(24).toString('hex');
 res.setHeader('Set-Cookie','mpm_session='+id+'.'+sign(id)+'; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000'+(ORIGIN.startsWith('https:')?'; Secure':''));return id;
}
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
 const d=P.normalize(body.draft);
 if(!Object.keys(P.sections).some(s=>P.entries(d,s).length))throw fail('आधी तुमची माहिती भरा.',422);
 return d;
}
function exportFormat(body){const format=body.format??'pdf';if(!['pdf','png'].includes(format))throw fail('PDF किंवा PNG प्रकार निवडा.');return format;}
function sendDocument(res,result,format){res.writeHead(200,{'Content-Type':format==='png'?'image/png':'application/pdf','Content-Disposition':'attachment; filename="parichay-patrika.'+format+'"'});res.end(result);}
async function owned(id,sid){
 const order=await orders.get(typeof id==='string'?id:'');
 if(!order||order.session!==sid)throw fail('ही ऑर्डर या ब्राउझरमध्ये उपलब्ध नाही.',403);
 return order;
}
async function verifyCaptured(order,paymentId){
 const payment=await payments.razorpay('payments/'+encodeURIComponent(paymentId));
 if(!payments.capturedPayment(payment,order.id))throw fail('पेमेंट अद्याप पूर्णपणे प्राप्त झालेले नाही. थोड्या वेळाने स्थिती तपासा.',409);
 await orders.update(order.id,{status:'paid',payment_id:payment.id});return payment;
}
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.txt':'text/plain; charset=utf-8'};
const publicFiles=new Set(['index.html','templates.html','builder.html','preview.html','download.html','privacy.html','styles.css','paper.css','app.js','data.js','renderer.js']);
async function handler(req,res){
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
 res.setHeader('X-Frame-Options','DENY');
 try{
  const url=new URL(req.url,ORIGIN);
  if(url.pathname.startsWith('/api/')){
   res.setHeader('Cache-Control','no-store');rate(req);
   if(url.pathname==='/api/payment/webhook'&&req.method==='POST'){
    const raw=await readBody(req);
    if(!paymentsEnabled||!payments.webhookIsValid(raw,req.headers['x-razorpay-signature'],process.env.RAZORPAY_WEBHOOK_SECRET))throw fail('Invalid signature',403);
    const event=JSON.parse(raw.toString('utf8')),entity=event.payload?.payment?.entity,order=entity?.order_id?await orders.get(entity.order_id):null;
    if(order&&event.event==='payment.captured')await verifyCaptured(order,entity.id);
    return json(res,200,{received:true});
   }
   const sid=session(req,res);
   if(req.method==='GET'&&url.pathname==='/api/config')return json(res,200,{paymentsEnabled,keyId:paymentsEnabled?process.env.RAZORPAY_KEY_ID:null,amount:payments.PRICE,currency:payments.CURRENCY});
   if(req.method!=='POST')throw fail('Not found',404);
   const origin=req.headers.origin;
   const allowed=new Set([ORIGIN]);
   if(!origin||!allowed.has(origin))throw fail('ही विनंती स्वीकारता येत नाही.',403);
   const raw=await readBody(req);let body;try{body=JSON.parse(raw.toString('utf8'));}catch{throw fail('योग्य माहिती पाठवा.');}
   if(['/api/pdf/free','/api/export/free'].includes(url.pathname)){
    const format=exportFormat(body),result=await pdf.makePDF(draftFrom(body),true,format);
    return sendDocument(res,result,format);
   }
   if(!paymentsEnabled)throw fail('वॉटरमार्कशिवाय डाउनलोड सध्या उपलब्ध नाही.',503);
   if(url.pathname==='/api/payment/order'){
    const d=draftFrom(body),snapshot=JSON.stringify(d),digest=createHash('sha256').update(snapshot).digest('hex');
    await pdf.makePDF(d,true);
    const order=await payments.razorpay('orders','POST',{amount:payments.PRICE,currency:payments.CURRENCY,receipt:randomBytes(16).toString('hex'),notes:{draft_digest:digest},partial_payment:false});
    if(!order.id||order.amount!==payments.PRICE||order.currency!==payments.CURRENCY)throw fail('ऑर्डर तयार झाली नाही.',502);
    await orders.set({id:order.id,session:sid,snapshot,digest,status:'created',created:Date.now()});
    return json(res,200,{id:order.id,amount:order.amount,currency:order.currency});
   }
   if(url.pathname==='/api/payment/verify'){
    const order=await owned(body.razorpay_order_id,sid);
    if(!payments.signatureIsValid(order.id,body.razorpay_payment_id,body.razorpay_signature,process.env.RAZORPAY_KEY_SECRET))throw fail('पेमेंटची पडताळणी झाली नाही.',403);
    await verifyCaptured(order,body.razorpay_payment_id);return json(res,200,{paid:true});
   }
   if(url.pathname==='/api/payment/status'){
    const order=await owned(body.orderId,sid);
    const matchesDraft=body.draft?order.digest===createHash('sha256').update(JSON.stringify(P.normalize(body.draft))).digest('hex'):true;
    if(order.payment_id){try{await verifyCaptured(order,order.payment_id);return json(res,200,{paid:true,matchesDraft});}catch(error){if(error.status!==409)throw error;return json(res,200,{paid:false,matchesDraft});}}
    const result=await payments.razorpay('orders/'+encodeURIComponent(order.id)+'/payments');
    const payment=result.items?.find(p=>payments.capturedPayment(p,order.id));
    if(payment){await verifyCaptured(order,payment.id);return json(res,200,{paid:true,matchesDraft});}
    return json(res,200,{paid:false,matchesDraft});
   }
   if(['/api/pdf/paid','/api/export/paid'].includes(url.pathname)){
    const format=exportFormat(body);
    const order=await owned(body.orderId,sid);
    if(order.status!=='paid'||!order.payment_id)throw fail('पेमेंटची पडताळणी आवश्यक आहे.',403);
    await verifyCaptured(order,order.payment_id);
    // Render only the stored snapshot, never a client-provided clean flag or replacement draft.
    const result=await pdf.makePDF(JSON.parse(order.snapshot),false,format);
    return sendDocument(res,result,format);
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
module.exports={handler,server,database:{close(){}}};
