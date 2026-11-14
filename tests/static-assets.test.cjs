'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=require('../data.js'),{handler}=require('../server/index.cjs');
const root=path.resolve(__dirname,'..');
const pages=['index.html','templates.html','buddhist-templates.html','christian-templates.html','islamic-templates.html','builder.html','islamic-builder.html','preview.html','download.html','privacy.html'];
async function get(url){
 const res={setHeader(){},writeHead(status){this.status=status;this.headersSent=true;},end(body){this.body=body;}};
 await handler({method:'GET',url,headers:{}},res);return res;
}
test('all page links and local images, styles, and scripts exist and are served',async()=>{
 const resources=new Set(pages);
 for(const page of pages){
  const html=fs.readFileSync(path.join(root,page),'utf8');
  for(const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){
   const url=match[1];if(/^(?:#|https?:|data:|mailto:|tel:|\/\/)/i.test(url))continue;
   const file=url.split(/[?#]/,1)[0];if(file)resources.add(file.replace(/^\.\//,''));
  }
 }
 for(const h of P.headers)if(h.file)resources.add(h.file);
 for(const file of resources){
  assert.ok(fs.existsSync(path.join(root,file)),`${file} exists`);
  assert.equal((await get('/'+file)).status,200,`${file} is served`);
 }
});
