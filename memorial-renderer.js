(function(root){
'use strict';
function createSheet(input,{watermark=false}={}){
 const d=MemorialData.normalize(input),design=MemorialData.designs.find(t=>t.id===d.templateId),sheet=document.createElement('article');
 sheet.className='memorial-paper frame-'+design.frame;sheet.style.setProperty('--memorial-bg',design.background);sheet.style.setProperty('--memorial-ink',design.ink);sheet.style.setProperty('--memorial-accent',design.accent);sheet.style.setProperty('--memorial-line',design.line);
 const border=document.createElement('div');border.className='memorial-border';sheet.append(border);
 const content=document.createElement('div');content.className='memorial-content';sheet.append(content);
 const portrait=document.createElement('div');portrait.className='memorial-portrait';
 if(d.photo){const img=document.createElement('img');img.src=d.photo;img.alt='';portrait.append(img);}else{portrait.classList.add('empty');portrait.setAttribute('aria-hidden','true');portrait.innerHTML='<svg viewBox="0 0 120 120"><circle cx="60" cy="42" r="19"/><path d="M24 105c2-24 17-38 36-38s34 14 36 38"/></svg>';}
 content.append(portrait);
 for(const row of d.rows){if(!row.value.trim())continue;const el=document.createElement('div');el.className='memorial-row row-'+row.type;el.textContent=row.type==='text'&&row.label.trim()?row.label.trim()+' : '+row.value.trim():row.value.trim();content.append(el);}
 const art=document.createElement('div');art.className='memorial-art';art.setAttribute('aria-hidden','true');art.innerHTML='<svg viewBox="0 0 440 120" xmlns="http://www.w3.org/2000/svg"><path d="M26 96c18-32 41-30 48-7-17 12-31 16-48 7zm36 8c21-15 38-10 40 3-14 6-28 5-40-3zm270 3c2-13 19-18 40-3-12 8-26 9-40 3zm28-18c7-23 30-25 48 7-17 9-31 5-48-7z" fill="#ca8b35" opacity=".65"/><path d="M199 91h42l-5 10h-32zM178 70c8 24 22 28 42 28s34-4 42-28z" fill="#a96d2d" stroke="#70471f" stroke-width="2"/><path d="M220 68c-12-11-8-21 0-33 8 12 12 22 0 33z" fill="#f2aa34"/><path d="M220 66c-4-5-3-10 0-15 3 5 4 10 0 15z" fill="#fff5bb"/><path d="M206 105h28" stroke="#70471f" stroke-width="3" stroke-linecap="round"/></svg>';sheet.append(art);
 if(watermark){const mark=document.createElement('div');mark.className='memorial-watermark';mark.textContent='MarathiPatrikaMakers · नमुना';sheet.append(mark);}
 return sheet;
}
async function readySheet(sheet){await document.fonts.ready;await Promise.all([...sheet.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})));const content=sheet.querySelector('.memorial-content');const fits=content.scrollHeight<=content.clientHeight+1;return {fits};}
root.MemorialRender={createSheet,readySheet};
})(typeof globalThis!=='undefined'?globalThis:this);
