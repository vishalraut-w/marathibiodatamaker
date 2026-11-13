'use strict';
const {createHmac,randomBytes,timingSafeEqual}=require('node:crypto');

const ORDER_TOKEN_TTL_MS=15*60*1000;
const DOWNLOAD_TOKEN_TTL_MS=30*60*1000;
const INVALID_TOKEN='पेमेंटचा सुरक्षित दुवा कालबाह्य झाला आहे. कृपया पुन्हा पेमेंट सुरू करा.';

function fail(message,status=403){return Object.assign(Error(message),{status});}
function configured(){return typeof process.env.PAYMENT_TOKEN_SECRET==='string'&&process.env.PAYMENT_TOKEN_SECRET.length>=32;}
function secretOrFail(secret){
 const value=secret||process.env.PAYMENT_TOKEN_SECRET;
 if(typeof value!=='string'||value.length<32)throw fail('पेमेंटची सुरक्षित रचना उपलब्ध नाही. कृपया नंतर पुन्हा प्रयत्न करा.',503);
 return value;
}
function encode(value){return Buffer.from(JSON.stringify(value)).toString('base64url');}
function decode(value){
 try{return JSON.parse(Buffer.from(value,'base64url').toString('utf8'));}
 catch{throw fail(INVALID_TOKEN);}
}
function mac(value,secret){return createHmac('sha256',secret).update(value).digest('base64url');}
function ttlFor(type){return type==='order'?ORDER_TOKEN_TTL_MS:type==='download'?DOWNLOAD_TOKEN_TTL_MS:0;}

function issue(type,claims,{ttlMs=ttlFor(type),now=Date.now(),secret}={}){
 if(!ttlMs)throw Error('Unsupported token type.');
 const key=secretOrFail(secret),issued=Math.floor(now/1000),expires=issued+Math.ceil(ttlMs/1000);
 const payload={v:1,t:type,iat:issued,exp:expires,jti:randomBytes(12).toString('base64url'),...claims};
 const encoded=encode(payload);
 return encoded+'.'+mac(encoded,key);
}

function verify(token,type,{now=Date.now(),secret}={}){
 const key=secretOrFail(secret);
 if(typeof token!=='string'||token.length>4096)throw fail(INVALID_TOKEN);
 const [encoded,signature,...extra]=token.split('.');
 if(extra.length||!encoded||!signature||!/^[A-Za-z0-9_-]+$/.test(encoded)||!/^[A-Za-z0-9_-]+$/.test(signature))throw fail(INVALID_TOKEN);
 const expected=Buffer.from(mac(encoded,key)),provided=Buffer.from(signature);
 if(expected.length!==provided.length||!timingSafeEqual(expected,provided))throw fail(INVALID_TOKEN);
 const payload=decode(encoded),maxTtl=Math.ceil(ttlFor(type)/1000),time=Math.floor(now/1000);
 if(!payload||payload.v!==1||payload.t!==type||!Number.isSafeInteger(payload.iat)||!Number.isSafeInteger(payload.exp)||payload.exp<=payload.iat||payload.exp-payload.iat>maxTtl||payload.iat>time+60||payload.exp<=time)throw fail(INVALID_TOKEN);
 return payload;
}

module.exports={ORDER_TOKEN_TTL_MS,DOWNLOAD_TOKEN_TTL_MS,INVALID_TOKEN,configured,issue,verify};
