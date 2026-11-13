'use strict';
// Run on Linux CI to exercise the same browser configuration used by Vercel.
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
