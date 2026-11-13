'use strict';
// Redis TTL matches the signed session lifetime. Memory storage is test-only.
const memory=process.env.NODE_ENV==='test'&&process.env.ORDERS_DATABASE===':memory:'?new Map():null;
const url=process.env.UPSTASH_REDIS_REST_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN;
const configured=!!memory||!!(url&&token);
async function command(args){
 if(!configured)throw Object.assign(Error('Payment storage is not configured.'),{status:503});
 const response=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(10000)});
 const body=await response.json();
 if(!response.ok||body.error)throw Object.assign(Error('Payment storage is temporarily unavailable.'),{status:503});
 return body.result;
}
async function get(id){
 if(!id)return null;
 const value=memory?memory.get(id):await command(['GET','mpm:order:'+id]);
 return value?JSON.parse(value):null;
}
async function set(order){
 const ttl=Math.max(1,Math.ceil((order.created+30*86400000-Date.now())/1000));
 if(memory)memory.set(order.id,JSON.stringify(order));
 else await command(['SET','mpm:order:'+order.id,JSON.stringify(order),'EX',ttl]);
}
async function update(id,changes){const order=await get(id);if(order)await set({...order,...changes});}
module.exports={configured,get,set,update};
