(function(root){
'use strict';
const designs=[
 {id:'smruti',name:'स्मृती',background:'#fbf1df',ink:'#512419',accent:'#822d31',line:'#b99057',frame:'single'},
 {id:'deep',name:'दीपज्योत',background:'#fffaf1',ink:'#4e3a28',accent:'#735337',line:'#bc9c65',frame:'corners'},
 {id:'shant',name:'शांत स्मरण',background:'#f4f3ed',ink:'#353d37',accent:'#4c5d50',line:'#98a194',frame:'single'},
 {id:'chandan',name:'चंदन',background:'#f8edda',ink:'#533728',accent:'#8c4d30',line:'#bf9368',frame:'double'},
 {id:'phool',name:'पुष्पांजली',background:'#fff8f3',ink:'#513b39',accent:'#8d5255',line:'#cca8a0',frame:'corners'},
 {id:'shraddha',name:'श्रद्धांजली',background:'#f7f4ee',ink:'#413b38',accent:'#624047',line:'#a99582',frame:'double'}
];
const defaults=[
 {type:'title',label:'मुख्य शीर्षक',value:'स्मृतिप्रीत्यर्थ'},
 {type:'heading',label:'कार्यक्रमाचे शीर्षक',value:'प्रथम वर्षश्राद्ध'},
 {type:'name',label:'नाव',value:''},
 {type:'text',label:'दिनांक',value:''},
 {type:'text',label:'वेळ',value:''},
 {type:'text',label:'स्थळ',value:''},
 {type:'message',label:'संदेश',value:'आपली उपस्थिती प्रार्थनीय आहे'}
];
const clean=(v,n)=>typeof v==='string'?v.slice(0,n):'';
const imageData=v=>typeof v==='string'&&v.length<1800000&&/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(v)?v:null;
function fresh(){return {kind:'memorial',templateId:'smruti',photo:null,rows:defaults.map(r=>({...r}))};}
function normalize(raw){
 const d=fresh();if(!raw||typeof raw!=='object')return d;
 d.templateId=designs.some(t=>t.id===raw.templateId)?raw.templateId:'smruti';d.photo=imageData(raw.photo);
 if(Array.isArray(raw.rows))d.rows=raw.rows.slice(0,20).filter(r=>r&&typeof r==='object').map(r=>({type:['title','heading','name','text','message'].includes(r.type)?r.type:'text',label:clean(r.label,60),value:clean(r.value,240)}));
 return d;
}
function demo(){let d=fresh();d.rows[2].value='स्व. श्री. अनंत रामचंद्र पाटील';d.rows[3].value='रविवार, १५ डिसेंबर';d.rows[4].value='सकाळी १० वाजता';d.rows[5].value='पाटील निवास, पुणे';return d;}
const api={designs,fresh,normalize,demo};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MemorialData=api;
})(typeof globalThis!=='undefined'?globalThis:this);
