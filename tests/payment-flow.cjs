'use strict';
// Isolated fake gateway: no network request or real transaction is made.
const assert=require('node:assert/strict'),{createHmac}=require('node:crypto'),P=require('../data.js'),tokens=require('../server/tokens.cjs');
process.env.VERCEL='1';process.env.APP_ORIGIN='https://patrika.example';process.env.NODE_ENV='test';process.env.PORT='4197';process.env.PAYMENTS_ENABLED='true';process.env.RAZORPAY_KEY_ID='rzp_test_fixture';
process.env.RAZORPAY_KEY_SECRET='fixture_secret';process.env.PAYMENT_TOKEN_SECRET='fixture_payment_token_secret_at_least_32_characters';
const gateway=require('../server/payment.cjs'),pdf=require('../server/pdf.cjs');
let paid=false,amount=4900,rendered=null,refunded=0;
gateway.razorpay=gateway.createGateway({
 orders:{
  async create(body){assert.equal(body.amount,4900);assert.equal(body.currency,'INR');return {id:'order_fixture',amount:4900,currency:'INR'};},
  async fetchPayments(id){assert.equal(id,'order_fixture');return {items:[{id:'pay_fixture',order_id:id,status:paid?'captured':'authorized',captured:paid,amount,currency:'INR',amount_refunded:refunded}]};}
 },
 payments:{async fetch(id){assert.equal(id,'pay_fixture');return {id,order_id:'order_fixture',status:paid?'captured':'authorized',captured:paid,amount,currency:'INR',amount_refunded:refunded};}}
});
pdf.makePDF=async(draft,watermark,format='pdf')=>{rendered={draft,watermark,format};return Buffer.from(format==='png'?'PNG fixture':'%PDF fixture');};
const {handler}=require('../server/index.cjs');
const {Readable}=require('node:stream');
async function request(url,options={}){
 const req=Readable.from(options.body?[Buffer.from(options.body)]:[]);
 req.url=new URL(url).pathname;req.method=options.method||'GET';req.socket={remoteAddress:'fixture'};
 req.headers=Object.fromEntries(Object.entries(options.headers||{}).map(([k,v])=>[k.toLowerCase(),v]));
 const headers=new Headers();let status=200,data;
 const res={headersSent:false,setHeader(k,v){headers.set(k,v);},writeHead(code,values){status=code;this.headersSent=true;for(const [k,v]of Object.entries(values))headers.set(k,v);},end(value){data=value;}};
 await handler(req,res);return new Response(data,{status,headers});
}
(async()=>{
 const origin='https://patrika.example';
 const config=await request(origin+'/api/config');
 assert.equal((await config.json()).paymentsEnabled,true);
 assert.equal(config.headers.get('set-cookie'),null,'stateless payments do not create an order cookie');
 const rejected=await request(origin+'/api/export/free',{method:'POST',headers:{Origin:'https://attacker.example'},body:JSON.stringify({draft:P.demo()})});
 assert.equal(rejected.status,403,'cross-origin exports are rejected');
 assert.equal((await request(origin+'/.env')).status,404,'private files are never served');
 const aliasExport=await request('https://marathibiodatamaker.vercel.app/api/export/free',{
  method:'POST',headers:{Host:'marathibiodatamaker.vercel.app',Origin:'https://marathibiodatamaker.vercel.app','Content-Type':'application/json'},
  body:JSON.stringify({draft:P.demo(),format:'png'})
 });
 assert.equal(aliasExport.status,200,'watermarked PNG works on a Vercel alias that differs from APP_ORIGIN');
 assert.equal(aliasExport.headers.get('content-type'),'image/png');
 assert.equal(rendered.watermark,true);
 async function post(route,data){return request(origin+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});}
 const d=P.demo();
 let response=await post('/api/payment/order',{draft:d,amount:1});
 assert.equal(response.status,200);const order=await response.json();
 assert.equal(order.amount,4900);assert.equal(typeof order.orderToken,'string');
 assert.equal(rendered.watermark,true,'order is layout-validated before requesting payment');
 response=await post('/api/pdf/paid',{downloadToken:'forged',draft:d});assert.equal(response.status,403);
 response=await post('/api/export/paid',{downloadToken:'forged',draft:d,format:'png'});assert.equal(response.status,403);
 response=await post('/api/payment/verify',{orderToken:order.orderToken,razorpay_order_id:'order_fixture',razorpay_payment_id:'pay_fixture',razorpay_signature:'0'.repeat(64)});assert.equal(response.status,403);
 const verification={orderToken:order.orderToken,razorpay_order_id:'order_fixture',razorpay_payment_id:'pay_fixture',razorpay_signature:createHmac('sha256','fixture_secret').update('order_fixture|pay_fixture').digest('hex')};
 response=await post('/api/payment/verify',{...verification,razorpay_order_id:'order_other'});assert.equal(response.status,403);
 response=await post('/api/payment/verify',verification);assert.equal(response.status,409);
 paid=true;amount=1;response=await post('/api/payment/verify',verification);assert.equal(response.status,409);
 amount=4900;response=await post('/api/payment/verify',verification);assert.equal(response.status,200);const verified=await response.json();
 assert.equal(verified.paid,true);assert.equal(typeof verified.downloadToken,'string');
 response=await post('/api/pdf/paid',{downloadToken:verified.downloadToken+'x',draft:d});assert.equal(response.status,403,'tampered download token is rejected');
 response=await post('/api/pdf/paid',{downloadToken:verified.downloadToken,draft:{...d,values:{...d.values,fullName:'Tampered'}}});assert.equal(response.status,403,'a clean download cannot use another draft');
 response=await post('/api/pdf/paid',{downloadToken:verified.downloadToken,draft:d});assert.equal(response.status,200);
 assert.equal(rendered.watermark,false);assert.equal(rendered.draft.values.fullName,d.values.fullName);
 response=await post('/api/payment/status',{orderToken:order.orderToken,draft:d});let status=await response.json();
 assert.equal(status.paid,true);assert.equal(status.matchesDraft,true);assert.equal(typeof status.downloadToken,'string');
 response=await post('/api/payment/status',{orderToken:order.orderToken,draft:{...d,values:{...d.values,fullName:'Changed'}}});status=await response.json();
 assert.equal(status.paid,true);assert.equal(status.matchesDraft,false);
 response=await post('/api/export/paid',{downloadToken:verified.downloadToken,format:'png',draft:d});assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/png');assert.match(response.headers.get('content-disposition'),/\.png/);assert.equal(rendered.format,'png');assert.equal(rendered.watermark,false);assert.equal(rendered.draft.values.fullName,d.values.fullName);
 response=await post('/api/export/paid',{downloadToken:verified.downloadToken,format:'pdf',draft:d});assert.equal(response.status,200);assert.equal(rendered.format,'pdf');assert.equal(rendered.watermark,false);
 response=await post('/api/payment/webhook',{});assert.equal(response.status,404,'webhooks are not used in the stateless flow');
 refunded=1;response=await post('/api/pdf/paid',{downloadToken:verified.downloadToken,draft:d});assert.equal(response.status,409,'even partial refunds block clean downloads');
 refunded=0;paid=false;response=await post('/api/export/paid',{downloadToken:verified.downloadToken,format:'png',draft:d});assert.equal(response.status,409);
 const claims=tokens.verify(order.orderToken,'order');
 const expired=tokens.issue('order',{orderId:claims.orderId,draftDigest:claims.draftDigest,amount:claims.amount,currency:claims.currency},{now:Date.now()-tokens.ORDER_TOKEN_TTL_MS-1000});
 response=await post('/api/payment/status',{orderToken:expired,draft:d});assert.equal(response.status,403,'expired order tokens cannot authorize recovery');
 console.log('PASS: stateless signed tokens bind captured ₹49 Razorpay payments to one draft, with no database, webhook, or session storage.');
})().catch(error=>{console.error(error);process.exitCode=1;});
