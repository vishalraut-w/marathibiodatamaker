'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../data.js'),{draftDigest}=require('../server/index.cjs');
globalThis.Patrika=P;
globalThis.document={createElement:()=>({style:{setProperty(){}},innerHTML:''})};
require('../renderer.js');
test('builder renders field names and values in rows with label choices',()=>{
 const context=vm.createContext({Patrika:P,PatrikaRender:{},document:{body:{dataset:{page:'test'}},querySelector:()=>null,addEventListener(){}},localStorage:{getItem:()=>null},window:{addEventListener(){}},ResizeObserver:class{},setTimeout,clearTimeout,Intl});
 vm.runInContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),context);
 const profession=vm.runInContext("field('personal','profession',0,1)",context);
 assert.match(profession,/class="field-pair"/);assert.match(profession,/data-profession-label/);assert.match(profession,/data-field="profession"/);
 for(const key of ['fullName','community','company']){
  const row=vm.runInContext(`field('personal','${key}',0,1)`,context);
  assert.match(row,/class="field-pair"/);assert.match(row,new RegExp('data-label-choice="'+key+'"'));assert.match(row,new RegExp('data-field="'+key+'"'));
 }
});
test('image picker displays the selected image and handles no image',()=>{
 const elements=Object.fromEntries(['header-options','header-current','header-image-preview','header-remove'].map(id=>[id,{innerHTML:'',textContent:'',hidden:false}]));
 const draft=P.fresh();
 const context=vm.createContext({Patrika:P,PatrikaRender:{},document:{body:{dataset:{page:'test'}},querySelector:s=>elements[s.slice(1)]||null,addEventListener(){}},localStorage:{getItem:()=>JSON.stringify(draft)},window:{addEventListener(){}},ResizeObserver:class{},setTimeout,clearTimeout,Intl});
 vm.runInContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),context);
 vm.runInContext('renderHeaders()',context);
 assert.match(elements['header-image-preview'].innerHTML,/assets\/deity-ganesh-classic\.png/);
 vm.runInContext("draft.header='none';renderHeaders()",context);
 assert.match(elements['header-image-preview'].innerHTML,/चित्र निवडलेले नाही/);
 assert.doesNotMatch(elements['header-image-preview'].innerHTML,/<img/);
});
test('occupation label and custom sections survive normalization and appear in the sheet',()=>{
 const draft=P.fresh();draft.values.profession='शेती';draft.professionLabel='व्यवसाय';
 draft.customSections=[{id:'section_1',title:'<शिक्षण>',fields:[{id:'field_1',label:'पदवी',value:'बी.ए.'},{id:'field_2',label:'रिकामे',value:''}]}];
 const restored=P.normalize(JSON.parse(JSON.stringify(draft)));
 assert.equal(P.entries(restored,'personal').find(r=>r.key==='profession').label,'व्यवसाय');
 assert.equal(P.entries(restored,'personal').find(r=>r.key==='profession').value,'शेती');
 assert.equal(P.customSectionEntries(restored)[0].rows.length,1);
 const html=PatrikaRender.createSheet(restored).innerHTML;
 assert.match(html,/<h2 dir="auto">&lt;शिक्षण&gt;<\/h2>/);assert.match(html,/<dt dir="auto">पदवी<\/dt>/);assert.match(html,/<dd dir="auto">बी\.ए\.<\/dd>/);
 restored.professionLabel='नोकरी';assert.equal(P.entries(restored,'personal').find(r=>r.key==='profession').label,'नोकरी');
});
test('old drafts retain their values and the previous payment digest',()=>{
 const draft=P.fresh();draft.values.profession='शेती';
 const {customSections,professionLabel,labelOverrides,...oldDraft}=draft;
 const restored=P.normalize(oldDraft);
 assert.equal(restored.values.profession,'शेती');assert.equal(restored.professionLabel,'व्यवसाय');assert.deepEqual(restored.customSections,[]);
 // Normalization fills missing standard fields in old drafts before hashing.
 const {customSections:ignoredSections,professionLabel:ignoredLabel,labelOverrides:ignoredOverrides,...oldNormalized}=restored;
 const normalizedPrevious=createHash('sha256').update(JSON.stringify(oldNormalized)).digest('hex');
 assert.equal(draftDigest(restored),normalizedPrevious);
 restored.professionLabel='नोकरी';assert.notEqual(draftDigest(restored),normalizedPrevious);
 restored.professionLabel='व्यवसाय';restored.customSections=[{id:'section_1',title:'अधिक माहिती',fields:[{id:'field_1',label:'शहर',value:'पुणे'}]}];
 assert.notEqual(draftDigest(restored),normalizedPrevious);
 const {labelOverrides:unused,...beforeLabelChoices}=restored;
 assert.equal(draftDigest(restored),createHash('sha256').update(JSON.stringify(beforeLabelChoices)).digest('hex'));
 const selected=P.normalize({...oldDraft,labelOverrides:{community:'समाज'},values:{...oldDraft.values,community:'बौद्ध'}});
 assert.equal(P.entries(selected,'personal').find(r=>r.key==='community').label,'समाज');
 assert.notEqual(draftDigest(selected),normalizedPrevious);
 selected.labelOverrides.company='संस्था';selected.values.company='संस्थेचे नाव';
 const saved=P.normalize(JSON.parse(JSON.stringify(selected)));
 assert.equal(P.entries(saved,'personal').find(r=>r.key==='company').label,'संस्था');
 assert.match(PatrikaRender.createSheet(saved).innerHTML,/<dt dir="auto">संस्था<\/dt>/);
 assert.deepEqual(P.normalize({...oldDraft,labelOverrides:{community:'<script>',unknown:'x'}}).labelOverrides,{});
 saved.labelOverrides.fullName='मुलीचे नाव';saved.values.fullName='अनन्या';
 const sheet=PatrikaRender.createSheet(P.normalize(saved)).innerHTML;
 assert.match(sheet,/<dt dir="auto">मुलीचे नाव<\/dt>/);assert.match(sheet,/<dd dir="auto">अनन्या<\/dd>/);
});
