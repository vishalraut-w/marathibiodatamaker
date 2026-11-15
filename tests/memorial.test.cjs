'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../memorial-data.js'),{handler}=require('../server/index.cjs');
test('memorial drafts retain custom rows and their order while rejecting remote images',()=>{
 const source=M.fresh();source.templateId='deep';source.photo='https://example.com/photo.jpg';source.rows=[{type:'name',label:'नाव',value:'स्व. माधव पाटील'},{type:'text',label:'संपर्क',value:'९८७६५'},{type:'heading',label:'शीर्षक',value:'स्मरण'}];
 const d=M.normalize(source);assert.equal(d.templateId,'deep');assert.equal(d.photo,null);assert.deepEqual(d.rows.map(row=>row.label),['नाव','संपर्क','शीर्षक']);
 assert.equal(M.normalize({rows:Array.from({length:30},()=>({type:'text',value:'a'}))}).rows.length,20);
 assert.equal(M.normalize({templateId:'unknown',rows:[{type:'bad',label:'x',value:'y'}]}).rows[0].type,'text');
});
test('memorial pages and all their resources are available from the server',async()=>{
 for(const file of ['varshradh-templates.html','varshradh-builder.html','memorial.css','memorial-data.js','memorial-app.js','memorial-renderer.js']){
  assert.ok(fs.existsSync(path.resolve(__dirname,'..',file)));const res={setHeader(){},writeHead(status){this.status=status;this.headersSent=true;},end(){}};await handler({method:'GET',url:'/'+file,headers:{}},res);assert.equal(res.status,200,file);
 }
});
