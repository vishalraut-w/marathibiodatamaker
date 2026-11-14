/* Homepage-only language switch. The editor and template pages remain Marathi. */
'use strict';
if(document.body.dataset.page==='home'){
 const original=new Map();
 const translations=[
  ['.skip-link','Skip to main content'],['.brand small','A beautiful start to your story.'],
  ['.site-header nav > a[href="templates.html"]','View designs'],['.site-header nav > a[href$="#how"]','How it works'],
  ['.site-header nav > a.btn','Create biodata <span aria-hidden="true">↗</span>'],
  ['.hero-copy .eyebrow','<span></span>Rooted in tradition. Made for you.'],
  ['.hero h1','A new beginning.<br>A beautiful <em>introduction.</em>'],
  ['.hero-lead','Your story, in your own words. Choose a design you love and create your biodata in a few simple steps.'],
  ['.hero-actions .btn','Create my biodata <span aria-hidden="true">→</span>'],
  ['.hero-actions .text-link','Explore designs <span aria-hidden="true">↗</span>'],
  ['.hero-facts span:nth-child(1)','✓ In Marathi'],['.hero-facts span:nth-child(2)','✓ Your own design'],['.hero-facts span:nth-child(3)','✓ Print-ready A4'],
  ['.sample-label','Your biodata could look like this'],['.design-stamp span','Beautiful designs'],['.hero-caption','Sample details · Your introduction, your way'],
  ['.promise-strip span:nth-of-type(1)','A traditional beginning'],['.promise-strip span:nth-of-type(2)','With or without a photo'],['.promise-strip span:nth-of-type(3)','Fields of your choice'],['.promise-strip span:nth-of-type(4)','Elegant Marathi type'],
  ['.design-section .eyebrow','From traditional to minimal'],['.design-section h2','A special design for every introduction.'],['.design-section .text-link','View all 24 designs →'],
  ['.how-section .eyebrow','It is simple'],['.how-section h2','Your biodata in three easy steps.'],
  ['.how-grid article:nth-child(1) h3','Choose a design you like'],['.how-grid article:nth-child(1) p','Choose from floral, Paithani, peacock feather, or simple frame designs.'],
  ['.how-grid article:nth-child(2) h3','Enter your details'],['.how-grid article:nth-child(2) p','Add personal, family, and contact information in one place.'],
  ['.how-grid article:nth-child(3) h3','Review and download'],['.how-grid article:nth-child(3) p','Check your details, photo, and layout before downloading the final copy.'],
  ['.faq-section .eyebrow','Your questions'],['.faq-section h2','A little more to know.'],['.faq-section>div:first-child>p:last-child','Creating biodata for the first time?<br>We have made it simple.'],
  ['.faq-list details:nth-child(1) summary','Can I change the details later?'],['.faq-list details:nth-child(1) p','Yes. Your draft is saved in this browser. You can edit the details, photo, and design again.'],
  ['.faq-list details:nth-child(2) summary','Will blank fields appear in the biodata?'],['.faq-list details:nth-child(2) p','No. Only filled fields that you choose to show appear in the final biodata.'],
  ['.faq-list details:nth-child(3) summary','What if I add too many fields?'],['.faq-list details:nth-child(3) p','Text size and spacing adjust to the available space. A preview warning appears if there is too much content.'],
  ['.faq-list details:nth-child(4) summary','How do I type Marathi on my phone?'],['.faq-list details:nth-child(4) p','Select Marathi on your phone keyboard. On a computer, use a Marathi keyboard or paste text you have already typed.'],
  ['.site-footer .brand-text span','For connections made from the heart.'],['.site-footer>div a:nth-child(1)','Designs'],['.site-footer>div a:nth-child(2)','Help'],['.site-footer>div a:nth-child(3)','Privacy'],['.site-footer>small','A beautiful introduction in Marathi.'],
  ['.dialog-toolbar strong','Biodata · Preview']
 ];
 const elements=translations.map(([selector,english])=>[document.querySelector(selector),english]);
 for(const [el] of elements)if(el)original.set(el,el.innerHTML);
 const dynamicOriginal=new Map(),originalLabels=new Map();
 const dialogNote=document.querySelector('#dialog-note');
 let currentLanguage='mr',marathiDialogNote='';
 function syncDialogNote(){
  if(!dialogNote?.textContent)return;
  if(dialogNote.textContent!=='Sample preview · Your final biodata will use your details.')marathiDialogNote=dialogNote.textContent;
  const next=currentLanguage==='en'?'Sample preview · Your final biodata will use your details.':marathiDialogNote;
  if(next&&dialogNote.textContent!==next)dialogNote.textContent=next;
 }
 if(dialogNote)new MutationObserver(syncDialogNote).observe(dialogNote,{childList:true,characterData:true,subtree:true});
 const buttons=[...document.querySelectorAll('.home-language button')];
 function setLanguage(lang){
  currentLanguage=lang;
  document.documentElement.lang=lang;
  for(const [el,english] of elements)if(el)el.innerHTML=lang==='en'?english:original.get(el);
  document.querySelectorAll('[data-en]').forEach(el=>{
   if(!dynamicOriginal.has(el))dynamicOriginal.set(el,el.textContent);
   el.textContent=lang==='en'?el.dataset.en:dynamicOriginal.get(el);
  });
  document.querySelectorAll('#home-templates .template-card').forEach((card,index)=>{
   const name=card.querySelector('h3'),type=card.querySelector('small'),choose=card.querySelector('[data-choose]'),look=card.querySelector('[data-look]');
   for(const el of [name,type,choose])if(el&&!dynamicOriginal.has(el))dynamicOriginal.set(el,el.innerHTML);
   if(look&&!originalLabels.has(look))originalLabels.set(look,look.getAttribute('aria-label'));
   if(lang==='en'){
    if(name)name.textContent=englishDesigns[index]||name.textContent;
    if(type)type.textContent=card.querySelector('[data-choose]')?.dataset.choose&&Patrika.templates.find(t=>t.id===choose.dataset.choose)?.photo?'With photo':'Without photo';
    if(choose)choose.innerHTML='Choose design →';
    if(look)look.setAttribute('aria-label','Preview '+(name?.textContent||'design'));
   }else{
    for(const el of [name,type,choose])if(el)el.innerHTML=dynamicOriginal.get(el);
    if(look)look.setAttribute('aria-label',originalLabels.get(look));
   }
  });
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===lang)));
  document.querySelector('.site-header nav')?.setAttribute('aria-label',lang==='en'?'Main navigation':'मुख्य नेव्हिगेशन');
  document.querySelector('.brand')?.setAttribute('aria-label',lang==='en'?'MarathiPatrikaMakers home':'MarathiPatrikaMakers मुख्यपृष्ठ');
  document.querySelector('[data-close-dialog]')?.setAttribute('aria-label',lang==='en'?'Close preview':'पूर्वावलोकन बंद करा');
  document.querySelector('.home-language')?.setAttribute('aria-label',lang==='en'?'Homepage language':'मुख्यपृष्ठाची भाषा');
  syncDialogNote();
  document.title=lang==='en'?'Marathi biodata designs · MarathiPatrikaMakers':'मराठी परिचय पत्रिका · MarathiPatrikaMakers';
  document.querySelector('meta[name="description"]').content=lang==='en'?'Create Marathi biodata online. Choose a design, fill in your details, and preview an A4 page.':'तुमची परिचय पत्रिका मराठीत तयार करा. आकर्षक रचना, सोपा फॉर्म आणि A4 पूर्वावलोकन.';
  try{localStorage.setItem('mpm-home-language',lang)}catch{}
 }
 const englishDesigns=['Floral Lines','Auspicious Gold','Peacock Feather','Rose Petal'];
 buttons.forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
 document.addEventListener('click',event=>{for(const menu of document.querySelectorAll('.home-nav-menu'))if(!menu.contains(event.target))menu.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.home-nav-menu').forEach(menu=>menu.open=false);});
 document.querySelectorAll('.home-nav-menu').forEach(menu=>menu.addEventListener('toggle',()=>{if(menu.open)document.querySelectorAll('.home-nav-menu').forEach(other=>{if(other!==menu)other.open=false;});}));
 let saved='mr';try{saved=localStorage.getItem('mpm-home-language')==='en'?'en':'mr'}catch{}
 setLanguage(saved);
}
