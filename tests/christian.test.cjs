'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const P=require('../data.js'),root=path.resolve(__dirname,'..'),app=fs.readFileSync(path.join(root,'app.js'),'utf8');
function contextFor(draft){
 const handlers={},elements=Object.fromEntries(['header-options','header-current','header-image-preview','header-remove','invocation'].map(id=>[id,{innerHTML:'',textContent:'',value:'',hidden:false}]));
 const storage={value:JSON.stringify(draft),getItem(){return this.value;},setItem(_k,v){this.value=v;}};
 const document={body:{dataset:{page:'test'}},querySelector:s=>elements[s.slice(1)]||null,addEventListener:(name,fn)=>{handlers[name]=fn;}};
 const location={href:''},context=vm.createContext({Patrika:P,PatrikaRender:{},document,localStorage:storage,location,window:{addEventListener(){}},ResizeObserver:class{},setTimeout,clearTimeout,Intl});
 vm.runInContext(app,context);return {context,handlers,elements,storage,location};
}
test('five Buddhist and five Christian lightweight PNG image choices are available',()=>{
 for(const religion of ['buddhist','christian']){
  const items=P.headers.filter(h=>h.religion===religion&&h.file?.endsWith('.png'));
  assert.equal(items.length,5);
  for(const item of items){const data=fs.readFileSync(path.join(root,item.file));assert.equal(data.subarray(1,4).toString(),'PNG');assert.equal(data.readUInt32BE(16),256);assert.equal(data.readUInt32BE(20),256);assert.equal(data[25],6);assert.ok(data.length<70000,item.file);}
 }
});
test('Christian gallery has 15 separate selectable designs and clean sample defaults',()=>{
 const designs=P.templates.filter(t=>t.religion==='christian');assert.equal(designs.length,15);
 assert.equal(new Set(designs.map(t=>t.id)).size,15);assert.equal(designs.filter(t=>t.photo).length,8);assert.equal(designs.filter(t=>!t.photo).length,7);
 globalThis.Patrika=P;require('../renderer.js');
 for(const design of designs){assert.equal(P.normalize({templateId:design.id}).templateId,design.id);assert.doesNotMatch(PatrikaRender.border(design),/NaN|undefined/);}
 const {context}=contextFor(P.fresh());const sample=vm.runInContext("sampleDraft(Patrika.templates.find(t=>t.id==='christian-grace'))",context);
 assert.equal(sample.header,'christian-cross');assert.equal(sample.values.religion,'ख्रिश्चन');assert.equal(sample.values.invocation,'');assert.equal(sample.values.kuldaivat,'');
});
test('Christian selection opens the main builder and preserves custom details',()=>{
 const fresh=contextFor(P.fresh());fresh.handlers.click({target:{closest:s=>s==='[data-choose]'?{dataset:{choose:'christian-grace'}}:null}});
 const selected=JSON.parse(fresh.storage.value);assert.equal(fresh.location.href,'builder.html');assert.equal(selected.header,'christian-cross');assert.equal(selected.values.invocation,'');assert.equal(selected.values.religion,'ख्रिश्चन');
 const custom=P.fresh();custom.values.invocation='माझी स्वतःची ओळ';custom.values.fullName='माझे नाव';custom.header='om';
 const saved=contextFor(custom);saved.handlers.click({target:{closest:s=>s==='[data-choose]'?{dataset:{choose:'christian-night'}}:null}});
 const next=JSON.parse(saved.storage.value);assert.equal(next.header,'om');assert.equal(next.values.invocation,'माझी स्वतःची ओळ');assert.equal(next.values.fullName,'माझे नाव');
});
test('shared builder offers both image groups and preserves a custom blessing',()=>{
 const draft=P.fresh();draft.values.invocation='माझी स्वतःची ओळ';const env=contextFor(draft);
 vm.runInContext('renderHeaders()',env.context);
 for(const religion of ['buddhist','christian'])for(const h of P.headers.filter(h=>h.religion===religion&&h.file?.endsWith('.png')))assert.ok(env.elements['header-options'].innerHTML.includes('data-header="'+h.id+'"'),h.id);
 assert.doesNotMatch(env.elements['header-options'].innerHTML,/data-header="dhamma-wheel"|data-header="islamic-allah"/);
 vm.runInContext("chooseHeader('christian-jesus')",env.context);assert.equal(JSON.parse(env.storage.value).values.invocation,'माझी स्वतःची ओळ');
 const standard=contextFor(P.fresh());vm.runInContext("chooseHeader('buddhist-buddha')",standard.context);assert.equal(JSON.parse(standard.storage.value).values.invocation,'');
});
test('Christian page and images are served from the same menu',async()=>{
 const {handler}=require('../server/index.cjs');async function get(url){const res={setHeader(){},writeHead(status){this.status=status;this.headersSent=true;},end(body){this.body=body;}};await handler({method:'GET',url,headers:{}},res);return res;}
 for(const url of ['/christian-templates.html','/assets/buddhist-ambedkar.png','/assets/christian-jesus.png'])assert.equal((await get(url)).status,200,url);
 assert.match((await get('/index.html')).body.toString(),/href="christian-templates\.html"/);
});
