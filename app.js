/* MarathiPatrikaMakers application — no framework, browser-local drafts. */
'use strict';
const P=Patrika,R=PatrikaRender,E=P.esc,$=s=>document.querySelector(s);
const storageKey='mpm-fresh-v1';
let draft;
try{draft=P.normalize(JSON.parse(localStorage.getItem(storageKey)));}catch{draft=P.fresh();}
const page=document.body.dataset.page;
let saveTimer,toastTimer,previewTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3500);}
function save(){
 try{localStorage.setItem(storageKey,JSON.stringify(draft));if($('#save-state'))$('#save-state').textContent='✓ मसुदा जतन झाला';}
 catch{if($('#save-state'))$('#save-state').textContent='जतन करता आले नाही · मसुद्याची प्रत ठेवा';}
 updateCount();clearTimeout(previewTimer);
 if($('#sheet-dialog')?.open&&page==='builder')previewTimer=setTimeout(()=>showDialog(draft),220);
}
function bindSave(){clearTimeout(saveTimer);saveTimer=setTimeout(save,180);}
function currentTemplate(){return P.templates.find(t=>t.id===draft.templateId)||P.templates[0];}
function count(){return Object.keys(P.sections).reduce((n,s)=>n+P.entries(draft,s).length,0);}
function updateCount(){if($('#filled-count'))$('#filled-count').textContent=new Intl.NumberFormat('mr').format(count())+' रकाने भरले';}
const resizeObserver=new ResizeObserver(entries=>entries.forEach(entry=>R.scaleSheet(entry.target)));
async function mount(target,data,{sample=false,watermark=true}={}){
 if(!target)return null;const paper=R.createSheet(data,{sample,watermark});target.replaceChildren(paper);
 resizeObserver.observe(target);R.scaleSheet(target);const result=await R.readySheet(paper);R.scaleSheet(target);return result;
}
function showDialog(data,sample=false){
 const dialog=$('#sheet-dialog');if(!dialog.open)dialog.showModal();
 mount($('#dialog-sheet'),data,{sample,watermark:!sample}).then(result=>$('#dialog-note').textContent=sample?'नमुना माहिती · तुमचे तपशील भरल्यानंतर ही रचना वापरली जाईल.':result?.fits?'माहिती बदलताच हे पूर्वावलोकनही बदलते.':'माहिती खूप मोठी आहे. काही तपशील थोडक्यात लिहा.');
}
$('[data-close-dialog]')?.addEventListener('click',()=>$('#sheet-dialog').close());
$('#sheet-dialog')?.addEventListener('click',event=>{if(event.target===$('#sheet-dialog'))$('#sheet-dialog').close();});
function card(t){
 return '<article class="template-card '+(draft.templateId===t.id?'is-selected':'')+'"><div class="template-shot"><div class="sheet-viewport" data-thumb="'+t.id+'"></div></div><div class="template-caption"><div><h3>'+t.name+'</h3><small>'+(t.photo?'फोटोसह':'फोटोशिवाय')+'</small></div><div class="template-actions"><button class="btn secondary" data-choose="'+t.id+'">ही रचना निवडा →</button><button class="icon-btn" data-look="'+t.id+'" aria-label="'+t.name+' मोठी पहा"><svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></div></div></article>';
}
function gallery(target,items){
 target.innerHTML=items.map(card).join('');
 target.querySelectorAll('[data-thumb]').forEach(el=>{const d=P.demo();d.templateId=el.dataset.thumb;d.showPhoto=true;mount(el,d,{sample:true,watermark:false});});
}
document.addEventListener('click',event=>{
 const choose=event.target.closest('[data-choose]'),look=event.target.closest('[data-look]');
 if(choose){draft.templateId=choose.dataset.choose;draft.showPhoto=currentTemplate().photo;save();location.href='builder.html';}
 if(look){const d=P.demo();d.templateId=look.dataset.look;showDialog(d,true);}
});
if(page==='home'){mount($('#hero-sheet'),P.demo(),{sample:true,watermark:false});gallery($('#home-templates'),P.templates.slice(0,4));}
if(page==='templates'){
 const draw=filter=>{const items=P.templates.filter(t=>filter==='all'||(filter==='photo'?t.photo:!t.photo));gallery($('#template-gallery'),items);$('#template-count').textContent=new Intl.NumberFormat('mr').format(items.length)+' रचना';};
 draw('all');document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});draw(b.dataset.filter);}));
}
function controls(s,key,index,length){return '<div class="row-tools"><button type="button" data-action="up" data-key="'+key+'" '+(index===0?'disabled':'')+' aria-label="रकाना वर हलवा">↑</button><button type="button" data-action="down" data-key="'+key+'" '+(index===length-1?'disabled':'')+' aria-label="रकाना खाली हलवा">↓</button><button type="button" data-action="hide" data-key="'+key+'" aria-label="रकाना लपवा">×</button></div>';}
function field(s,key,index,length){
 const custom=draft.custom[s].find(i=>i.id===key);if(custom)return '<div class="field-row custom-row" data-row="'+key+'"><label>रकान्याचे नाव<input maxlength="80" data-custom-label="'+key+'" value="'+E(custom.label)+'" placeholder="उदा. छंद"></label><label>माहिती<input maxlength="1500" data-custom-value="'+key+'" value="'+E(custom.value)+'" placeholder="तपशील लिहा"></label>'+controls(s,key,index,length)+'</div>';
 const meta=P.sections[s].fields.find(f=>f[0]===key);if(!meta)return '';
 const [,label,placeholder,options]=meta,value=draft.values[key]||'';
 let input='';
 if(options){
  const opts=options.filter(o=>o!=='इतर'),other=value&&!opts.includes(value);
  input='<select data-field="'+key+'"><option value="">'+E(placeholder)+'</option>'+opts.map(o=>'<option '+(o===value?'selected':'')+' value="'+E(o)+'">'+E(o)+'</option>').join('')+'<option value="__other__" '+(other?'selected':'')+'>इतर · स्वतः लिहा</option></select><input data-other="'+key+'" aria-label="'+label+' स्वतः लिहा" placeholder="तुमचा तपशील लिहा" maxlength="1500" value="'+E(other?value:'')+'" '+(other?'':'hidden')+'>';
 }else if(['about','address','expectations','relatives'].includes(key))input='<textarea rows="2" maxlength="1500" data-field="'+key+'" placeholder="'+E(placeholder)+'">'+E(value)+'</textarea>';
 else input='<input type="text" maxlength="1500" data-field="'+key+'" '+(['phone','whatsapp'].includes(key)?'inputmode="tel"':key==='email'?'inputmode="email"':'')+' value="'+E(value)+'" placeholder="'+E(placeholder)+'">';
 return '<div class="field-row" data-row="'+key+'"><label>'+label+input+'</label>'+controls(s,key,index,length)+'</div>';
}
function renderSection(s){
 const visible=draft.order[s].filter(k=>!draft.hidden[s].includes(k));
 $('#stack-'+s).innerHTML=visible.map((k,i)=>field(s,k,i,visible.length)).join('');
 $('#restore-'+s).innerHTML=draft.hidden[s].map(k=>'<button type="button" data-restore="'+k+'">+ '+E(P.sections[s].fields.find(f=>f[0]===k)?.[1]||draft.custom[s].find(i=>i.id===k)?.label||'रकाना')+' पुन्हा दाखवा</button>').join('');
}
function renderHeaders(){
 const choices=P.headers.filter(h=>h.file&&!h.legacy),selected=P.headers.find(h=>h.id===draft.header);
 const button=h=>'<button type="button" class="header-option '+(h.id===draft.header&&!draft.headerImage?'active':'')+'" aria-pressed="'+(h.id===draft.header&&!draft.headerImage)+'" data-header="'+h.id+'"><img src="'+h.file+'" alt="" loading="lazy"><small>'+h.name+'</small><span class="choice-tick" aria-hidden="true">✓</span></button>';
 $('#header-options').innerHTML=choices.map(button).join('')+'<button type="button" class="header-option upload-header '+(draft.headerImage?'active':'')+'" data-upload-header aria-pressed="'+!!draft.headerImage+'"><span class="upload-symbol" aria-hidden="true">＋</span><small>स्वतःचे देवतेचे चित्र<br>अपलोड करा</small></button>';
 $('#header-select').innerHTML='<optgroup label="श्री गणेश">'+choices.slice(0,5).map(h=>'<option value="'+h.id+'">'+h.name+'</option>').join('')+'</optgroup><optgroup label="इतर देवता">'+choices.slice(5).map(h=>'<option value="'+h.id+'">'+h.name+'</option>').join('')+'</optgroup>'+(selected?.legacy?'<option value="'+selected.id+'">'+selected.name+' · मागील निवड</option>':'')+'<option value="none">चिन्ह नको</option><option value="upload">स्वतःचे देवतेचे चित्र अपलोड करा…</option>';
 $('#header-select').value=draft.headerImage?'upload':draft.header;
 const src=draft.headerImage||selected?.file;
 $('#selected-header-preview').innerHTML=(src?'<img src="'+E(src)+'" alt="निवडलेले शीर्षक चित्र">':'<span aria-hidden="true">—</span>')+'<div><small>निवडलेले चिन्ह</small><strong>'+E(draft.headerImage?'तुमचे देवतेचे चित्र':selected?.name||'चिन्ह नको')+'</strong></div>';
 $('#header-remove').hidden=!draft.headerImage;
}
function chooseHeader(id){
 const next=P.headers.find(h=>h.id===id);if(!next)return;
 const standard=P.headers.some(h=>h.invocation===draft.values.invocation);
 if(next.invocation&&standard){draft.values.invocation=next.invocation;$('#invocation').value=next.invocation;}
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
 const t=currentTemplate();$('#selected-design').innerHTML='<div class="selected-name"><img src="assets/ganesha-line.svg" alt=""><div><small>निवडलेली रचना</small><b>'+t.name+'</b><a href="templates.html">बदला ↗</a></div></div>';
 $('#invocation').value=draft.values.invocation;$('#invocation').addEventListener('input',e=>{draft.values.invocation=e.target.value;bindSave();});
 $('#show-photo').checked=draft.showPhoto;$('#show-photo').disabled=!t.photo;
 $('#photo-note').textContent=t.photo?'फोटो ऐच्छिक आहे. तो काढल्यावर मजकुरासाठी अधिक जागा मिळते.':'फोटो दाखवण्यासाठी फोटोसह रचना निवडा.';
 $('#show-photo').addEventListener('change',e=>{draft.showPhoto=e.target.checked;save();});
 renderHeaders();showPhoto();
 $('#header-options').addEventListener('click',e=>{const b=e.target.closest('[data-header]');if(b)chooseHeader(b.dataset.header);if(e.target.closest('[data-upload-header]'))$('#header-upload').click();});
 $('#header-select').addEventListener('change',e=>{if(e.target.value==='upload'){$('#header-upload').click();renderHeaders();}else chooseHeader(e.target.value);});
 for(const kind of ['photo','header']){
  $('#'+kind+'-upload').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;draft[kind==='photo'?'photo':'headerImage']=await imageFile(file);showPhoto();renderHeaders();save();toast('चित्र जोडले.');}catch(error){toast(error.message);}finally{e.target.value='';}});
  $('#'+kind+'-remove').addEventListener('click',()=>{draft[kind==='photo'?'photo':'headerImage']=null;showPhoto();renderHeaders();save();});
 }
 $('#form-sections').innerHTML=Object.entries(P.sections).map(([s,meta],i)=>'<section id="'+s+'" class="form-card"><div class="card-title"><span class="section-icon">'+['०१','०२','०३','०४'][i]+'</span><div><h2>'+meta.title+'</h2><p>रकाने वर-खाली हलवा, लपवा किंवा स्वतःचे रकाने जोडा.</p></div></div><div id="stack-'+s+'"></div><button type="button" class="add-field" data-add="'+s+'">+ नवीन रकाना जोडा</button><div id="restore-'+s+'" class="restore-fields"></div></section>').join('');
 Object.keys(P.sections).forEach(s=>{
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
 $('#biodata-form').addEventListener('submit',e=>e.preventDefault());
 $('#live-preview').addEventListener('click',()=>{save();showDialog(draft);});
 $('#backup-draft').addEventListener('click',()=>{save();downloadBlob(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}),'marathi-patrika-draft.json');});
 $('#restore-draft').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>4000000)throw Error('मसुद्याची फाइल खूप मोठी आहे.');const data=JSON.parse(await f.text());if(!data.values||!data.order)throw Error('योग्य मसुद्याची फाइल निवडा.');localStorage.setItem('mpm-previous-draft',JSON.stringify(draft));draft=P.normalize(data);save();location.reload();}catch(error){toast(error.message);}});
 $('#reset-draft').addEventListener('click',()=>$('#reset-dialog').showModal());
 $('[data-cancel-reset]').addEventListener('click',()=>$('#reset-dialog').close());
 $('#confirm-reset').addEventListener('click',()=>{try{localStorage.setItem('mpm-previous-draft',JSON.stringify(draft));}catch{}draft=P.fresh();save();location.reload();});
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
let config=null,activeOrder=null,downloadToken=null,downloadReady=false,downloadBusy=false,paidOrderReady=false;
function selectedFormat(){return $('input[name="export-format"]:checked')?.value==='png'?'png':'pdf';}
function setDownloadStatus(text){$('#download-status').textContent=text;}
function updateDownloadLabels(){
 const label=selectedFormat().toUpperCase();
 $('#free-download').textContent='वॉटरमार्कसह '+label+' डाउनलोड ↓';
 const paid=$('#paid-download');
 if(paidOrderReady){
  paid.classList.remove('razorpay-pay');paid.textContent='अनलॉक केलेली '+label+' डाउनलोड ↓';paid.setAttribute('aria-label','अनलॉक केलेली '+label+' डाउनलोड करा');
 }else{
  paid.classList.add('razorpay-pay');paid.innerHTML='<span class="razorpay-copy"><small>Razorpay सुरक्षित पेमेंट</small><b>₹49 भरून अनलॉक करा</b></span><span class="razorpay-arrow" aria-hidden="true">→</span>';paid.setAttribute('aria-label','Razorpay ने 49 रुपये भरून पत्रिका अनलॉक करा');
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
async function paidStatus(){
 let result;
 if(!activeOrder?.orderToken)return {paid:false,matchesDraft:false};
 try{result=await(await api('/api/payment/status',{orderToken:activeOrder.orderToken,draft})).json();}
 catch(error){if(error.status!==403&&error.status!==404)throw error;activeOrder=null;downloadToken=null;paidOrderReady=false;try{sessionStorage.removeItem('mpm-order');}catch{}$('#retry-paid').hidden=true;updateDownloadLabels();return {paid:false,matchesDraft:false};}
 downloadToken=typeof result.downloadToken==='string'?result.downloadToken:null;paidOrderReady=!!result.paid&&!!result.matchesDraft&&!!downloadToken;updateDownloadLabels();return result;
}
async function downloadPaid(format){if(!downloadToken)throw Error('पेमेंटची सुरक्षित परवानगी उपलब्ध नाही. स्थिती पुन्हा तपासा.');await saveDocument(await api('/api/export/paid',{downloadToken,draft,format}),format);}
async function recoverPayment(){
 if(!activeOrder||downloadBusy)return;const format=selectedFormat();busy(true);
 try{const result=await paidStatus();if(result.paid&&result.matchesDraft)await downloadPaid(format);else if(result.paid)setDownloadStatus('पेमेंट झाले आहे, पण पत्रिका बदलली आहे. आधीचा मसुदा परत आणा किंवा नवीन पत्रिका अनलॉक करा.');else setDownloadStatus('पेमेंट अद्याप पूर्ण झालेले नाही. थोड्या वेळाने पुन्हा तपासा.');}
 catch(error){setDownloadStatus(error.message);}finally{busy(false);}
}
if(page==='download'){
 busy(false);
 $('#export-format').addEventListener('change',updateDownloadLabels);
 try{const saved=JSON.parse(sessionStorage.getItem('mpm-order'));if(saved?.id&&saved?.orderToken)activeOrder=saved;}catch{}
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
   if(activeOrder){const result=await paidStatus();if(result.paid&&result.matchesDraft){await downloadPaid(format);busy(false);return;}}
   setDownloadStatus('सुरक्षित पेमेंट सुरू होत आहे…');
   const order=await(await api('/api/payment/order',{draft})).json();
   if(typeof order.id!=='string'||typeof order.orderToken!=='string')throw Error('पेमेंटची ऑर्डर सुरक्षितपणे तयार झाली नाही. कृपया पुन्हा प्रयत्न करा.');
   activeOrder={id:order.id,orderToken:order.orderToken};downloadToken=null;paidOrderReady=false;
   try{sessionStorage.setItem('mpm-order',JSON.stringify(activeOrder));}catch{}$('#retry-paid').hidden=false;
   if(!window.Razorpay)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=resolve;script.onerror=()=>reject(Error('पेमेंट सेवा उघडली नाही. कृपया पुन्हा प्रयत्न करा.'));document.head.append(script);});
   const checkout=new Razorpay({key:config.keyId,order_id:order.id,amount:order.amount,currency:order.currency,name:'MarathiPatrikaMakers',description:'परिचय पत्रिका · वॉटरमार्कशिवाय PNG आणि PDF',theme:{color:'#912c49'},handler:async result=>{
    busy(true);setDownloadStatus('पेमेंटची पडताळणी होत आहे…');
    try{const verified=await(await api('/api/payment/verify',{...result,orderToken:activeOrder.orderToken})).json();downloadToken=verified.downloadToken;paidOrderReady=!!downloadToken;await downloadPaid(format);}
    catch(error){setDownloadStatus(error.message+' आधीच्या पेमेंटची स्थिती तपासा.');}finally{busy(false);}
   },modal:{ondismiss:()=>{setDownloadStatus('पेमेंट बंद केले. पूर्ण झाले असल्यास स्थिती तपासा.');busy(false);}}});
   checkout.on('payment.failed',()=>{setDownloadStatus('पेमेंट पूर्ण झाले नाही. कृपया पुन्हा प्रयत्न करा.');busy(false);});checkout.open();
  }catch(error){setDownloadStatus(error.message);busy(false);}
 });
}
window.addEventListener('pagehide',()=>{if(page==='builder')save();});

