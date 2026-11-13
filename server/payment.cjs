'use strict';
const {createHmac,timingSafeEqual}=require('node:crypto');
const PRICE=4900,CURRENCY='INR';
function signatureIsValid(orderId,paymentId,signature,secret){
 if(!/^[a-f0-9]{64}$/i.test(signature||''))return false;
 const expected=createHmac('sha256',secret).update(orderId+'|'+paymentId).digest();
 return timingSafeEqual(expected,Buffer.from(signature,'hex'));
}
function capturedPayment(payment,orderId){
 return payment?.order_id===orderId&&payment.status==='captured'&&payment.captured===true&&payment.amount===PRICE&&payment.currency===CURRENCY&&!payment.amount_refunded;
}
function webhookIsValid(raw,signature,secret){
 if(!secret||!/^[a-f0-9]{64}$/i.test(signature||''))return false;
 return timingSafeEqual(createHmac('sha256',secret).update(raw).digest(),Buffer.from(signature,'hex'));
}
function createGateway(client){
 return async function(path,method='GET',body){
  let operation;
  if(path==='orders'&&method==='POST')operation=()=>client.orders.create(body);
  else if(method==='GET'&&/^payments\/[^/]+$/.test(path))operation=()=>client.payments.fetch(decodeURIComponent(path.split('/')[1]));
  else if(method==='GET'&&/^orders\/[^/]+\/payments$/.test(path))operation=()=>client.orders.fetchPayments(decodeURIComponent(path.split('/')[1]));
  else throw Object.assign(Error('Unsupported payment operation.'),{status:400});
  let timer;
  try{
   return await Promise.race([
    Promise.resolve().then(operation),
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Gateway timeout')),20000);})
   ]);
  }catch{
   // SDK errors can include merchant details; never expose them to the browser.
   throw Object.assign(Error('Payment service is temporarily unavailable. Please try again.'),{status:502});
  }finally{clearTimeout(timer);}
 };
}
let gateway;
async function razorpay(path,method='GET',body){
 if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET)throw Object.assign(Error('Payment credentials are not configured.'),{status:503});
 if(!gateway){
  const Razorpay=require('razorpay');
  gateway=createGateway(new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET}));
 }
 return gateway(path,method,body);
}
module.exports={PRICE,CURRENCY,signatureIsValid,capturedPayment,webhookIsValid,razorpay,createGateway};
