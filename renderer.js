/* One geometry for screen, thumbnails and server-rendered A4 export. */
(function(root){
'use strict';
const P=root.Patrika, E=P.esc;
function flower(x,y,r,color,petals=8){
 return '<g transform="translate('+x+' '+y+')" fill="none" stroke="'+color+'" stroke-width="1.1">'+Array.from({length:petals},(_,i)=>'<ellipse cx="0" cy="-'+r*.6+'" rx="'+r*.18+'" ry="'+r*.42+'" transform="rotate('+i*360/petals+')"/>').join('')+'<circle r="'+r*.15+'"/></g>';
}
function ornateBorder(t){
 const main=t.color,k=t.border,dark=t.index%2===1;
 const trims={
  'mandala-heavy':['#71394d','#f8deb0'],'mandala-corner':['#76623d','#c3e2ed'],
  'mandala-arch':['#684a75','#f0c4a7'],'sunburst':['#8b443d','#c3b4df'],
  marigold:['#5d6840','#b2d2a3'],'rose-vine':['#8b624d','#eed1a9'],
  jasmine:['#a36b42','#d7bd8a'],'lotus-chain':['#634d80','#bcb6ea'],
  blossom:['#8f5458','#d2c59a'],zari:['#7d3750','#f2daa2'],
  jali:['#a56e40','#bbdcce'],geometric:['#915a54','#e3c6a9'],
  heritage:['#966f35','#e8c98f'],'peacock-eye':['#a15e44','#d7bb85'],
  'art-deco':['#3d6a75','#c4d2d8'],blockprint:['#6d5885','#e2c8db']
 };
 const trim=trims[k]?.[dark?1:0]||main;
 const path=(d,color=trim,width=2)=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="square" stroke-linejoin="miter"/>';
 let detail='';
 switch(k){
  case 'mandala-heavy': detail='<circle cx="16" cy="16" r="14" fill="none" stroke="'+trim+'" stroke-width="3"/><circle cx="16" cy="16" r="6" fill="'+main+'"/>'+path('M16-3V2M16 30v5M-3 16h5M30 16h5',trim,3);break;
  case 'mandala-corner': detail='<circle cx="16" cy="16" r="13" fill="none" stroke="'+trim+'" stroke-width="3"/>'+path('M16 3 29 16 16 29 3 16Z',main,3);break;
  case 'mandala-arch': detail=path('M0 32V18Q0 0 18 0H32M7 32V18Q7 7 18 7H32',trim,3)+'<circle cx="18" cy="18" r="4" fill="'+main+'"/>';break;
  case 'sunburst': detail=path('M4 30 30 4M4 19 19 4M15 30 30 15M3 7h5M26 30h5',trim,3)+'<circle cx="19" cy="19" r="5" fill="'+main+'"/>';break;
  case 'marigold': detail=path('M2 30V2h28M9 30V9h21M16 30V16h14',trim,3);break;
  case 'rose-vine': detail=path('M0 31Q0 0 31 0M8 31Q8 8 31 8M16 31Q16 16 31 16',trim,3);break;
  case 'jasmine': detail=path('M2 30 30 2M2 19 19 2M13 30 30 13',trim,3)+'<rect x="13" y="13" width="7" height="7" fill="'+main+'"/>';break;
  case 'lotus-chain': detail=path('M0 32 16 0 32 32M8 32 16 16 24 32',trim,3);break;
  case 'blossom': detail=path('M1 31V1H31M10 31V10H31',trim,3)+'<circle cx="21" cy="21" r="5" fill="'+main+'"/>';break;
  case 'zari': detail=path('M0 24 24 0M0 32 32 0M8 32 32 8',trim,4);break;
  case 'jali': detail=path('M0 16 16 0 32 16 16 32ZM0 32 32 0',trim,2.5);break;
  case 'geometric': detail=path('M0 32V0H32M8 32V8H32M16 32V16H32',trim,3);break;
  case 'heritage': detail=path('M0 32V0H32M7 32V7H32M14 32V14H32',trim,3)+'<rect x="21" y="21" width="7" height="7" fill="'+main+'"/>';break;
  case 'peacock-eye': detail=path('M0 28Q0 0 28 0M7 28Q7 7 28 7',trim,3)+'<circle cx="23" cy="23" r="7" fill="none" stroke="'+trim+'" stroke-width="3"/>';break;
  case 'art-deco': detail=path('M0 32V0H32M7 32V7H32M14 32V14H32',trim,2.5)+path('M20 30V20h10',main,4);break;
  default: detail=path('M0 32V0H32M8 32V8H32M16 32V16H32',trim,3)+'<rect x="23" y="23" width="6" height="6" fill="'+trim+'"/>';
 }
 const corners=[[32,32,''],[762,32,'scale(-1 1)'],[32,1091,'scale(1 -1)'],[762,1091,'scale(-1 -1)']]
  .map(([x,y,flip])=>'<g transform="translate('+x+' '+y+') '+flip+'">'+detail+'</g>').join('');
 const width=['mandala-heavy','zari','heritage','blockprint'].includes(k)?15:11;
 let shapes='<rect x="10" y="10" width="774" height="1103" fill="none" stroke="'+main+'" stroke-width="'+width+'"/>';
 shapes+='<rect x="26" y="26" width="742" height="1071" fill="none" stroke="'+trim+'" stroke-width="3"/>';
 shapes+='<rect x="41" y="41" width="712" height="1041" fill="none" stroke="'+main+'" stroke-width="'+(dark?2:1.5)+'"/>';
 shapes+=corners;
 if(['mandala-heavy','sunburst','zari','heritage'].includes(k)){
  shapes+=path('M82 49H360M434 49H712M82 1074H360M434 1074H712',trim,3);
  shapes+='<path d="M397 31 416 49 397 67 378 49ZM397 1056 416 1074 397 1092 378 1074Z" fill="'+main+'" stroke="'+trim+'" stroke-width="2"/>';
 }else if(['jali','geometric','art-deco','blockprint'].includes(k)){
  shapes+=path('M84 52H710M84 1071H710M52 84V1039M742 84V1039',trim,2);
  shapes+='<rect x="389" y="43" width="16" height="16" fill="'+trim+'"/><rect x="389" y="1064" width="16" height="16" fill="'+trim+'"/>';
 }
 return '<svg class="paper-border" viewBox="0 0 794 1123" aria-hidden="true">'+shapes+'</svg>';
}
function buddhistBorder(t){
 const c=t.color,trim=t.index%2?'#e7cf9e':'#be955d';
 const wheel=(x,y,r)=>'<g transform="translate('+x+' '+y+')" fill="none" stroke="'+c+'" stroke-width="2"><circle r="'+r+'"/><circle r="'+(r*.72)+'"/><circle r="'+(r*.18)+'"/>'+Array.from({length:8},(_,i)=>'<path d="M0 -'+(r*.18)+'V-'+(r*.72)+'" transform="rotate('+(i*45)+')"/>').join('')+'</g>';
 let s='<rect x="10" y="10" width="774" height="1103" fill="none" stroke="'+c+'" stroke-width="12"/><rect x="27" y="27" width="740" height="1069" fill="none" stroke="'+trim+'" stroke-width="3"/>';
 if(t.border==='wheel'){
  s+=wheel(40,40,19)+wheel(754,40,19)+wheel(40,1083,19)+wheel(754,1083,19);
 }else if(t.border==='bodhi'){
  const leaf='<path d="M0 19Q-24 5 0-20Q24 5 0 19ZM0-19V16" fill="none" stroke="'+c+'" stroke-width="2.5"/>';
  for(const [x,y] of [[42,42],[752,42],[42,1081],[752,1081]])s+='<g transform="translate('+x+' '+y+')">'+leaf+'</g>';
 }else if(t.border==='rays'){
  s+='<path d="M32 90V32H90M704 32h58v58M32 1033v58h58M704 1091h58v-58" fill="none" stroke="'+c+'" stroke-width="8"/>';
  s+=wheel(397,44,18)+wheel(397,1079,18);
 }else if(t.border==='azure'){
  s+='<rect x="41" y="41" width="712" height="1041" fill="none" stroke="'+c+'" stroke-width="5"/>';
  s+='<path d="M80 51H335M459 51H714M80 1072H335M459 1072H714" stroke="'+trim+'" stroke-width="5"/>';
  s+=wheel(397,48,20)+wheel(397,1075,20);
 }else if(t.border==='archway'){
  s+='<path d="M34 92V34H92M34 74V51H68M702 34h58v58M726 51h17v23M34 1031v58h58M34 1049v23h34M702 1089h58v-58M726 1072h17v-23" fill="none" stroke="'+c+'" stroke-width="8"/>';
  s+='<path d="M340 47 369 30H425L454 47M340 1076l29 17h56l29-17" fill="none" stroke="'+trim+'" stroke-width="4"/>'+wheel(397,46,14)+wheel(397,1077,14);
 }else if(t.border==='minimal-wheel'){
  s+='<rect x="42" y="42" width="710" height="1039" fill="none" stroke="'+c+'" stroke-width="2" stroke-dasharray="5 9"/>';
  s+='<path d="M33 100V33H100M694 33h67v67M33 1023v67h67M694 1090h67v-67" fill="none" stroke="'+trim+'" stroke-width="5"/>'+wheel(397,43,17)+wheel(397,1080,17);
 }else if(t.border==='stepped'){
  s+='<path d="M35 105V35h70M35 79V49h30M689 35h70v70M729 49h30v30M35 1018v70h70M35 1044v30h30M689 1088h70v-70M729 1074h30v-30" fill="none" stroke="'+c+'" stroke-width="8"/>';
  for(let x=140;x<=654;x+=85)s+='<path d="M'+x+' 34l12 12-12 12-12-12z M'+x+' 1065l12 12-12 12-12-12z" fill="none" stroke="'+trim+'" stroke-width="3"/>';
 }else if(t.border==='bodhi-path'){
  const leaf='<path d="M0 17Q-21 4 0-19Q21 4 0 17ZM0-17V15" fill="none" stroke="'+c+'" stroke-width="3"/>';
  for(const [x,y] of [[42,42],[752,42],[42,1081],[752,1081],[42,561],[752,561]])s+='<g transform="translate('+x+' '+y+')">'+leaf+'</g>';
  s+='<path d="M48 85V515M48 607V1038M746 85V515M746 607V1038" stroke="'+trim+'" stroke-width="4"/>';
 }else if(t.border==='waves'){
  s+='<path d="M80 39Q200 59 320 39M474 39Q594 59 714 39M80 51Q200 31 320 51M474 51Q594 31 714 51M80 1084Q200 1064 320 1084M474 1084Q594 1064 714 1084M80 1072Q200 1092 320 1072M474 1072Q594 1092 714 1072" fill="none" stroke="'+trim+'" stroke-width="3"/>'+wheel(397,45,20)+wheel(397,1078,20);
 }else if(t.border==='five-colors'){
  const colors=['#2468aa','#e2b12d','#bd3d3e','#faf9f2','#e58831'];
  colors.forEach((color,i)=>{const inset=19+i*6;s+='<rect x="'+inset+'" y="'+inset+'" width="'+(794-2*inset)+'" height="'+(1123-2*inset)+'" fill="none" stroke="'+color+'" stroke-width="5"/>';});
  s+=wheel(397,52,14)+wheel(397,1071,14);
 }else{
  s+='<path d="M44 90V44H90M704 44h46v46M44 1033v46h46M704 1079h46v-46" fill="none" stroke="'+c+'" stroke-width="7"/>';
  s+=wheel(397,44,18)+wheel(397,1079,18)+'<path d="M52 105V1018M742 105V1018" stroke="'+trim+'" stroke-width="3"/>';
 }
 return '<svg class="paper-border" viewBox="0 0 794 1123" aria-hidden="true">'+s+'</svg>';
}
function islamicBorder(t){
 const c=t.color,trim=c;
 const star=(x,y,r)=>'<g transform="translate('+x+' '+y+')" fill="none" stroke="'+c+'" stroke-width="2"><rect x="-'+r*.65+'" y="-'+r*.65+'" width="'+r*1.3+'" height="'+r*1.3+'"/><rect x="-'+r*.65+'" y="-'+r*.65+'" width="'+r*1.3+'" height="'+r*1.3+'" transform="rotate(45)"/></g>';
 const crescent=(x,y)=>'<path d="M'+(x+8)+' '+(y-15)+' A18 18 0 1 0 '+(x+8)+' '+(y+15)+' A14 14 0 0 1 '+(x+8)+' '+(y-15)+'Z" fill="none" stroke="'+c+'" stroke-width="2.5"/>';
 let s='<rect x="10" y="10" width="774" height="1103" fill="none" stroke="'+c+'" stroke-width="11"/><rect x="27" y="27" width="740" height="1069" fill="none" stroke="'+trim+'" stroke-width="3"/>';
 s+='<path d="M35 105V35H105M689 35h70v70M35 1018v70h70M689 1088h70v-70" fill="none" stroke="'+trim+'" stroke-width="8" stroke-linejoin="miter"/>';
 if(t.border==='arch'||t.border==='mihrab'){
  s+='<path d="M75 60H320Q350 60 397 32Q444 60 474 60H719M75 1063H320Q350 1063 397 1091Q444 1063 474 1063H719" fill="none" stroke="'+c+'" stroke-width="'+(t.border==='arch'?6:3)+'"/>';
  if(t.border==='mihrab')s+='<path d="M49 88V49H88M706 49h39v39M49 1035v39h39M706 1074h39v-39" fill="none" stroke="'+c+'" stroke-width="4"/>';
 }else if(t.border==='crescent'){
  s+=crescent(397,46)+crescent(397,1077)+star(327,46,11)+star(467,46,11)+star(327,1077,11)+star(467,1077,11);
 }else if(t.border==='lattice'){
  for(let x=100;x<710;x+=60)s+=star(x,45,12)+star(x,1078,12);
  s+='<path d="M46 90V1033M748 90V1033" stroke="'+trim+'" stroke-width="4"/>';
 }else if(t.border==='star'){
  for(const [x,y] of [[160,46],[280,46],[397,46],[514,46],[634,46],[160,1077],[280,1077],[397,1077],[514,1077],[634,1077]])s+=star(x,y,15);
  s+='<rect x="44" y="44" width="706" height="1035" fill="none" stroke="'+trim+'" stroke-width="1.5"/>';
 }else if(t.border==='minimal'){
  s+='<rect x="43" y="43" width="708" height="1037" fill="none" stroke="'+c+'" stroke-width="2"/>'+crescent(397,46)+crescent(397,1077);
 }else if(t.border==='corner'){
  s+='<path d="M34 105V34H105M689 34h71v71M34 1018v71h71M689 1089h71v-71M45 83V45H83M711 45h38v38M45 1040v38h38M711 1078h38v-38" fill="none" stroke="'+c+'" stroke-width="7"/>';
 }else{
  s+='<rect x="40" y="40" width="714" height="1043" fill="none" stroke="'+c+'" stroke-width="3" stroke-dasharray="12 7"/>';
  s+=star(397,45,16)+star(397,1078,16);
 }
 if(t.theme==='gold'){
  s+='<path d="M49 90V49H90M704 49h41v41M49 1033v41h41M704 1074h41v-41" fill="none" stroke="'+c+'" stroke-width="2" stroke-dasharray="5 4"/>';
  if(t.border==='arch'||t.border==='mihrab')s+='<path d="M285 52H330Q359 52 397 29Q435 52 464 52H509M285 1071h45q29 0 67 23q38-23 67-23h45" fill="none" stroke="'+c+'" stroke-width="2"/>';
  else if(t.border==='crescent')s+='<path d="M130 45H300M494 45H664M130 1078H300M494 1078H664" stroke="'+c+'" stroke-width="3" stroke-dasharray="12 7"/>';
  else if(t.border==='lattice')s+='<path d="M90 59H704M90 1064H704" stroke="'+c+'" stroke-width="2"/>';
  else if(t.border==='star')s+='<circle cx="397" cy="46" r="21" fill="none" stroke="'+c+'" stroke-width="2"/><circle cx="397" cy="1077" r="21" fill="none" stroke="'+c+'" stroke-width="2"/>';
  else if(t.border==='minimal')s+='<path d="M120 54H340M454 54H674M120 1069H340M454 1069H674" stroke="'+c+'" stroke-width="2"/>';
  else if(t.border==='corner')s+=star(397,46,17)+star(397,1077,17);
  else s+='<path d="M54 120V1003M740 120V1003" stroke="'+c+'" stroke-width="2" stroke-dasharray="3 9"/>';
 }
 return '<svg class="paper-border" viewBox="0 0 794 1123" aria-hidden="true">'+s+'</svg>';
}
function christianBorder(t){
 const c=t.color,trim=t.photo?'#aa9173':'#d7c5a8';
 const cross=(x,y,size)=>'<path d="M'+x+' '+(y-size)+'V'+(y+size)+'M'+(x-size*.65)+' '+(y-size*.35)+'H'+(x+size*.65)+'" stroke="'+c+'" stroke-width="3" stroke-linecap="round"/>';
 let s='<rect x="12" y="12" width="770" height="1099" fill="none" stroke="'+c+'" stroke-width="9"/><rect x="27" y="27" width="740" height="1069" fill="none" stroke="'+trim+'" stroke-width="2.5"/>';
 if(t.border==='cross-corner'){
  for(const [x,y] of [[43,43],[751,43],[43,1080],[751,1080]])s+=cross(x,y,16);
  s+='<path d="M83 48H711M83 1075H711" stroke="'+trim+'" stroke-width="2"/>';
 }else if(t.border==='dove-arch'){
  s+='<path d="M90 57H310Q350 57 397 35Q444 57 484 57H704M90 1066H310Q350 1066 397 1088Q444 1066 484 1066H704" fill="none" stroke="'+c+'" stroke-width="4"/>'+cross(397,45,16)+cross(397,1078,16);
 }else if(t.border==='church-window'){
  s+='<path d="M35 105V53Q35 35 53 35H105M689 35h52q18 0 18 18v52M35 1018v52q0 18 18 18h52M689 1088h52q18 0 18-18v-52" fill="none" stroke="'+c+'" stroke-width="7"/>'+cross(397,46,16)+cross(397,1077,16);
 }else if(t.border==='ribbon-cross'){
  s+='<path d="M110 41H330M464 41H684M110 52H330M464 52H684M110 1071H330M464 1071H684M110 1082H330M464 1082H684" stroke="'+trim+'" stroke-width="3"/>'+cross(397,46,18)+cross(397,1077,18);
 }else if(t.border==='cross-grid'){
  for(let x=125;x<690;x+=90)s+=cross(x,45,10)+cross(x,1078,10);
  s+='<path d="M48 85V1038M746 85V1038" stroke="'+trim+'" stroke-width="3"/>';
 }else if(t.border==='rays-cross'){
  s+=cross(397,46,18)+cross(397,1077,18);
  s+='<path d="M320 34 350 44M320 57l30-9M474 34l-30 10M474 57l-30-9M320 1066l30 9M320 1089l30-10M474 1066l-30 9M474 1089l-30-10" stroke="'+trim+'" stroke-width="3"/>';
 }else if(t.border==='classic-cross'){
  s+='<path d="M35 100V35H100M694 35h65v65M35 1023v65h65M694 1088h65v-65M46 82V46H82M712 46h36v36M46 1041v36h36M712 1077h36v-36" fill="none" stroke="'+c+'" stroke-width="5"/>'+cross(397,46,17)+cross(397,1077,17);
 }else{
  s+='<rect x="43" y="43" width="708" height="1037" fill="none" stroke="'+c+'" stroke-width="2"/>'+cross(397,46,16)+cross(397,1077,16);
 }
 return '<svg class="paper-border" viewBox="0 0 794 1123" aria-hidden="true">'+s+'</svg>';
}
function border(t){
 if(t.religion==='christian')return christianBorder(t);
 if(t.religion==='islamic')return islamicBorder(t);
 if(t.religion==='buddhist')return buddhistBorder(t);
 if(t.index>=24)return ornateBorder(t);
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
 const head=P.headers.find(h=>h.id===d.header);
 const themedArt=t.religion==='islamic'&&head?.religion==='islamic'&&!d.headerImage?' islamic-art-'+t.theme+(t.dark?'-dark':''):'';
 const paper=document.createElement('article');paper.className='biodata-paper'+(t.index>=24?' ornate-paper':'')+themedArt;paper.style.setProperty('--paper-accent',t.color);paper.style.setProperty('--paper-bg',t.background);paper.style.setProperty('--paper-ink',t.ink);
 const groups=(d.profileType==='islamic'?Object.entries(P.sectionsFor(d)).map(([key,meta])=>({title:meta.title,rows:P.entries(d,key)})):[
 {title:'वैयक्तिक माहिती',rows:[...P.entries(d,'personal'),...P.entries(d,'patrika')]},
 {title:'कौटुंबिक माहिती',rows:P.entries(d,'family')},
 {title:'संपर्क',rows:P.entries(d,'contact')}
 ]).concat(P.customSectionEntries(d)).filter(s=>s.rows.length);
 const src=d.headerImage||head?.file;
 const photo=d.showPhoto&&t.photo&&d.photo?'<img class="biodata-photo" src="'+E(d.photo)+'" alt="छायाचित्र" />':(sample&&t.photo?'<div class="biodata-photo sample-photo" aria-hidden="true"><svg viewBox="0 0 100 130"><rect width="100" height="130" fill="#ede7e2"/><circle cx="50" cy="43" r="22" fill="#c7b6ac"/><path d="M12 130V105q0-40 38-40t38 40v25" fill="#ad9890"/></svg></div>':'');
 paper.innerHTML=border(t)+'<div class="paper-safe"><div class="paper-content"><header class="biodata-heading">'+(src?'<img class="ganesh-icon" src="'+E(src)+'" alt="" />':'')+(d.values.invocation.trim()?'<p dir="auto">'+E(d.values.invocation)+'</p>':'')+'<h1>'+(d.profileType==='islamic'?'निकाह बायोडाटा':'परिचय पत्रिका')+'</h1></header><div class="biodata-sections">'+(groups.length?groups.map((s,i)=>'<section class="biodata-section"><h2 dir="auto">'+E(s.title)+'</h2><dl>'+(i===0?photo:'')+s.rows.map(r=>'<div class="biodata-row"><dt dir="auto">'+E(r.label)+'</dt><span aria-hidden="true">:</span><dd dir="auto">'+E(r.value)+'</dd></div>').join('')+'</dl></section>').join(''):'<p class="paper-empty">तुमची माहिती भरल्यानंतर परिचय पत्रिका येथे दिसेल.</p>')+'</div></div></div>'+(watermark?'<div class="document-watermark" aria-label="पूर्वावलोकन वॉटरमार्क"><span>MarathiPatrikaMakers</span><span>पूर्वावलोकन</span><span>MarathiPatrikaMakers</span></div>':'');
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

