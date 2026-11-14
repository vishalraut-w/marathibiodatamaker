'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../data.js');
const app=fs.readFileSync(require.resolve('../app.js'),'utf8');
function selectTemplate(draft,id){
 const handlers={},store={value:JSON.stringify(draft)},location={href:''};
 const document={body:{dataset:{page:'test'}},querySelector:()=>null,addEventListener:(name,fn)=>{handlers[name]=fn;}};
 const localStorage={getItem:()=>store.value,setItem:(_key,value)=>{store.value=value;}};
 const context={Patrika:P,PatrikaRender:{},document,localStorage,location,window:{addEventListener(){}},ResizeObserver:class{},setTimeout,clearTimeout,Intl};
 vm.runInNewContext(app,context);
 handlers.click({target:{closest:selector=>selector==='[data-choose]'?{dataset:{choose:id}}:null}});
 return {draft:JSON.parse(store.value),href:location.href};
}
test('Buddhist selection uses suitable defaults and keeps custom details',()=>{
 const fresh=P.fresh();fresh.values.fullName='Test Name';
 const result=selectTemplate(fresh,'buddha-dhamma');
 assert.equal(result.href,'builder.html');assert.equal(result.draft.templateId,'buddha-dhamma');
 assert.equal(result.draft.header,'none');assert.equal(result.draft.values.invocation,'बुद्धं शरणं गच्छामि');
 assert.equal(result.draft.values.religion,'बौद्ध');assert.equal(result.draft.values.fullName,'Test Name');
 fresh.header='om';fresh.values.invocation='Custom words';fresh.values.religion='Custom religion';
 const custom=selectTemplate(fresh,'buddha-blue').draft;
 assert.equal(custom.header,'om');assert.equal(custom.values.invocation,'Custom words');assert.equal(custom.values.religion,'Custom religion');
});
test('Buddhist gallery, wheel asset and homepage menu are served',async()=>{
 const {handler}=require('../server/index.cjs');
 async function get(url){
  const res={setHeader(){},writeHead(status){this.status=status;this.headersSent=true;},end(body){this.body=body;}};
  await handler({method:'GET',url,headers:{}},res);return res;
 }
 for(const path of ['/buddhist-templates.html','/assets/dharma-wheel.svg','/home.js','/home.css','/transliterator.js'])assert.equal((await get(path)).status,200,path);
 assert.match((await get('/index.html')).body.toString(),/href="buddhist-templates\.html"/);
 assert.equal(P.templates.filter(t=>t.religion==='buddhist').length,15);
 assert.equal(P.templates.filter(t=>!t.religion).length,56);
});
test('seven new Buddhist designs have distinct frames, colors and selectable IDs',()=>{
 const designs=P.templates.filter(t=>t.religion==='buddhist'),added=designs.slice(8);
 assert.equal(added.length,7);assert.equal(new Set(added.map(t=>t.id)).size,7);
 assert.equal(new Set(added.map(t=>t.border)).size,7);assert.equal(new Set(added.map(t=>t.color)).size,7);
 assert.equal(designs.filter(t=>t.photo).length,8);assert.equal(designs.filter(t=>!t.photo).length,7);
 globalThis.Patrika=P;require('../renderer.js');
 const frames=added.map(t=>{
  assert.equal(P.normalize({templateId:t.id}).templateId,t.id);
  const svg=PatrikaRender.border(t);assert.match(svg,/<svg/);assert.doesNotMatch(svg,/undefined|NaN/);return svg;
 });
 assert.equal(new Set(frames).size,7);
});
