'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const P=require('../data.js'),root=path.resolve(__dirname,'..');
test('Islamic gallery has 16 separate designs and five compact transparent PNG assets',()=>{
 const designs=P.templates.filter(t=>t.religion==='islamic');
 assert.equal(designs.length,16);assert.equal(new Set(designs.map(t=>t.id)).size,16);
 assert.equal(new Set(designs.map(t=>t.border)).size,8);assert.equal(new Set(designs.map(t=>t.color)).size,16);
 assert.equal(designs.filter(t=>t.theme==='green').length,8);assert.equal(designs.filter(t=>t.theme==='gold').length,8);
 const luminance=color=>{const [r,g,b]=color.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b;};
 for(const design of designs){const a=luminance(design.color),b=luminance(design.background);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,design.id+' heading contrast');}
 assert.equal(designs.filter(t=>t.photo).length,8);assert.equal(designs.filter(t=>!t.photo).length,8);
 const headers=P.headers.filter(h=>h.religion==='islamic');assert.equal(headers.length,5);
 for(const h of headers){const bytes=fs.readFileSync(path.join(root,h.file));assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),256);assert.equal(bytes.readUInt32BE(20),256);assert.equal(bytes[25],6);assert.ok(bytes.length<70000,h.file);}
});
test('green and gold themes use separate border colors and matching artwork',()=>{
 globalThis.Patrika=P;globalThis.document={createElement:()=>({style:{setProperty(){}},innerHTML:''})};require('../renderer.js');
 const designs=P.templates.filter(t=>t.religion==='islamic');
 for(const t of designs){
  const svg=PatrikaRender.border(t),colors=[...new Set([...svg.matchAll(/(?:stroke|fill)="(#[0-9a-f]{6})"/gi)].map(m=>m[1]))];
  assert.deepEqual(colors,[t.color],t.id);
  const draft=P.fresh('islamic');draft.templateId=t.id;
  const paper=PatrikaRender.createSheet(draft);
  assert.ok(paper.className.split(' ').includes('islamic-art-'+t.theme+(t.dark?'-dark':'')),t.id);
  draft.header='islamic-allah';assert.ok(PatrikaRender.createSheet(draft).className.split(' ').includes('islamic-art-'+t.theme+(t.dark?'-dark':'')),t.id);
  draft.headerImage='data:image/png;base64,AAAA';assert.doesNotMatch(PatrikaRender.createSheet(draft).className,/islamic-art-/);
 }
});
test('Islamic templates have L-shaped corners and sect label choice accepts typed values',()=>{
 globalThis.Patrika=P;require('../renderer.js');
 for(const t of P.templates.filter(t=>t.religion==='islamic'))assert.match(PatrikaRender.border(t),/M35 105V35H105M689 35h70v70/);
 const draft=P.fresh('islamic');draft.values.sect='अपना विवरण';draft.labelOverrides.sect='फ़िरक़ा';
 const saved=P.normalize(JSON.parse(JSON.stringify(draft)));
 assert.equal(saved.values.sect,'अपना विवरण');assert.equal(P.entries(saved,'faith').find(r=>r.key==='sect').label,'फ़िरक़ा');
 saved.labelOverrides.sect='मसलक';assert.equal(P.entries(P.normalize(saved),'faith').find(r=>r.key==='sect').label,'मसलक');
 saved.labelOverrides.sect='invalid';assert.equal(P.normalize(saved).labelOverrides.sect,undefined);
 const document={body:{dataset:{page:'test',profile:'islamic'}},querySelector:()=>null,addEventListener(){}};
 const context=vm.createContext({Patrika:P,PatrikaRender:{},document,localStorage:{getItem:()=>JSON.stringify(draft)},window:{addEventListener(){}},ResizeObserver:class{},setTimeout,clearTimeout,Intl});
 vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
 const field=vm.runInContext("field('faith','sect',0,1)",context);
 assert.match(field,/data-label-choice="sect"/);assert.match(field,/मसलक/);assert.match(field,/फ़िरक़ा/);assert.match(field,/<input[^>]*data-field="sect"/);
});
test('Islamic community field lets the user choose either label and type a value',()=>{
 const draft=P.fresh('islamic');draft.values.community='अपना विवरण';
 for(const label of ['बिरादरी','समुदाय']){
  draft.labelOverrides.community=label;
  const saved=P.normalize(JSON.parse(JSON.stringify(draft)));
  const row=P.entries(saved,'faith').find(r=>r.key==='community');
  assert.equal(row.label,label);assert.equal(row.value,'अपना विवरण');
 }
 draft.labelOverrides.community='invalid';assert.equal(P.normalize(draft).labelOverrides.community,undefined);
 const document={body:{dataset:{page:'test',profile:'islamic'}},querySelector:()=>null,addEventListener(){}};
 const context=vm.createContext({Patrika:P,PatrikaRender:{},document,localStorage:{getItem:()=>JSON.stringify(draft)},window:{addEventListener(){}},ResizeObserver:class{},setTimeout,clearTimeout,Intl});
 vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
 const field=vm.runInContext("field('faith','community',0,1)",context);
 assert.match(field,/data-label-choice="community"/);assert.match(field,/<option value="बिरादरी"/);assert.match(field,/<option value="समुदाय"/);assert.match(field,/<input[^>]*data-field="community"/);
 const marathi=P.fresh();marathi.values.community='उदाहरण';marathi.labelOverrides.community='समाज';assert.equal(P.entries(P.normalize(marathi),'personal').find(r=>r.key==='community').label,'समाज');
});
test('Islamic builder offers all five image choices and can select Urdu Allah',()=>{
 const elements=Object.fromEntries(['header-options','header-current','header-image-preview','header-remove','invocation'].map(id=>[id,{innerHTML:'',textContent:'',value:'',hidden:false}]));
 let stored='';const document={body:{dataset:{page:'test',profile:'islamic'}},querySelector:s=>elements[s.slice(1)]||null,addEventListener(){}};
 const localStorage={getItem:()=>null,setItem:(_k,v)=>{stored=v;}};
 const context=vm.createContext({Patrika:P,PatrikaRender:{},document,localStorage,window:{addEventListener(){}},ResizeObserver:class{},setTimeout,clearTimeout,Intl});
 vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);vm.runInContext('renderHeaders()',context);
 for(const h of P.headers.filter(h=>h.religion==='islamic'))assert.ok(elements['header-options'].innerHTML.includes('data-header="'+h.id+'"'));
 assert.doesNotMatch(elements['header-options'].innerHTML,/data-header="ganesha"/);
 vm.runInContext("chooseHeader('islamic-allah')",context);assert.equal(JSON.parse(stored).header,'islamic-allah');assert.match(elements['header-image-preview'].innerHTML,/islamic-allah-urdu\.png/);
});
test('Islamic fields and Urdu text survive drafts and render in the biodata',()=>{
 const d=P.fresh('islamic');assert.deepEqual(Object.keys(P.sectionsFor(d)),['personal','faith','family','contact']);
 assert.ok(!Object.values(P.sectionsFor(d)).some(s=>s.fields.some(f=>['gotra','rashi','nakshatra'].includes(f[0]))));
 assert.deepEqual(P.entries(d,'faith'),[]);
 d.values.fullName='عائشہ خان';d.values.profession='शिक्षक';d.values.sect='अपनी पसंद';
 const restored=P.normalize(JSON.parse(JSON.stringify(d)));assert.equal(restored.profileType,'islamic');assert.equal(restored.values.fullName,'عائشہ خان');
 globalThis.Patrika=P;globalThis.document={createElement:()=>({style:{setProperty(){}},innerHTML:''})};require('../renderer.js');
 const html=PatrikaRender.createSheet(restored).innerHTML;
 assert.match(html,/निकाह बायोडाटा/);assert.match(html,/<dd dir="auto">عائشہ خان<\/dd>/);assert.match(html,/assets\/islamic-crescent\.png/);assert.doesNotMatch(html,/कुलदैवत|गोत्र|नक्षत्र/);
});
test('selecting an Islamic template saves a separate draft and opens the Islamic builder',()=>{
 const handlers={},stored={'mpm-fresh-v1':JSON.stringify({...P.fresh(),values:{invocation:'',fullName:'Existing'}})},original=stored['mpm-fresh-v1'];
 const document={body:{dataset:{page:'test',profile:'islamic'}},querySelector:()=>null,addEventListener:(name,fn)=>{handlers[name]=fn;}};
 const localStorage={getItem:k=>stored[k]||null,setItem:(k,v)=>{stored[k]=v;}};const location={href:''};
 vm.runInNewContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),{Patrika:P,PatrikaRender:{},document,localStorage,location,window:{addEventListener(){}},ResizeObserver:class{},setTimeout,clearTimeout,Intl});
 handlers.click({target:{closest:selector=>selector==='[data-choose]'?{dataset:{choose:'islamic-mehfil'}}:null}});
 assert.equal(location.href,'islamic-builder.html');assert.equal(stored['mpm-fresh-v1'],original);
 const selected=JSON.parse(stored['mpm-islamic-v1']);assert.equal(selected.templateId,'islamic-mehfil');assert.equal(selected.profileType,'islamic');assert.equal(selected.showPhoto,false);
});
test('Islamic preview reads the Islamic draft and keeps navigation in that flow',async()=>{
 const draft=P.fresh('islamic');draft.values.fullName='علی خان';let requestedKey='';
 const links=['templates.html','builder.html','preview.html','download.html'].map(href=>({href,getAttribute(){return this.href;},setAttribute(_k,v){this.href=v;}}));
 const els={'preview-sheet':{replaceChildren(){}},'fit-status':{classList:{toggle(){}}},'continue-download':{setAttribute(){}}};
 const document={body:{dataset:{page:'preview'}},querySelector:s=>els[s.slice(1)]||null,querySelectorAll:s=>s==='main a[href]'?links:[],addEventListener(){}};
 const R={createSheet:()=>({}),scaleSheet(){},readySheet:async()=>({fits:true})};
 const localStorage={getItem:key=>{requestedKey=key;return JSON.stringify(draft);}};
 const context={Patrika:P,PatrikaRender:R,document,localStorage,location:{search:'?profile=islamic'},window:{addEventListener(){}},ResizeObserver:class{observe(){}},setTimeout,clearTimeout,Intl};
 vm.runInNewContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(requestedKey,'mpm-islamic-v1');assert.deepEqual(links.map(x=>x.href),['islamic-templates.html','islamic-builder.html','preview.html?profile=islamic','download.html?profile=islamic']);
});
test('Islamic pages, helper and Urdu font are served with the profile route',async()=>{
 const {handler}=require('../server/index.cjs');
 async function get(url){const res={setHeader(){},writeHead(status){this.status=status;this.headersSent=true;},end(body){this.body=body;}};await handler({method:'GET',url,headers:{}},res);return res;}
 for(const url of ['/islamic-templates.html','/islamic-builder.html','/transliterator.js','/assets/noto-naskh-arabic.ttf'])assert.equal((await get(url)).status,200,url);
 const gallery=(await get('/islamic-templates.html')).body.toString();const main=gallery.slice(gallery.indexOf('<main'),gallery.indexOf('</main>'));
 assert.match(main,/href="islamic-builder\.html"/);assert.match(main,/href="preview\.html\?profile=islamic"/);assert.match(main,/href="download\.html\?profile=islamic"/);
 const builder=(await get('/islamic-builder.html')).body.toString();assert.match(builder,/data-profile="islamic"/);assert.match(builder,/preview\.html\?profile=islamic/);assert.match(builder,/value="ur"/);assert.match(builder,/value="hi"/);
});
test('export endpoint accepts an Islamic draft and retains Urdu content',async()=>{
 const {Readable}=require('node:stream'),pdf=require('../server/pdf.cjs'),{handler}=require('../server/index.cjs');
 const original=pdf.makePDF;let captured;
 pdf.makePDF=async draft=>{captured=draft;return Buffer.from('test-pdf');};
 try{
  const draft=P.fresh('islamic');draft.values.fullName='عائشہ خان';
  const req=Readable.from([Buffer.from(JSON.stringify({draft,format:'pdf'}))]);req.method='POST';req.url='/api/export/free';req.headers={origin:'http://127.0.0.1:4173'};req.socket={remoteAddress:'127.0.0.1'};
  const res={setHeader(){},writeHead(status){this.status=status;this.headersSent=true;},end(body){this.body=body;}};
  await handler(req,res);assert.equal(res.status,200);assert.equal(captured.profileType,'islamic');assert.equal(captured.values.fullName,'عائشہ خان');
 }finally{pdf.makePDF=original;}
});
