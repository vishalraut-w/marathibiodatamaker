'use strict';
const fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const P=require('../data.js');
const allowedAssets=new Set(['/assets/noto-devanagari.ttf',...P.headers.filter(h=>h.file).map(h=>'/'+h.file)]);
let browserPromise,active=0;
async function browser(){
 const {chromium}=require('playwright-core');
 if(!browserPromise)browserPromise=(async()=>{
  const options={headless:true};
  if(process.env.VERCEL){
   const binary=require('@sparticuz/chromium');
   options.args=binary.args;options.executablePath=await binary.executablePath();
  }else if(process.env.BROWSER_EXECUTABLE_PATH)options.executablePath=process.env.BROWSER_EXECUTABLE_PATH;
  else options.channel=process.env.BROWSER_CHANNEL||'msedge';
  const instance=await chromium.launch(options);
  instance.on('disconnected',()=>{browserPromise=null;});return instance;
 })().catch(error=>{browserPromise=null;throw error;});
 return browserPromise;
}
// Keep the original function name for compatibility; both exports share A4 geometry.
async function makePDF(draft,watermark,format='pdf'){
 if(!['pdf','png'].includes(format))throw Object.assign(Error('PDF किंवा PNG प्रकार निवडा.'),{status:400});
 if(active>=2)throw Object.assign(Error('कृपया काही क्षणांनी पुन्हा प्रयत्न करा.'),{status:429});
 active++;let context;
 try{
  const b=await browser();context=await b.newContext({viewport:{width:794,height:1123},deviceScaleFactor:format==='png'?2:1});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  await page.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.hostname!=='render.local'||!allowedAssets.has(url.pathname))return route.abort();
   const data=await fs.readFile(path.join(root,url.pathname));
   return route.fulfill({body:data,contentType:url.pathname.endsWith('.ttf')?'font/ttf':url.pathname.endsWith('.png')?'image/png':'image/svg+xml'});
  });
  const css=await fs.readFile(path.join(root,'paper.css'),'utf8');
  await page.setContent('<!doctype html><html lang="mr"><head><meta charset="utf-8"><title>परिचय पत्रिका · MarathiPatrikaMakers</title><base href="http://render.local/"><style>body{margin:0}'+css+'</style></head><body></body></html>');
  await page.addScriptTag({content:await fs.readFile(path.join(root,'data.js'),'utf8')});
  await page.addScriptTag({content:await fs.readFile(path.join(root,'renderer.js'),'utf8')});
  const fit=await page.evaluate(async ({draft,watermark})=>{
   const sheet=PatrikaRender.createSheet(draft,{watermark});document.body.append(sheet);const result=await PatrikaRender.readySheet(sheet);return {...result,imageError:[...sheet.querySelectorAll('img')].some(i=>!i.naturalWidth)};
  },{draft,watermark});
  if(fit.imageError)throw Object.assign(Error('चित्र उघडता आले नाही. कृपया चित्र पुन्हा निवडा.'),{status:422});
  if(!fit.fits)throw Object.assign(Error('माहिती एका पानात बसत नाही. कृपया तपशील थोडक्यात लिहा.'),{status:422});
  if(format==='png')return await page.locator('.biodata-paper').screenshot({type:'png',animations:'disabled',scale:'device'});
  return await page.pdf({format:'A4',printBackground:true,preferCSSPageSize:true,margin:{top:0,bottom:0,left:0,right:0}});
 }finally{active--;await context?.close();}
}
async function close(){const pending=browserPromise;browserPromise=null;if(pending)await(await pending).close();}
module.exports={makePDF,close};

