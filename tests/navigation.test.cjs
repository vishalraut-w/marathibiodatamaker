'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function read(file){return fs.readFileSync(path.join(root,file),'utf8');}
function headerNav(html){return html.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0].match(/<nav\b[\s\S]*?<\/nav>/)?.[0];}
test('every page contains the homepage navigation and its needed assets',()=>{
 const nav=headerNav(read('index.html'));assert.ok(nav);assert.match(nav,/href="buddhist-templates\.html"/);
 for(const file of ['templates.html','buddhist-templates.html','christian-templates.html','islamic-templates.html','builder.html','islamic-builder.html','preview.html','download.html','privacy.html']){
  const html=read(file);assert.equal(headerNav(html),nav,file);assert.match(html,/href="home\.css"/,file);assert.match(html,/src="site-nav\.js"/,file);
 }
});
test('navigation language changes without changing the page language',()=>{
 const element=(text='',data={})=>({innerHTML:text,textContent:text,dataset:data,attrs:{},events:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.events[k]=fn;}});
 const designs=element('रचना पहा'),how=element('कसे बनवायचे?'),action=element('पत्रिका तयार करा'),brand=element('आपल्या नात्यांची, सुंदर सुरुवात.');
 const word=element('धर्म',{en:'Religion'}),mr=element('',{lang:'mr'}),en=element('',{lang:'en'}),group=element();
 const nav=element();nav.querySelector=s=>({'a[href="templates.html"]':designs,'a[href$="#how"]':how,'a.btn':action,'.home-language':group})[s];
 nav.querySelectorAll=s=>({'[data-en]':[word],'.home-language button':[mr,en],'.home-nav-menu':[]})[s]||[];
 const document={documentElement:{lang:'mr'},querySelector:s=>s==='.site-header nav'?nav:s==='.site-header .brand small'?brand:null,addEventListener(){}};
 const storage={value:null,getItem(){return this.value;},setItem(_k,v){this.value=v;}};
 vm.runInNewContext(read('site-nav.js'),{document,localStorage:storage});
 en.events.click();assert.equal(word.textContent,'Religion');assert.equal(designs.innerHTML,'View designs');assert.equal(en.attrs['aria-pressed'],'true');assert.equal(document.documentElement.lang,'mr');
 mr.events.click();assert.equal(word.textContent,'धर्म');assert.equal(storage.value,'mr');
});
