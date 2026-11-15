/* MarathiPatrikaMakers application — no framework, browser-local drafts. */
'use strict';
const P=Patrika,R=PatrikaRender,E=P.esc,$=s=>document.querySelector(s);
const page=document.body.dataset.page;
const isIslamic=document.body.dataset.profile==='islamic'||document.body.dataset.religion==='islamic'||((page==='preview'||page==='download')&&/(?:\?|&)profile=islamic(?:&|$)/.test(typeof location==='undefined'?'':location.search||''));
const storageKey=isIslamic?'mpm-islamic-v1':'mpm-fresh-v1',paymentStorageKey='mpm-payment-session';
let draft;
try{const saved=JSON.parse(localStorage.getItem(storageKey));draft=saved?P.normalize(saved):P.fresh(isIslamic?'islamic':undefined);}catch{draft=P.fresh(isIslamic?'islamic':undefined);}
if(isIslamic&&(page==='preview'||page==='download')){
 const routes={'templates.html':'islamic-templates.html','builder.html':'islamic-builder.html','preview.html':'preview.html?profile=islamic','download.html':'download.html?profile=islamic'};
 document.querySelectorAll('main a[href]').forEach(a=>{const replacement=routes[a.getAttribute('href')];if(replacement)a.setAttribute('href',replacement);});
}
let saveTimer,toastTimer,previewTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3500);}
function save(){
 try{localStorage.setItem(storageKey,JSON.stringify(draft));if($('#save-state'))$('#save-state').textContent=isIslamic?'✓ मसौदा सहेजा गया':'✓ मसुदा जतन झाला';}
 catch{if($('#save-state'))$('#save-state').textContent=isIslamic?'सहेजा नहीं जा सका · मसौदे की प्रतिलिपि रखें':'जतन करता आले नाही · मसुद्याची प्रत ठेवा';}
 updateCount();clearTimeout(previewTimer);
 if($('#sheet-dialog')?.open&&page==='builder')previewTimer=setTimeout(()=>showDialog(draft),220);
}
function bindSave(){clearTimeout(saveTimer);saveTimer=setTimeout(save,180);}
function currentTemplate(){return P.templates.find(t=>t.id===draft.templateId)||P.templates[0];}
function count(){return Object.keys(P.sectionsFor(draft)).reduce((n,s)=>n+P.entries(draft,s).length,0)+P.customSectionEntries(draft).reduce((n,s)=>n+s.rows.length,0);}
function updateCount(){if($('#filled-count'))$('#filled-count').textContent=new Intl.NumberFormat('mr').format(count())+(isIslamic?' फ़ील्ड भरे':' रकाने भरले');}
const resizeObserver=new ResizeObserver(entries=>entries.forEach(entry=>R.scaleSheet(entry.target)));
async function mount(target,data,{sample=false,watermark=true}={}){
 if(!target)return null;const paper=R.createSheet(data,{sample,watermark});target.replaceChildren(paper);
 resizeObserver.observe(target);R.scaleSheet(target);const result=await R.readySheet(paper);R.scaleSheet(target);return result;
}
function showDialog(data,sample=false){
 const dialog=$('#sheet-dialog');if(!dialog.open)dialog.showModal();
 mount($('#dialog-sheet'),data,{sample,watermark:!sample}).then(result=>$('#dialog-note').textContent=isIslamic?(sample?'यह नमूना है। अपना विवरण भरकर यह डिज़ाइन उपयोग करें।':result?.fits?'विवरण बदलने पर पूर्वावलोकन भी बदलता है।':'विवरण अधिक है। कुछ जानकारी संक्षेप में लिखें।'):(sample?'नमुना माहिती · तुमचे तपशील भरल्यानंतर ही रचना वापरली जाईल.':result?.fits?'माहिती बदलताच हे पूर्वावलोकनही बदलते.':'माहिती खूप मोठी आहे. काही तपशील थोडक्यात लिहा.'));
}
$('[data-close-dialog]')?.addEventListener('click',()=>$('#sheet-dialog').close());
$('#sheet-dialog')?.addEventListener('click',event=>{if(event.target===$('#sheet-dialog'))$('#sheet-dialog').close();});
function card(t){
 return '<article class="template-card '+(draft.templateId===t.id?'is-selected':'')+'"><div class="template-shot"><div class="sheet-viewport" data-thumb="'+t.id+'"></div></div><div class="template-caption"><div><h3>'+t.name+'</h3><small>'+(t.religion==='islamic'?(t.photo?'फोटो के साथ':'बिना फोटो'):(t.photo?'फोटोसह':'फोटोशिवाय'))+'</small></div><div class="template-actions"><button class="btn secondary" data-choose="'+t.id+'">'+(t.religion==='islamic'?'डिज़ाइन चुनें →':'ही रचना निवडा →')+'</button><button class="icon-btn" data-look="'+t.id+'" aria-label="'+t.name+(t.religion==='islamic'?' देखें':' मोठी पहा')+'"><svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></div></div></article>';
}
let galleryObserver;
function sampleDraft(t){
 const d=P.demo(t.religion==='islamic'?'islamic':undefined);d.templateId=t.id;d.showPhoto=true;
 if(t.religion==='buddhist'){
  d.header='dhamma-wheel';d.values.invocation='बुद्धं शरणं गच्छामि';d.values.religion='बौद्ध';d.values.community='';
  for(const [key] of P.sections.patrika.fields)d.values[key]='';
 }
 if(t.religion==='christian'){
  d.header='christian-cross';d.values.invocation='';d.values.religion='ख्रिश्चन';d.values.community='';
  d.values.fullName='चि. जोएल जॉन डिसोझा';d.values.father='जॉन डिसोझा';d.values.mother='मेरी डिसोझा';d.values.contactName='जॉन डिसोझा';
  for(const [key] of P.sections.patrika.fields)d.values[key]='';
 }
 return d;
}
function gallery(target,items,{lazy=false}={}){
 galleryObserver?.disconnect();galleryObserver=null;
 target.innerHTML=items.map(card).join('');
 const drawThumb=el=>{const t=P.templates.find(t=>t.id===el.dataset.thumb);mount(el,sampleDraft(t),{sample:true,watermark:false});};
 if(lazy&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){observer.unobserve(entry.target);drawThumb(entry.target);}}),{rootMargin:'550px'});
  galleryObserver=observer;
  target.querySelectorAll('[data-thumb]').forEach(el=>galleryObserver.observe(el));
 }else target.querySelectorAll('[data-thumb]').forEach(drawThumb);
}
document.addEventListener('click',event=>{
 const choose=event.target.closest('[data-choose]'),look=event.target.closest('[data-look]');
 if(choose){
  const previous=currentTemplate(),next=P.templates.find(t=>t.id===choose.dataset.choose);
  if(!next)return;
  const defaults=P.fresh();
  if(next.religion==='christian'&&previous.religion!=='christian'){
   if(!draft.headerImage&&draft.header===defaults.header)draft.header='christian-cross';
   if(draft.values.invocation===defaults.values.invocation)draft.values.invocation='';
   if(!draft.values.religion)draft.values.religion='ख्रिश्चन';
  }else if(next.religion==='buddhist'&&previous.religion!=='buddhist'){
   if(!draft.headerImage&&draft.header===defaults.header)draft.header='none';
   if(draft.values.invocation===defaults.values.invocation)draft.values.invocation='बुद्धं शरणं गच्छामि';
   if(!draft.values.religion)draft.values.religion='बौद्ध';
  }else if(previous.religion==='buddhist'&&next.religion!=='buddhist'){
   if(!draft.headerImage&&draft.header==='dhamma-wheel')draft.header=defaults.header;
   if(draft.values.invocation==='बुद्धं शरणं गच्छामि')draft.values.invocation=defaults.values.invocation;
  }
  draft.templateId=next.id;draft.showPhoto=next.photo;save();location.href=next.religion==='islamic'?'islamic-builder.html':'builder.html';
 }
 if(look){const t=P.templates.find(t=>t.id===look.dataset.look);if(t)showDialog(sampleDraft(t),true);}
});
if(page==='home'){mount($('#hero-sheet'),P.demo(),{sample:true,watermark:false});gallery($('#home-templates'),P.templates.slice(0,4));}
if(page==='templates'){
 let photoFilter='all';
 const draw=()=>{const style=$('#style-filter')?.value||'all',religion=document.body.dataset.religion;const items=P.templates.filter(t=>(['buddhist','islamic','christian'].includes(religion)?t.religion===religion:!t.religion)&&(photoFilter==='all'||(photoFilter==='photo'?t.photo:!t.photo))&&(style==='all'||(style==='dark'?t.background!=='#fff'&&t.index%2===1:t.family===style)));gallery($('#template-gallery'),items,{lazy:true});$('#template-count').textContent=new Intl.NumberFormat('mr').format(items.length)+(religion==='islamic'?' डिज़ाइन':' रचना');};
 draw();document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{photoFilter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});draw();}));
 $('#style-filter')?.addEventListener('change',draw);
}
function controls(s,key,index,length){return '<div class="row-tools"><button type="button" data-action="up" data-key="'+key+'" '+(index===0?'disabled':'')+' aria-label="'+(isIslamic?'ऊपर ले जाएँ':'रकाना वर हलवा')+'">↑</button><button type="button" data-action="down" data-key="'+key+'" '+(index===length-1?'disabled':'')+' aria-label="'+(isIslamic?'नीचे ले जाएँ':'रकाना खाली हलवा')+'">↓</button><button type="button" data-action="hide" data-key="'+key+'" aria-label="'+(isIslamic?'फ़ील्ड छिपाएँ':'रकाना लपवा')+'">×</button></div>';}
function field(s,key,index,length){
 const custom=draft.custom[s].find(i=>i.id===key);if(custom)return '<div class="field-row custom-row" data-row="'+key+'"><div class="field-pair"><input aria-label="'+(isIslamic?'फ़ील्ड का नाम':'रकान्याचे नाव')+'" maxlength="80" data-custom-label="'+key+'" value="'+E(custom.label)+'" placeholder="'+(isIslamic?'उदा. शौक':'उदा. छंद')+'"><input aria-label="'+(isIslamic?'जानकारी':'माहिती')+'" maxlength="1500" data-custom-value="'+key+'" value="'+E(custom.value)+'" placeholder="'+(isIslamic?'विवरण लिखें':'तपशील लिहा')+'"></div>'+controls(s,key,index,length)+'</div>';
 if(key==='profession'&&!isIslamic)return '<div class="field-row custom-row" data-row="profession"><div class="field-pair"><select aria-label="व्यवसाय किंवा नोकरी निवडा" data-profession-label><option value="व्यवसाय" '+(draft.professionLabel==='व्यवसाय'?'selected':'')+'>व्यवसाय</option><option value="नोकरी" '+(draft.professionLabel==='नोकरी'?'selected':'')+'>नोकरी</option></select><input aria-label="व्यवसाय किंवा नोकरीची माहिती" type="text" maxlength="1500" data-field="profession" value="'+E(draft.values.profession||'')+'" placeholder="उदा. शेती"></div>'+controls(s,key,index,length)+'</div>';
 const meta=P.sectionsFor(draft)[s].fields.find(f=>f[0]===key);if(!meta)return '';
 const [,label,placeholder,options]=meta,value=draft.values[key]||'',chosen=draft.labelOverrides[key]||label,valueDescription=isIslamic?' जानकारी':' माहिती';
 const labelChoices=isIslamic?{sect:['मसलक','फ़िरक़ा'],community:['बिरादरी','समुदाय']}[key]:{fullName:['मुलाचे नाव','मुलीचे नाव'],community:['जात','समाज'],company:['कार्यस्थळ','संस्था']}[key];
 let input='';
 if(options){
  const opts=options.filter(o=>o!=='इतर'),other=value&&!opts.includes(value);
  input='<select id="field-'+key+'" aria-label="'+E(chosen)+valueDescription+'" data-field="'+key+'"><option value="">'+E(placeholder)+'</option>'+opts.map(o=>'<option '+(o===value?'selected':'')+' value="'+E(o)+'">'+E(o)+'</option>').join('')+'<option value="__other__" '+(other?'selected':'')+'>इतर · स्वतः लिहा</option></select><input data-other="'+key+'" aria-label="'+E(chosen)+' स्वतः लिहा" placeholder="तुमचा तपशील लिहा" maxlength="1500" value="'+E(other?value:'')+'" '+(other?'':'hidden')+'>';
 }else if(['about','address','expectations','relatives'].includes(key))input='<textarea id="field-'+key+'" aria-label="'+E(chosen)+valueDescription+'" rows="2" maxlength="1500" data-field="'+key+'" placeholder="'+E(placeholder)+'">'+E(value)+'</textarea>';
 else input='<input id="field-'+key+'" aria-label="'+E(chosen)+valueDescription+'" type="text" maxlength="1500" data-field="'+key+'" '+(['phone','whatsapp'].includes(key)?'inputmode="tel"':key==='email'?'inputmode="email"':'')+' value="'+E(value)+'" placeholder="'+E(placeholder)+'">';
 if(isIslamic)input=input.replace(/<(input|textarea)\b/g,'<$1 dir="auto"');
 const defaultLabel=isIslamic?{sect:'मसलक / फ़िरक़ा',community:'बिरादरी / समुदाय'}[key]||label:label;
 const name=labelChoices?'<select aria-label="'+E(label)+(isIslamic?' का नाम चुनें':' रकान्याचे नाव निवडा')+'" data-label-choice="'+key+'"><option value="">'+E(defaultLabel)+'</option>'+labelChoices.map(option=>'<option value="'+E(option)+'" '+(chosen===option?'selected':'')+'>'+E(option)+'</option>').join('')+'</select>':'<label class="row-name" for="field-'+key+'">'+E(label)+'</label>';
 return '<div class="field-row" data-row="'+key+'"><div class="field-pair">'+name+'<div class="row-value">'+input+'</div></div>'+controls(s,key,index,length)+'</div>';
}
function renderSection(s){
 const visible=draft.order[s].filter(k=>!draft.hidden[s].includes(k));
 $('#stack-'+s).innerHTML=visible.map((k,i)=>field(s,k,i,visible.length)).join('');
 if(isIslamic)$('#stack-'+s).querySelectorAll('input,textarea').forEach(el=>el.setAttribute('dir','auto'));
 $('#restore-'+s).innerHTML=draft.hidden[s].map(k=>'<button type="button" data-restore="'+k+'">+ '+E((k==='profession'&&!isIslamic?draft.professionLabel:(draft.labelOverrides[k]||P.sectionsFor(draft)[s].fields.find(f=>f[0]===k)?.[1]))||draft.custom[s].find(i=>i.id===k)?.label||'रकाना')+(isIslamic?' फिर दिखाएँ':' पुन्हा दाखवा')+'</button>').join('');
}
function renderHeaders(){
 const choices=P.headers.filter(h=>h.file&&!h.legacy&&(isIslamic?h.religion==='islamic':h.religion!=='islamic'&&h.id!=='dhamma-wheel')),selected=P.headers.find(h=>h.id===draft.header);
 const theme=currentTemplate(),artClass=isIslamic?'islamic-art-'+theme.theme+(theme.dark?'-dark':''):'';
 const button=h=>'<button type="button" class="header-option '+(h.id===draft.header&&!draft.headerImage?'active':'')+'" aria-pressed="'+(h.id===draft.header&&!draft.headerImage)+'" data-header="'+h.id+'"><img class="'+artClass+'" src="'+h.file+'" alt="" loading="lazy"><small>'+h.name+'</small><span class="choice-tick" aria-hidden="true">✓</span></button>';
 const groups=isIslamic?choices.map(button).join(''):[['देवता',h=>!h.religion],['बौद्ध',h=>h.religion==='buddhist'],['ख्रिश्चन',h=>h.religion==='christian']].map(([title,filter])=>'<div class="header-group-title">'+title+'</div>'+choices.filter(filter).map(button).join('')).join('');
 $('#header-options').innerHTML=groups+'<button type="button" class="header-option upload-header '+(!draft.headerImage&&draft.header==='none'?'active':'')+'" data-header="none" aria-pressed="'+(!draft.headerImage&&draft.header==='none')+'"><span class="upload-symbol" aria-hidden="true">−</span><small>'+(isIslamic?'चित्र नहीं':'चित्र नको')+'</small></button>';
 $('#header-current').textContent=draft.headerImage?(isIslamic?'आपका चित्र':'तुमचे चित्र'):draft.header==='none'?(isIslamic?'चित्र नहीं':'चित्र नको'):selected?.name||'चित्र नको';
 const src=draft.headerImage||selected?.file;
 const builtinImage=isIslamic&&selected?.religion==='islamic'&&!draft.headerImage;
 $('#header-image-preview').innerHTML=src?'<img class="'+(builtinImage?artClass:'')+'" src="'+E(src)+'" alt="'+(isIslamic?'चुना हुआ चित्र':'निवडलेले चित्र')+'">':'<span>'+(isIslamic?'कोई चित्र नहीं चुना':'चित्र निवडलेले नाही')+'</span>';
 $('#header-remove').hidden=!draft.headerImage;
}
function chooseHeader(id){
 const next=P.headers.find(h=>h.id===id);if(!next)return;
 const standard=P.headers.some(h=>h.invocation===draft.values.invocation);
 if(next.invocation&&standard){draft.values.invocation=next.invocation;$('#invocation').value=next.invocation;}
 else if(['buddhist','christian'].includes(next.religion)&&draft.values.invocation===P.fresh().values.invocation){draft.values.invocation='';$('#invocation').value='';}
 draft.header=id;draft.headerImage=null;renderHeaders();save();
}
function showPhoto(){const el=$('#photo-thumb');el.innerHTML=draft.photo?'<img src="'+E(draft.photo)+'" alt="निवडलेला फोटो">':'फोटो';$('#photo-remove').hidden=!draft.photo;}
async function imageFile(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('कृपया JPG, PNG किंवा WebP चित्र निवडा.');
 if(file.size>10*1024*1024)throw Error('कृपया १० MB पेक्षा लहान चित्र निवडा.');
 const bitmap=await createImageBitmap(file);const scale=Math.min(1,900/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
 const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 const value=canvas.toDataURL('image/webp',.87);if(!P.imageData(value))throw Error('चित्र खूप मोठे आहे. लहान चित्र निवडा.');return value;
}
function downloadBlob(blob,filename){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
if(page==='builder'){
 if(draft.header==='dhamma-wheel'){draft.header='none';save();}
 const t=currentTemplate();$('#selected-design').innerHTML='<div class="selected-name"><div><small>'+(isIslamic?'चुना हुआ डिज़ाइन':'निवडलेली रचना')+'</small><b>'+t.name+'</b><a href="'+(t.religion==='islamic'?'islamic-templates.html':t.religion==='buddhist'?'buddhist-templates.html':t.religion==='christian'?'christian-templates.html':'templates.html')+'">बदला ↗</a></div></div>';
 $('#invocation').value=draft.values.invocation;$('#invocation').addEventListener('input',e=>{draft.values.invocation=e.target.value;bindSave();});
 $('#show-photo').checked=draft.showPhoto;$('#show-photo').disabled=!t.photo;
 $('#photo-note').textContent=isIslamic?(t.photo?'फोटो वैकल्पिक है।':'फोटो के लिए फोटो वाला डिज़ाइन चुनें.'):(t.photo?'फोटो ऐच्छिक आहे. तो काढल्यावर मजकुरासाठी अधिक जागा मिळते.':'फोटो दाखवण्यासाठी फोटोसह रचना निवडा.');
 $('#show-photo').addEventListener('change',e=>{draft.showPhoto=e.target.checked;save();});
 renderHeaders();showPhoto();
 $('#header-options').addEventListener('click',e=>{const b=e.target.closest('[data-header]');if(b){chooseHeader(b.dataset.header);$('#image-picker').open=false;}});
 for(const kind of ['photo','header']){
  $('#'+kind+'-upload').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;draft[kind==='photo'?'photo':'headerImage']=await imageFile(file);showPhoto();renderHeaders();if(kind==='header')$('#image-picker').open=false;save();toast('चित्र जोडले.');}catch(error){toast(error.message);}finally{e.target.value='';}});
  $('#'+kind+'-remove').addEventListener('click',()=>{draft[kind==='photo'?'photo':'headerImage']=null;showPhoto();renderHeaders();save();});
 }
 $('#form-sections').innerHTML=Object.entries(P.sectionsFor(draft)).map(([s,meta],i)=>'<section id="'+s+'" class="form-card"><div class="card-title"><span class="section-icon">'+['०१','०२','०३','०४'][i]+'</span><div><h2>'+meta.title+'</h2><p>'+(isIslamic?'खाली छोड़ी गई जानकारी दिखाई नहीं देगी।':'रकाने वर-खाली हलवा, लपवा किंवा स्वतःचे रकाने जोडा.')+'</p></div></div><div id="stack-'+s+'"></div><button type="button" class="add-field" data-add="'+s+'">'+(isIslamic?'+ नया फ़ील्ड जोड़ें':'+ नवीन रकाना जोडा')+'</button><div id="restore-'+s+'" class="restore-fields"></div></section>').join('');
 Object.keys(P.sectionsFor(draft)).forEach(s=>{
  renderSection(s);const card=$('#'+s);
  card.addEventListener('input',e=>{
   const el=e.target;
   if(el.matches('select'))return;
   if(el.dataset.field)draft.values[el.dataset.field]=el.value;
   if(el.dataset.other)draft.values[el.dataset.other]=el.value;
   if(el.dataset.customLabel)draft.custom[s].find(i=>i.id===el.dataset.customLabel).label=el.value;
   if(el.dataset.customValue)draft.custom[s].find(i=>i.id===el.dataset.customValue).value=el.value;
   bindSave();
  });
  card.addEventListener('change',e=>{
   if(e.target.matches('select[data-profession-label]')){draft.professionLabel=e.target.value;save();return;}
   if(e.target.matches('select[data-label-choice]')){const el=e.target,k=el.dataset.labelChoice;if(el.value)draft.labelOverrides[k]=el.value;else delete draft.labelOverrides[k];card.querySelector('#field-'+k)?.setAttribute('aria-label',(el.value||P.sectionsFor(draft)[s].fields.find(f=>f[0]===k)?.[1]||'')+(isIslamic?' जानकारी':' माहिती'));save();return;}
   if(!e.target.matches('select[data-field]'))return;const el=e.target,k=el.dataset.field,other=card.querySelector('[data-other="'+k+'"]');
   other.hidden=el.value!=='__other__';draft.values[k]=other.hidden?el.value:other.value;if(!other.hidden)other.focus();save();
  });
  card.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b)return;let focus=null;
   if(b.dataset.add){if(draft.custom[s].length>=50)return toast('या विभागात जास्तीत जास्त ५० नवीन रकाने जोडता येतात.');const id='custom_'+crypto.randomUUID().replaceAll('-','_');draft.custom[s].push({id,label:'',value:''});draft.order[s].push(id);focus=id;}
   if(b.dataset.restore)draft.hidden[s]=draft.hidden[s].filter(k=>k!==b.dataset.restore);
   if(b.dataset.action){
    const k=b.dataset.key,visible=draft.order[s].filter(x=>!draft.hidden[s].includes(x)),idx=visible.indexOf(k),delta=b.dataset.action==='up'?-1:1;
    if(b.dataset.action==='hide')draft.hidden[s].push(k);
    else{const other=visible[idx+delta];if(other){const a=draft.order[s].indexOf(k),z=draft.order[s].indexOf(other);[draft.order[s][a],draft.order[s][z]]=[draft.order[s][z],draft.order[s][a]];focus=k;}}
   }
   renderSection(s);save();if(focus)card.querySelector('[data-row="'+focus+'"] input, [data-row="'+focus+'"] select, [data-row="'+focus+'"] textarea')?.focus({preventScroll:true});
  });
 });
 $('#form-sections').insertAdjacentHTML('afterend','<div id="custom-section-list"></div><button type="button" class="add-field add-section-button" id="add-custom-section">'+(isIslamic?'+ नया अनुभाग / शीर्षक जोड़ें':'+ नवीन विभाग / शीर्षक जोडा')+'</button>');
 const customList=$('#custom-section-list');
 const newId=prefix=>prefix+'_'+crypto.randomUUID().replaceAll('-','_');
 function renderCustomSections(){
  const l=isIslamic?{section:'नया अनुभाग',remove:'अनुभाग हटाएँ',title:'अनुभाग का शीर्षक',example:'उदा. शिक्षा',note:'शीर्षक और कम से कम एक पूरा फ़ील्ड भरने पर अनुभाग दिखाई देगा।',label:'फ़ील्ड का नाम',field:'उदा. डिग्री',value:'जानकारी',placeholder:'विवरण लिखें',removeField:'फ़ील्ड हटाएँ',add:'+ इस अनुभाग में फ़ील्ड जोड़ें'}:{section:'नवीन विभाग',remove:'विभाग काढा',title:'विभागाचे शीर्षक',example:'उदा. शिक्षणाची माहिती',note:'शीर्षक आणि किमान एक पूर्ण रकाना भरल्यावर विभाग पत्रिकेत दिसेल.',label:'रकान्याचे नाव',field:'उदा. पदवी',value:'माहिती',placeholder:'तपशील लिहा',removeField:'रकाना काढा',add:'+ या विभागात रकाना जोडा'};
  customList.innerHTML=draft.customSections.map(section=>'<section class="form-card custom-section" data-custom-section="'+section.id+'"><div class="custom-section-heading"><h2>'+l.section+'</h2><button type="button" class="text-button" data-remove-section>'+l.remove+'</button></div><label class="field-label">'+l.title+'<input data-section-title maxlength="80" value="'+E(section.title)+'" placeholder="'+l.example+'"></label><p class="small-note">'+l.note+'</p><div class="custom-section-fields">'+section.fields.map(f=>'<div class="field-row custom-row" data-section-field="'+f.id+'"><div class="field-pair"><input aria-label="'+l.label+'" data-section-field-label maxlength="80" value="'+E(f.label)+'" placeholder="'+l.field+'"><input aria-label="'+l.value+'" data-section-field-value maxlength="1500" value="'+E(f.value)+'" placeholder="'+l.placeholder+'"></div><div class="row-tools"><button type="button" data-remove-section-field aria-label="'+l.removeField+'">×</button></div></div>').join('')+'</div><button type="button" class="add-field" data-add-section-field>'+l.add+'</button></section>').join('');
  if(isIslamic)customList.querySelectorAll('input,textarea').forEach(el=>el.setAttribute('dir','auto'));
 }
 renderCustomSections();
 $('#add-custom-section').addEventListener('click',()=>{
  if(draft.customSections.length>=20)return toast('जास्तीत जास्त २० नवीन विभाग जोडता येतात.');
  const id=newId('section');draft.customSections.push({id,title:'',fields:[{id:newId('field'),label:'',value:''}]});renderCustomSections();save();customList.querySelector('[data-custom-section="'+id+'"] [data-section-title]')?.focus();
 });
 customList.addEventListener('input',event=>{
  const el=event.target,card=el.closest('[data-custom-section]'),section=draft.customSections.find(s=>s.id===card?.dataset.customSection);if(!section)return;
  if(el.hasAttribute('data-section-title'))section.title=el.value;
  const row=el.closest('[data-section-field]'),field=section.fields.find(f=>f.id===row?.dataset.sectionField);
  if(field&&el.hasAttribute('data-section-field-label'))field.label=el.value;
  if(field&&el.hasAttribute('data-section-field-value'))field.value=el.value;
  bindSave();
 });
 customList.addEventListener('click',event=>{
  const button=event.target.closest('button'),card=button?.closest('[data-custom-section]'),section=draft.customSections.find(s=>s.id===card?.dataset.customSection);if(!section)return;
  if(button.hasAttribute('data-remove-section'))draft.customSections=draft.customSections.filter(s=>s.id!==section.id);
  else if(button.hasAttribute('data-add-section-field')){if(section.fields.length>=50)return toast('या विभागात जास्तीत जास्त ५० रकाने जोडता येतात.');section.fields.push({id:newId('field'),label:'',value:''});}
  else if(button.hasAttribute('data-remove-section-field')){const id=button.closest('[data-section-field]')?.dataset.sectionField;section.fields=section.fields.filter(f=>f.id!==id);}
  else return;
  renderCustomSections();save();
 });
 $('#biodata-form').addEventListener('submit',e=>e.preventDefault());
 $('#live-preview').addEventListener('click',()=>{save();showDialog(draft);});
 $('#backup-draft').addEventListener('click',()=>{save();downloadBlob(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}),'marathi-patrika-draft.json');});
 $('#restore-draft').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>4000000)throw Error('मसुद्याची फाइल खूप मोठी आहे.');const data=JSON.parse(await f.text());if(!data.values||!data.order)throw Error('योग्य मसुद्याची फाइल निवडा.');if((data.profileType==='islamic')!==isIslamic)throw Error('कृपया इसी बायोडाटा प्रकार की फ़ाइल चुनें।');localStorage.setItem(isIslamic?'mpm-islamic-previous-draft':'mpm-previous-draft',JSON.stringify(draft));draft=P.normalize(data);save();location.reload();}catch(error){toast(error.message);}});
 $('#reset-draft').addEventListener('click',()=>$('#reset-dialog').showModal());
 $('[data-cancel-reset]').addEventListener('click',()=>$('#reset-dialog').close());
 $('#confirm-reset').addEventListener('click',()=>{try{localStorage.setItem(isIslamic?'mpm-islamic-previous-draft':'mpm-previous-draft',JSON.stringify(draft));}catch{}draft=P.fresh(isIslamic?'islamic':undefined);save();location.reload();});
 updateCount();
}
if(page==='preview'){
 mount($('#preview-sheet'),draft).then(result=>{
  const filled=count()>0,valid=result?.fits&&filled;$('#fit-status').textContent=!filled?'आधी तुमची माहिती भरा.':result.fits?'✓ संपूर्ण माहिती एका A4 पानात बसली आहे.':'तपशील खूप मोठे आहेत. काही रकाने कमी करा किंवा माहिती थोडक्यात लिहा.';
  $('#fit-status').classList.toggle('error',!valid);$('#continue-download').setAttribute('aria-disabled',String(!valid));
 });
}
async function api(path,body){
 const response=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 if(!response.ok){const error=await response.json().catch(()=>({}));throw Object.assign(Error(error.message||'प्रक्रिया पूर्ण झाली नाही. कृपया पुन्हा प्रयत्न करा.'),{status:response.status});}return response;
}
let config=null,activeOrder=null,downloadToken=null,downloadReady=false,downloadBusy=false,paidOrderReady=false,sessionExpiresAt=0,sessionTimer;
function selectedFormat(){return $('input[name="export-format"]:checked')?.value==='png'?'png':'pdf';}
function setDownloadStatus(text){$('#download-status').textContent=text;}
function updateDownloadLabels(){
 const label=selectedFormat().toUpperCase();
 $('#free-download').textContent='वॉटरमार्कसह '+label+' डाउनलोड ↓';
 const paid=$('#paid-download');
 if(paidOrderReady){
  paid.classList.remove('razorpay-pay');paid.textContent='अनलॉक केलेली '+label+' डाउनलोड ↓';paid.setAttribute('aria-label','अनलॉक केलेली '+label+' डाउनलोड करा');
 }else{
  paid.classList.add('razorpay-pay');paid.innerHTML='<span class="razorpay-copy"><small>Razorpay सुरक्षित पेमेंट</small><b>₹35 भरून अनलॉक करा</b></span><span class="razorpay-arrow" aria-hidden="true">→</span>';paid.setAttribute('aria-label','Razorpay ने 35 रुपये भरून पत्रिका अनलॉक करा');
 }
}
function busy(value){
 downloadBusy=value;$('#export-format').disabled=value;$('#retry-paid').disabled=value;
 $('#free-download').disabled=value||!downloadReady;
 $('#paid-download').disabled=value||!config?.paymentsEnabled||!downloadReady;
 updateDownloadLabels();
}
async function saveDocument(response,format){
 const expected=format==='png'?'image/png':'application/pdf';
 if(!response.headers.get('content-type')?.startsWith(expected))throw Error('डाउनलोडचा प्रकार जुळला नाही. कृपया पुन्हा प्रयत्न करा.');
 downloadBlob(await response.blob(),'parichay-patrika.'+format);
 setDownloadStatus('✓ तुमची '+format.toUpperCase()+' परिचय पत्रिका डाउनलोड झाली.');
}
function clearPaymentSession(){
 activeOrder=null;downloadToken=null;paidOrderReady=false;sessionExpiresAt=0;clearInterval(sessionTimer);$('#session-time').textContent='';
 try{sessionStorage.removeItem(paymentStorageKey);}catch{}
 $('#retry-paid').hidden=true;updateDownloadLabels();
}
function showSessionTime(){
 const remaining=Math.max(0,Math.ceil((sessionExpiresAt-Date.now())/1000));
 if(!remaining){clearPaymentSession();setDownloadStatus('१५ मिनिटांचा वेळ संपला आहे. वॉटरमार्कशिवाय डाउनलोडसाठी पुन्हा पेमेंट करा.');return;}
 const minutes=Math.floor(remaining/60),seconds=String(remaining%60).padStart(2,'0');
 $('#session-time').textContent='अनलॉक वेळ शिल्लक: '+minutes+':'+seconds;
}
function usePaymentSession(result){
 if(result.expired){clearPaymentSession();setDownloadStatus('१५ मिनिटांचा वेळ संपला आहे. वॉटरमार्कशिवाय डाउनलोडसाठी पुन्हा पेमेंट करा.');return;}
 downloadToken=typeof result.downloadToken==='string'?result.downloadToken:null;
 paidOrderReady=!!result.paid&&!!downloadToken;
 if(paidOrderReady){sessionExpiresAt=result.expiresAt;clearInterval(sessionTimer);showSessionTime();sessionTimer=setInterval(showSessionTime,1000);}
 updateDownloadLabels();
}
async function paidStatus(){
 if(!activeOrder?.orderToken)return {paid:false};
 let result;
 try{result=await(await api('/api/payment/status',{orderToken:activeOrder.orderToken})).json();}
 catch(error){if(error.status!==403&&error.status!==404)throw error;clearPaymentSession();return {paid:false};}
 usePaymentSession(result);return result;
}
async function downloadPaid(format){if(!downloadToken)throw Error('पेमेंटची सुरक्षित परवानगी उपलब्ध नाही. स्थिती पुन्हा तपासा.');await saveDocument(await api('/api/export/paid',{downloadToken,draft,format}),format);}
async function recoverPayment(){
 if(!activeOrder||downloadBusy)return;const format=selectedFormat();busy(true);
 try{const result=await paidStatus();if(result.paid&&!result.expired)await downloadPaid(format);else if(!result.expired)setDownloadStatus('पेमेंट अद्याप पूर्ण झालेले नाही. थोड्या वेळाने पुन्हा तपासा.');}
 catch(error){setDownloadStatus(error.message);}finally{busy(false);}
}
if(page==='download'){
 busy(false);
 $('#export-format').addEventListener('change',updateDownloadLabels);
 try{const saved=JSON.parse(sessionStorage.getItem(paymentStorageKey));if(saved?.id&&saved?.orderToken)activeOrder=saved;}catch{}
 $('#retry-paid').hidden=!activeOrder;$('#retry-paid').addEventListener('click',recoverPayment);
 mount($('#download-sheet'),draft).then(result=>{downloadReady=!!count()&&result.fits;busy(downloadBusy);if(!downloadReady)setDownloadStatus('माहिती पूर्ण करून पूर्वावलोकनात तपासा.');});
 api('/api/config').then(r=>r.json()).then(async c=>{
  config=c;
  if(!c.paymentsEnabled)setDownloadStatus('वॉटरमार्कशिवाय डाउनलोड सध्या उपलब्ध नाही. वॉटरमार्कसह PNG किंवा PDF डाउनलोड करता येईल.');
  else if(activeOrder){try{await paidStatus();}catch{}}
  busy(downloadBusy);
 }).catch(e=>setDownloadStatus(e.message));
 $('#free-download').addEventListener('click',async()=>{
  if(!count())return setDownloadStatus('आधी तुमची माहिती भरा.');
  const format=selectedFormat();busy(true);setDownloadStatus('तुमची '+format.toUpperCase()+' तयार होत आहे…');
  try{await saveDocument(await api('/api/export/free',{draft,format}),format);}catch(error){setDownloadStatus(error.message);}finally{busy(false);}
 });
 $('#paid-download').addEventListener('click',async()=>{
  if(!config?.paymentsEnabled||downloadBusy)return;const format=selectedFormat();busy(true);setDownloadStatus('पेमेंटची स्थिती तपासत आहोत…');
  try{
   if(activeOrder){const result=await paidStatus();if(result.paid&&!result.expired){await downloadPaid(format);busy(false);return;}}
   setDownloadStatus('सुरक्षित पेमेंट सुरू होत आहे…');
   const order=await(await api('/api/payment/order',{draft})).json();
   if(typeof order.id!=='string'||typeof order.orderToken!=='string')throw Error('पेमेंटची ऑर्डर सुरक्षितपणे तयार झाली नाही. कृपया पुन्हा प्रयत्न करा.');
   activeOrder={id:order.id,orderToken:order.orderToken};downloadToken=null;paidOrderReady=false;
   try{sessionStorage.setItem(paymentStorageKey,JSON.stringify(activeOrder));}catch{}$('#retry-paid').hidden=false;
   if(!window.Razorpay)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=resolve;script.onerror=()=>reject(Error('पेमेंट सेवा उघडली नाही. कृपया पुन्हा प्रयत्न करा.'));document.head.append(script);});
   const checkout=new Razorpay({key:config.keyId,order_id:order.id,amount:order.amount,currency:order.currency,name:'MarathiPatrikaMakers',description:'परिचय पत्रिका · वॉटरमार्कशिवाय PNG आणि PDF',theme:{color:'#912c49'},handler:async result=>{
    busy(true);setDownloadStatus('पेमेंटची पडताळणी होत आहे…');
    try{const verified=await(await api('/api/payment/verify',{...result,orderToken:activeOrder.orderToken})).json();usePaymentSession(verified);if(!verified.expired)await downloadPaid(format);}
    catch(error){setDownloadStatus(error.message+' आधीच्या पेमेंटची स्थिती तपासा.');}finally{busy(false);}
   },modal:{ondismiss:()=>{setDownloadStatus('पेमेंट बंद केले. पूर्ण झाले असल्यास स्थिती तपासा.');busy(false);}}});
   checkout.on('payment.failed',()=>{setDownloadStatus('पेमेंट पूर्ण झाले नाही. कृपया पुन्हा प्रयत्न करा.');busy(false);});checkout.open();
  }catch(error){setDownloadStatus(error.message);busy(false);}
 });
}
window.addEventListener('pagehide',()=>{if(page==='builder')save();});

