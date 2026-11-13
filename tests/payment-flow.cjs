'use strict';
// Isolated fake gateway: no network request or real transaction is made.
const assert=require('node:assert/strict'),{createHmac}=require('node:crypto'),P=require('../data.js');
process.env.VERCEL='1';process.env.APP_ORIGIN='https://patrika.example';process.env.NODE_ENV='test';process.env.PORT='4197';process.env.PAYMENTS_ENABLED='true';process.env.RAZORPAY_KEY_ID='fixture_key';
process.env.RAZORPAY_KEY_SECRET='fixture_secret';process.env.RAZORPAY_WEBHOOK_SECRET='fixture_webhook';
process.env.SESSION_SECRET='fixture_session_secret_at_least_32_characters';
process.env.ORDERS_DATABASE=':memory:';
const gateway=require('../server/payment.cjs'),pdf=require('../server/pdf.cjs');
let paid=false,amount=4900,rendered=null;
let refunded=0;
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
 assert.match(config.headers.get('set-cookie'),/; Secure/,'HTTPS deployments issue secure session cookies');
 const rejected=await request(origin+'/api/export/free',{method:'POST',headers:{Origin:'https://attacker.example'},body:JSON.stringify({draft:P.demo()})});
 assert.equal(rejected.status,403,'cross-origin exports are rejected');
 assert.equal((await request(origin+'/.env')).status,404,'private files are never served');
 const cookie=config.headers.get('set-cookie').split(';')[0];
 async function post(route,data,cookieValue=cookie){return request(origin+route,{method:'POST',headers:{Origin:origin,Cookie:cookieValue,'Content-Type':'application/json'},body:JSON.stringify(data)});}
 const d=P.demo();
 let response=await post('/api/payment/order',{draft:d,amount:1});
 assert.equal(response.status,200);assert.equal((await response.json()).amount,4900);
 assert.equal(rendered.watermark,true,'order is layout-validated before requesting payment');
 response=await post('/api/pdf/paid',{orderId:'order_fixture',paid:true});assert.equal(response.status,403);
 response=await post('/api/export/paid',{orderId:'order_fixture',format:'png',paid:true});assert.equal(response.status,403);
 response=await post('/api/payment/verify',{razorpay_order_id:'order_fixture',razorpay_payment_id:'pay_fixture',razorpay_signature:'0'.repeat(64)});assert.equal(response.status,403);
 const verification={razorpay_order_id:'order_fixture',razorpay_payment_id:'pay_fixture',razorpay_signature:createHmac('sha256','fixture_secret').update('order_fixture|pay_fixture').digest('hex')};
 response=await post('/api/payment/verify',verification);assert.equal(response.status,409);
 paid=true;amount=1;response=await post('/api/payment/verify',verification);assert.equal(response.status,409);
 amount=4900;response=await post('/api/payment/verify',verification);assert.equal(response.status,200);
 const otherConfig=await request(origin+'/api/config'),otherCookie=otherConfig.headers.get('set-cookie').split(';')[0];
 response=await post('/api/pdf/paid',{orderId:'order_fixture'},otherCookie);assert.equal(response.status,403);
 response=await post('/api/pdf/paid',{orderId:'order_fixture',draft:{values:{fullName:'Tampered'}}});assert.equal(response.status,200);
 assert.equal(rendered.watermark,false);assert.equal(rendered.draft.values.fullName,d.values.fullName);
 response=await post('/api/payment/status',{orderId:'order_fixture',draft:d});assert.deepEqual(await response.json(),{paid:true,matchesDraft:true});
 response=await post('/api/payment/status',{orderId:'order_fixture',draft:{...d,values:{...d.values,fullName:'Changed'}}});assert.deepEqual(await response.json(),{paid:true,matchesDraft:false});
 response=await post('/api/export/paid',{orderId:'order_fixture',format:'png',draft:{values:{fullName:'Tampered'}}});assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/png');assert.match(response.headers.get('content-disposition'),/\.png/);assert.equal(rendered.format,'png');assert.equal(rendered.watermark,false);assert.equal(rendered.draft.values.fullName,d.values.fullName);
 response=await post('/api/export/paid',{orderId:'order_fixture',format:'pdf'});assert.equal(response.status,200);assert.equal(rendered.format,'pdf');assert.equal(rendered.watermark,false);
 response=await post('/api/export/paid',{orderId:'order_fixture',format:'png'},otherCookie);assert.equal(response.status,403);
 response=await post('/api/export/free',{draft:d,format:'png',watermark:false,paid:true});assert.equal(response.status,200);assert.equal(rendered.watermark,true);assert.equal(rendered.format,'png');
 response=await post('/api/export/free',{draft:d,format:'exe'});assert.equal(response.status,400);
 response=await post('/api/pdf/free',{draft:d,watermark:false,paid:true});assert.equal(response.status,200);assert.equal(rendered.watermark,true);
 const eventBody=JSON.stringify({event:'payment.captured',payload:{payment:{entity:{id:'pay_fixture',order_id:'order_fixture'}}}});
 const webhookSignature=createHmac('sha256','fixture_webhook').update(eventBody).digest('hex');
 async function webhook(body,signature){return request(origin+'/api/payment/webhook',{method:'POST',headers:{'x-razorpay-signature':signature},body});}
 response=await webhook(eventBody,'0'.repeat(64));assert.equal(response.status,403,'forged webhooks cannot update orders');
 response=await webhook(eventBody,webhookSignature);assert.equal(response.status,200,'signed captured webhooks succeed');
 response=await webhook(eventBody,webhookSignature);assert.equal(response.status,200,'webhook retries are idempotent');
 response=await webhook(eventBody+' ',webhookSignature);assert.equal(response.status,403,'webhook verification uses exact raw bytes');
 refunded=1;response=await post('/api/pdf/paid',{orderId:'order_fixture'});assert.equal(response.status,409,'even partial refunds block clean downloads');
 refunded=0;
 paid=false;response=await post('/api/pdf/paid',{orderId:'order_fixture'});assert.equal(response.status,409);
 response=await post('/api/export/paid',{orderId:'order_fixture',format:'png'});assert.equal(response.status,409);
 console.log('PASS: backend rejects tampering, unauthorized sessions, uncaptured/wrong-amount payments; verifies and renders the bound snapshot only.');
})().catch(error=>{console.error(error);process.exitCode=1;});


