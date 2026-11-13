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
  console.log('PASS: serverless Chromium exports PDF and PNG using bundled fonts and assets.');
 })().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>pdf.close());
}
