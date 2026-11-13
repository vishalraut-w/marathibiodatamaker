const test=require('node:test'),assert=require('node:assert/strict'),{createHmac}=require('node:crypto');
const {signatureIsValid,capturedPayment}=require('../server/payment.cjs');
const tokens=require('../server/tokens.cjs');
const P=require('../data.js');
test('only the expected order and exact captured INR amount can unlock',()=>{
 const good={id:'pay_one',order_id:'order_one',status:'captured',captured:true,amount:4900,currency:'INR',amount_refunded:0};
 assert.equal(capturedPayment(good,'order_one'),true);
 for(const patch of [{order_id:'order_other'},{amount:49},{amount:4901},{currency:'USD'},{captured:false},{status:'authorized'},{amount_refunded:4900}])assert.equal(capturedPayment({...good,...patch},'order_one'),false);
});
test('checkout signatures reject forged or changed payment identities',()=>{
 const secret='fixture-only-secret',sig=createHmac('sha256',secret).update('order_one|pay_one').digest('hex');
 assert.equal(signatureIsValid('order_one','pay_one',sig,secret),true);
 assert.equal(signatureIsValid('order_other','pay_one',sig,secret),false);
 assert.equal(signatureIsValid('order_one','pay_other',sig,secret),false);
 assert.equal(signatureIsValid('order_one','pay_one','paid',secret),false);
});
test('signed stateless tokens bind a payment order to one draft and expire',()=>{
 const secret='fixture-token-secret-that-is-at-least-32-characters',now=1_700_000_000_000;
 const claims={orderId:'order_one',draftDigest:'a'.repeat(64),amount:4900,currency:'INR'};
 const token=tokens.issue('order',claims,{secret,now});
 const verified=tokens.verify(token,'order',{secret,now:now+1});
 assert.equal(verified.orderId,claims.orderId);assert.equal(verified.draftDigest,claims.draftDigest);assert.equal(verified.amount,4900);assert.equal(verified.currency,'INR');
 assert.throws(()=>tokens.verify(token+'x','order',{secret,now}),error=>error.status===403);
 assert.throws(()=>tokens.verify(token,'download',{secret,now}),error=>error.status===403);
 assert.throws(()=>tokens.verify(token,'order',{secret,now:now+tokens.ORDER_TOKEN_TTL_MS}),error=>error.status===403);
 const download=tokens.issue('download',{...claims,paymentId:'pay_one'},{secret,now});
 assert.throws(()=>tokens.verify(download,'download',{secret,now:now+tokens.DOWNLOAD_TOKEN_TTL_MS}),error=>error.status===403);
});
test('draft migration preserves typed data and hidden fields; remote images are rejected',()=>{
 const legacy=P.fresh();legacy.templateId='mangal-gold';legacy.values.kuldaivat='श्री खंडोबा, जेजुरी';legacy.values.phone='९८७६५ ४३२१०';legacy.hidden.contact=['phone'];legacy.photo='https://example.com/private.jpg';
 const d=P.normalize(legacy);assert.equal(d.values.kuldaivat,legacy.values.kuldaivat);assert.equal(d.photo,null);assert.equal(P.entries(d,'contact').length,0);
});
test('empty values disappear, HTML is escaped, and custom order is retained',()=>{
 const d=P.fresh();d.values.fullName='<script>alert(1)</script>';d.custom.family=[{id:'custom_mama',label:'मामा',value:'चाचणी'}];d.order.family.unshift('custom_mama');d.values.father='   ';
 const n=P.normalize(d);assert.equal(P.entries(n,'family').length,1);assert.equal(P.entries(n,'family')[0].label,'मामा');assert.match(P.esc(n.values.fullName),/&lt;script&gt;/);
});

