'use strict';
// Vercel and GitHub Actions run the bundled Linux Chromium. It cannot launch on Windows.
if(process.platform==='win32'){
 console.log('SKIP: renderer smoke test requires Linux (it runs in GitHub Actions and Vercel).');
}else{
 process.env.VERCEL='1';
 const assert=require('node:assert/strict'),P=require('../data.js'),pdf=require('../server/pdf.cjs');
 (async()=>{
  const draft=P.demo();
  const document=await pdf.makePDF(draft,true,'pdf');
  assert.equal(document.subarray(0,5).toString(),'%PDF-');
  const image=await pdf.makePDF(draft,true,'png');
  assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const islamic=P.demo('islamic');islamic.values.fullName='عائشہ خان';islamic.header='islamic-allah';
  const islamicPdf=await pdf.makePDF(islamic,true,'pdf');assert.equal(islamicPdf.subarray(0,5).toString(),'%PDF-');
  const islamicPng=await pdf.makePDF(islamic,true,'png');assert.equal(islamicPng.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const christian=P.demo();christian.templateId='christian-grace';christian.header='christian-jesus';christian.values.invocation='';
  const christianPdf=await pdf.makePDF(christian,true,'pdf');assert.equal(christianPdf.subarray(0,5).toString(),'%PDF-');
  const christianPng=await pdf.makePDF(christian,true,'png');assert.equal(christianPng.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const memorial=require('../memorial-data.js').demo();
  const memorialPdf=await pdf.makePDF(memorial,true,'pdf');assert.equal(memorialPdf.subarray(0,5).toString(),'%PDF-');
  const memorialPng=await pdf.makePDF(memorial,true,'png');assert.equal(memorialPng.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const [parallelPdf,parallelPng]=await Promise.all([pdf.makePDF(P.demo(),true,'pdf'),pdf.makePDF(memorial,true,'png')]);
  assert.equal(parallelPdf.subarray(0,5).toString(),'%PDF-');assert.equal(parallelPng.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  console.log('PASS: serverless Chromium exports PDF and PNG using bundled fonts and assets.');
 })().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>pdf.close());
}
