'use strict';
const assert=require('node:assert/strict'),{Readable}=require('node:stream');
process.env.VERCEL='1';process.env.APP_ORIGIN='https://patrika.example';process.env.PAYMENTS_ENABLED='true';
process.env.RAZORPAY_KEY_ID='rzp_live_fixture';process.env.RAZORPAY_KEY_SECRET='fixture_secret';
process.env.PAYMENT_TOKEN_SECRET='fixture_payment_token_secret_at_least_32_characters';delete process.env.ALLOW_LIVE_PAYMENTS;
const {handler}=require('../server/index.cjs');
(async()=>{
 const req=Readable.from([]);req.url='/api/config';req.method='GET';req.socket={remoteAddress:'fixture'};req.headers={};
 const headers=new Headers();let status=200,data;
 const res={headersSent:false,setHeader(k,v){headers.set(k,v);},writeHead(code,values){status=code;this.headersSent=true;for(const [k,v]of Object.entries(values))headers.set(k,v);},end(value){data=value;}};
 await handler(req,res);const response=new Response(data,{status,headers}),config=await response.json();
 assert.equal(config.paymentsEnabled,false);assert.equal(config.keyId,null);
 console.log('PASS: a live Razorpay key remains disabled until ALLOW_LIVE_PAYMENTS is explicitly set.');
})().catch(error=>{console.error(error);process.exitCode=1;});
