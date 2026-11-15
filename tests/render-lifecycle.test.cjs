'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module');
const P=require('../data.js');
test('each export gets its own browser and closes it on success and failure',async()=>{
 const originalLoad=Module._load,oldVercel=process.env.VERCEL,instances=[];
 let extracts=0,failNextPage=false;
 const fakeChromium={args:['--single-process'],executablePath:async()=>{extracts++;return '/tmp/chromium';}};
 const fakePlaywright={chromium:{async launch(options){
  assert.equal(options.executablePath,'/tmp/chromium');
  const instance={closed:false,contextClosed:false,async newContext(){
   return {async newPage(){if(failNextPage){failNextPage=false;throw Error('simulated page failure');}return {
    setDefaultTimeout(){},async route(){},async setContent(){},async addScriptTag(){},async evaluate(){return {fits:true,imageError:false};},
    async pdf(){return Buffer.from('%PDF fixture');},locator(){return {async screenshot(){return Buffer.from('PNG fixture');}};}
   };},async close(){instance.contextClosed=true;}};
  },async close(){instance.closed=true;}};
  instances.push(instance);return instance;
 }}};
 Module._load=function(name,...args){if(name==='playwright-core')return fakePlaywright;if(name==='@sparticuz/chromium')return fakeChromium;return originalLoad.call(this,name,...args);};
 process.env.VERCEL='1';const pdf=require('../server/pdf.cjs');
 try{
  await pdf.makePDF(P.demo(),true,'pdf');await pdf.makePDF(P.demo(),true,'png');
  assert.equal(instances.length,2);assert.notEqual(instances[0],instances[1]);
  assert.ok(instances.every(b=>b.closed&&b.contextClosed));assert.equal(extracts,1,'binary extraction may be safely reused');
  failNextPage=true;await assert.rejects(pdf.makePDF(P.demo(),true,'pdf'),/simulated page failure/);
  assert.ok(instances[2].closed&&instances[2].contextClosed,'failed page creation still closes its browser');
  await pdf.makePDF(P.demo(),true,'pdf');assert.ok(instances[3].closed,'a later request works after an error');
  await Promise.all([pdf.makePDF(P.demo(),true,'pdf'),pdf.makePDF(P.demo(),false,'png')]);
  assert.notEqual(instances[4],instances[5]);assert.ok(instances[4].closed&&instances[5].closed);
 }finally{await pdf.close();Module._load=originalLoad;if(oldVercel===undefined)delete process.env.VERCEL;else process.env.VERCEL=oldVercel;}
});
