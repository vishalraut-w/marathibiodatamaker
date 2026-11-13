'use strict';
function normalizeOrigin(value){
 try{
  const url=new URL(value);
  return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.origin:null;
 }catch{return null;}
}
function requestIsAllowed(req,configuredOrigin){
 const origin=req.headers.origin;
 if(typeof origin!=='string'||origin==='null')return false;
 // Browsers send a serialized origin, never a path, credentials or a query.
 if(normalizeOrigin(origin)!==origin)return false;
 if(origin===normalizeOrigin(configuredOrigin))return true;
 if(!process.env.VERCEL)return false;
 // A Vercel project can have production, preview and custom domain aliases.
 // Compare with this request's Host, rather than allowing all vercel.app sites
 // or trusting a client-provided X-Forwarded-Host header.
 const host=req.headers.host;
 if(typeof host!=='string')return false;
 return origin==='https://'+host.toLowerCase();
}
module.exports={normalizeOrigin,requestIsAllowed};
