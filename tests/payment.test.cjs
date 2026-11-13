const test=require('node:test'),assert=require('node:assert/strict'),{createHmac}=require('node:crypto');
const {signatureIsValid,capturedPayment,webhookIsValid}=require('../server/payment.cjs');
const P=require('../data.js');
test('only the expected order and exact captured INR amount can unlock',()=>{
 const good={id:'pay_one',order_id:'order_one',status:'captured',captured:true,amount:4900,currency:'INR',amount_refunded:0};
 assert.equal(capturedPayment(good,'order_one'),true);
 for(const patch of [{order_id:'order_other'},{amount:49},{amount:4901},{currency:'USD'},{captured:false},{status:'authorized'},{amount_refunded:4900}])assert.equal(capturedPayment({...good,...patch},'order_one'),false);
});
test('checkout and webhook signatures reject forged or changed payloads',()=>{
 const secret='fixture-only-secret',sig=createHmac('sha256',secret).update('order_one|pay_one').digest('hex');
 assert.equal(signatureIsValid('order_one','pay_one',sig,secret),true);
 assert.equal(signatureIsValid('order_other','pay_one',sig,secret),false);
 assert.equal(signatureIsValid('order_one','pay_other',sig,secret),false);
 assert.equal(signatureIsValid('order_one','pay_one','paid',secret),false);
 const raw=Buffer.from('{"event":"payment.captured"}'),ws=createHmac('sha256',secret).update(raw).digest('hex');
 assert.equal(webhookIsValid(raw,ws,secret),true);assert.equal(webhookIsValid(Buffer.from('{}'),ws,secret),false);
});
test('draft migration preserves typed data and hidden fields; remote images are rejected',()=>{
 const legacy=P.fresh();legacy.templateId='mangal-gold';legacy.values.kuldaivat='श्री खंडोबा, जेजुरी';legacy.values.phone='९८७६५ ४३२१०';legacy.hidden.contact=['phone'];legacy.photo='https://example.com/private.jpg';
 const d=P.normalize(legacy);assert.equal(d.values.kuldaivat,legacy.values.kuldaivat);assert.equal(d.photo,null);assert.equal(P.entries(d,'contact').length,0);
});
test('empty values disappear, HTML is escaped, and custom order is retained',()=>{
 const d=P.fresh();d.values.fullName='<script>alert(1)</script>';d.custom.family=[{id:'custom_mama',label:'मामा',value:'चाचणी'}];d.order.family.unshift('custom_mama');d.values.father='   ';
 const n=P.normalize(d);assert.equal(P.entries(n,'family').length,1);assert.equal(P.entries(n,'family')[0].label,'मामा');assert.match(P.esc(n.values.fullName),/&lt;script&gt;/);
});

