'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {normalizeOrigin,requestIsAllowed}=require('../server/origin.cjs');
test('configured URLs normalize to an origin',()=>{
 assert.equal(normalizeOrigin('https://biodata.example/download.html/'),'https://biodata.example');
 assert.equal(normalizeOrigin('not-a-url'),null);
 assert.equal(normalizeOrigin('https://user:secret@example.com'),null);
});
test('Vercel production, preview and custom domains accept their same-origin requests',()=>{
 const previous=process.env.VERCEL;process.env.VERCEL='1';
 try{
  for(const host of ['marathibiodatamaker.vercel.app','marathibiodatamaker-preview-team.vercel.app','biodata.example']){
   assert.equal(requestIsAllowed({headers:{host,origin:'https://'+host}},'https://old-domain.example'),true);
   assert.equal(requestIsAllowed({headers:{host,origin:'https://attacker.example'}},'https://old-domain.example'),false);
   assert.equal(requestIsAllowed({headers:{host,origin:'https://another-project.vercel.app'}},'https://old-domain.example'),false);
   assert.equal(requestIsAllowed({headers:{host,origin:'https://attacker.example','x-forwarded-host':'attacker.example'}},'https://old-domain.example'),false);
  }
  for(const origin of [undefined,'null','https://biodata.example/evil','http://biodata.example']){
   assert.equal(requestIsAllowed({headers:{host:'biodata.example',origin}},'https://old-domain.example'),false);
  }
 }finally{if(previous===undefined)delete process.env.VERCEL;else process.env.VERCEL=previous;}
});
test('outside Vercel only the configured origin is accepted',()=>{
 const previous=process.env.VERCEL;delete process.env.VERCEL;
 try{
  assert.equal(requestIsAllowed({headers:{origin:'https://biodata.example'}},'https://biodata.example/'),true);
  assert.equal(requestIsAllowed({headers:{host:'attacker.example',origin:'https://attacker.example'}},'https://biodata.example'),false);
 }finally{if(previous!==undefined)process.env.VERCEL=previous;}
});
