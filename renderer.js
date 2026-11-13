/* One geometry for screen, thumbnails and server-rendered A4 export. */
(function(root){
'use strict';
const P=root.Patrika, E=P.esc;
function flower(x,y,r,color,petals=8){
 return '<g transform="translate('+x+' '+y+')" fill="none" stroke="'+color+'" stroke-width="1.1">'+Array.from({length:petals},(_,i)=>'<ellipse cx="0" cy="-'+r*.6+'" rx="'+r*.18+'" ry="'+r*.42+'" transform="rotate('+i*360/petals+')"/>').join('')+'<circle r="'+r*.15+'"/></g>';
}
function border(t){
 const c=t.color,n=t.index;let shapes='';
 const pattern=n%8;
 if(['minimal','double','corner','bracket','classic'].includes(t.border)){
  shapes='<rect x="17" y="17" width="760" height="1089" fill="none" stroke="'+c+'" stroke-width="'+(pattern===0?2:1)+'"/>';
  if(t.border!=='minimal')shapes+='<rect x="23" y="23" width="748" height="1077" fill="none" stroke="'+c+'" stroke-width=".7"/>';
  if(t.border==='corner'||t.border==='bracket')shapes+='<path d="M16 85V16h69M709 16h69v69M16 1038v69h69M709 1107h69v-69" fill="none" stroke="'+c+'" stroke-width="6"/>';
 }else{
  const top=[];
  for(let x=20;x<794;x+=42){
   if(pattern===0||pattern===3)top.push(flower(x,30,17,c,pattern===3?6:8));
   else if(pattern===1)top.push('<path d="m'+x+' 45v-16l17-17 17 17v16M'+(x+6)+' 45V31l11-11 11 11v14" fill="none" stroke="'+c+'" stroke-width="1.3"/>');
   else if(pattern===2)top.push('<path d="M'+x+' 44q-15-23 7-28 25 5 4 28m-8-5q-8-15 4-17 11 6 3 17" fill="none" stroke="'+c+'" stroke-width="1.4"/>');
   else if(pattern===4)top.push('<path d="m'+x+' 14 18 16-18 16-18-16z" fill="none" stroke="'+c+'"/><path d="m'+x+' 21 10 9-10 9-10-9z" fill="'+c+'" opacity=".5"/>');
   else if(pattern===5)top.push('<path d="M'+(x-20)+' 40q20-46 40 0M'+(x-20)+' 40q20-30 40 0" fill="none" stroke="'+c+'" stroke-width="1.3"/>');
   else if(pattern===6)top.push('<path d="m'+(x-15)+' 15 30 30m0-30-30 30m-5-15h40" stroke="'+c+'" stroke-width="1.3"/>'+flower(x,30,9,c,4));
   else top.push('<path d="M'+(x-20)+' 35q20-14 40 0m-20 0q-17-2-12-17 15 3 12 17m4-2q2-15 15-13-1 14-15 13" fill="none" stroke="'+c+'" stroke-width="1.3"/>');
  }
  const band='<rect width="794" height="10" fill="'+c+'"/><path d="M0 13H794M0 49H794M0 53H794" stroke="'+c+'" stroke-width="1.5"/>'+top.join('');
  shapes=band+'<g transform="translate(0 1123) scale(1 -1)">'+band+'</g>';
  if(['paithani','royal','medallion','lattice'].includes(t.border))shapes+='<path d="M14 60v1003M780 60v1003" stroke="'+c+'" stroke-width="1"/>';
 }
 return '<svg class="paper-border" viewBox="0 0 794 1123" aria-hidden="true">'+shapes+'</svg>';
}
function createSheet(input,{watermark=true,sample=false}={}){
 const d=P.normalize(input),t=P.templates.find(t=>t.id===d.templateId)||P.templates[0];
 const paper=document.createElement('article');paper.className='biodata-paper';paper.style.setProperty('--paper-accent',t.color);
 const groups=[
 {title:'वैयक्तिक माहिती',rows:[...P.entries(d,'personal'),...P.entries(d,'patrika')]},
 {title:'कौटुंबिक माहिती',rows:P.entries(d,'family')},
 {title:'संपर्क',rows:P.entries(d,'contact')}
 ].filter(s=>s.rows.length);
 const head=P.headers.find(h=>h.id===d.header);
 const src=d.headerImage||head?.file;
 const photo=d.showPhoto&&t.photo&&d.photo?'<img class="biodata-photo" src="'+E(d.photo)+'" alt="छायाचित्र" />':(sample&&t.photo?'<div class="biodata-photo sample-photo" aria-hidden="true"><svg viewBox="0 0 100 130"><rect width="100" height="130" fill="#ede7e2"/><circle cx="50" cy="43" r="22" fill="#c7b6ac"/><path d="M12 130V105q0-40 38-40t38 40v25" fill="#ad9890"/></svg></div>':'');
 paper.innerHTML=border(t)+'<div class="paper-safe"><div class="paper-content"><header class="biodata-heading">'+(src?'<img class="ganesh-icon" src="'+E(src)+'" alt="" />':'')+(d.values.invocation.trim()?'<p>'+E(d.values.invocation)+'</p>':'')+'<h1>परिचय पत्रिका</h1></header><div class="biodata-sections">'+(groups.length?groups.map((s,i)=>'<section class="biodata-section"><h2>'+s.title+'</h2><dl>'+(i===0?photo:'')+s.rows.map(r=>'<div class="biodata-row"><dt>'+E(r.label)+'</dt><span aria-hidden="true">:</span><dd>'+E(r.value)+'</dd></div>').join('')+'</dl></section>').join(''):'<p class="paper-empty">तुमची माहिती भरल्यानंतर परिचय पत्रिका येथे दिसेल.</p>')+'</div></div></div>'+(watermark?'<div class="document-watermark" aria-label="पूर्वावलोकन वॉटरमार्क"><span>MarathiPatrikaMakers</span><span>पूर्वावलोकन</span><span>MarathiPatrikaMakers</span></div>':'');
 return paper;
}
function fitSheet(paper){
 const safe=paper.querySelector('.paper-safe'),content=paper.querySelector('.paper-content');
 if(!paper.isConnected||!safe.clientHeight)return {fits:false,font:0};
 paper.style.setProperty('--row-gap','0px');
 const fits=()=>content.scrollHeight<=safe.clientHeight-2&&[...paper.querySelectorAll('.biodata-row')].every(r=>r.scrollWidth<=r.clientWidth+1);
 let low=9,high=32;
 for(let i=0;i<14;i++){let mid=(low+high)/2;paper.style.setProperty('--body-size',mid+'px');if(fits())low=mid;else high=mid;}
 paper.style.setProperty('--body-size',Math.floor(low*100)/100+'px');
 // Distribute remaining room across rows, keeping margins and header size stable.
 let gl=0,gh=64;
 for(let i=0;i<10;i++){let mid=(gl+gh)/2;paper.style.setProperty('--row-gap',mid+'px');if(fits())gl=mid;else gh=mid;}
 paper.style.setProperty('--row-gap',Math.floor(gl*100)/100+'px');
 const result={fits:fits(),font:low,contentHeight:content.scrollHeight,available:safe.clientHeight};
 paper.dataset.fits=String(result.fits);return result;
}
async function readySheet(paper){
 await document.fonts.ready;
 await Promise.all([...paper.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})));
 return fitSheet(paper);
}
function scaleSheet(wrapper){
 const paper=wrapper.querySelector('.biodata-paper');if(!paper)return;
 const scale=wrapper.clientWidth/794;
 paper.style.transform='scale('+scale+')';wrapper.style.height=(1123*scale)+'px';
}
root.PatrikaRender={createSheet,fitSheet,readySheet,scaleSheet,border};
})(globalThis);

