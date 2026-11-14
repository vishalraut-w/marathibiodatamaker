/* Language and dropdown controls for the shared navigation on inner pages. */
'use strict';
{
 const nav=document.querySelector('.site-header nav');
 if(nav){
  const pairs=[
   [nav.querySelector('a[href="templates.html"]'),'View designs'],
   [nav.querySelector('a[href$="#how"]'),'How it works'],
   [nav.querySelector('a.btn'),'Create biodata <span aria-hidden="true">↗</span>'],
   [document.querySelector('.site-header .brand small'),'A beautiful start to your story.']
  ].filter(([el])=>el).map(([el,en])=>({el,en,mr:el.innerHTML}));
  const words=[...nav.querySelectorAll('[data-en]')].map(el=>({el,en:el.dataset.en,mr:el.textContent}));
  const buttons=[...nav.querySelectorAll('.home-language button')];
  function setLanguage(lang){
   pairs.forEach(({el,en,mr})=>{el.innerHTML=lang==='en'?en:mr;});
   words.forEach(({el,en,mr})=>{el.textContent=lang==='en'?en:mr;});
   buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===lang)));
   nav.lang=lang;
   nav.setAttribute('aria-label',lang==='en'?'Main navigation':'मुख्य नेव्हिगेशन');
   nav.querySelector('.home-language')?.setAttribute('aria-label',lang==='en'?'Navigation language':'नेव्हिगेशनची भाषा');
   try{localStorage.setItem('mpm-home-language',lang);}catch{}
  }
  buttons.forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
  document.addEventListener('click',event=>{nav.querySelectorAll('.home-nav-menu').forEach(menu=>{if(!menu.contains(event.target))menu.open=false;});});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')nav.querySelectorAll('.home-nav-menu').forEach(menu=>menu.open=false);});
  nav.querySelectorAll('.home-nav-menu').forEach(menu=>menu.addEventListener('toggle',()=>{if(menu.open)nav.querySelectorAll('.home-nav-menu').forEach(other=>{if(other!==menu)other.open=false;});}));
  let lang='mr';try{if(localStorage.getItem('mpm-home-language')==='en')lang='en';}catch{}
  setLanguage(lang);
 }
}
