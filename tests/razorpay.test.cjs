'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createGateway,razorpay}=require('../server/payment.cjs');

test('SDK adapter creates orders and fetches payments for checkout recovery',async()=>{
 const calls=[];
 const gateway=createGateway({
  orders:{
   async create(body){calls.push(['create',body]);return {id:'order_test',...body};},
   async fetchPayments(id){calls.push(['fetchPayments',id]);return {items:[{id:'pay_test'}]};}
  },
  payments:{async fetch(id){calls.push(['fetch',id]);return {id,status:'captured'};}}
 });
 const order={amount:3500,currency:'INR',partial_payment:false};
 assert.deepEqual(await gateway('orders','POST',order),{id:'order_test',...order});
 assert.equal((await gateway('payments/pay_test')).status,'captured');
 assert.equal((await gateway('orders/order_test/payments')).items[0].id,'pay_test');
 assert.deepEqual(calls,[['create',order],['fetch','pay_test'],['fetchPayments','order_test']]);
});

test('gateway failures are sanitized and unsupported operations never call the SDK',async()=>{
 let calls=0;
 const gateway=createGateway({orders:{async create(){calls++;throw {statusCode:401,error:{description:'private merchant details'}};}}});
 await assert.rejects(gateway('orders','POST',{}),error=>error.status===502&&!error.message.includes('private merchant'));
 await assert.rejects(gateway('refunds','POST',{}),error=>error.status===400);
 assert.equal(calls,1);
});

test('missing credentials fail closed before SDK initialization',async()=>{
 const id=process.env.RAZORPAY_KEY_ID,secret=process.env.RAZORPAY_KEY_SECRET;
 delete process.env.RAZORPAY_KEY_ID;delete process.env.RAZORPAY_KEY_SECRET;
 try{await assert.rejects(razorpay('orders','POST',{}),error=>error.status===503);}
 finally{
  if(id!==undefined)process.env.RAZORPAY_KEY_ID=id;
  if(secret!==undefined)process.env.RAZORPAY_KEY_SECRET=secret;
 }
});
