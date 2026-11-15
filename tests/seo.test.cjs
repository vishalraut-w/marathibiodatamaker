'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {handler}=require('../server/index.cjs');
const root=path.resolve(__dirname,'..'),origin='https://www.vivahpatrikamaker.in';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const indexable=['index.html','templates.html','buddhist-templates.html','christian-templates.html','islamic-templates.html','builder.html','islamic-builder.html','varshradh-templates.html','varshradh-builder.html'];
test('sitemap pages have distinct titles, descriptions and matching canonical URLs',()=>{
 const sitemap=read('sitemap.xml'),robots=read('robots.txt'),titles=new Set(),descriptions=new Set();
 assert.match(robots,/Sitemap: https:\/\/www\.vivahpatrikamaker\.in\/sitemap\.xml/);
 assert.equal((sitemap.match(/<loc>/g)||[]).length,indexable.length);
 for(const file of indexable){const html=read(file),url=origin+(file==='index.html'?'/':'/'+file);
  assert.ok(sitemap.includes('<loc>'+url+'</loc>'),file);assert.ok(html.includes('rel="canonical" href="'+url+'"'),file);
  assert.doesNotMatch(html,/<meta name="robots" content="noindex/i,file);
  const title=html.match(/<title>(.*?)<\/title>/)?.[1],description=html.match(/<meta name="description" content="([^"]+)"\s*\/?\s*>/i)?.[1];
  assert.ok(title&&description,file);assert.ok(!titles.has(title),file);assert.ok(!descriptions.has(description),file);titles.add(title);descriptions.add(description);
  assert.match(html,/<script defer src="analytics\.js"><\/script>/,file);
 }
 const structured=read('index.html').match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1];assert.equal(JSON.parse(structured).url,origin+'/');
 for(const file of ['preview.html','download.html']){assert.match(read(file),/<meta name="robots" content="noindex,follow">/);assert.ok(!sitemap.includes('/'+file));}
});
test('analytics removes query strings and does not run on local or unrelated hosts',()=>{
 const source=read('analytics.js');function run(host,protocol='https:'){
  const queued=[],scripts=[],window={va:function(){queued.push([...arguments]);}},document={head:{appendChild:s=>scripts.push(s)},createElement:()=>({})};
  vm.runInNewContext(source,{window,document,location:{hostname:host,protocol,origin:protocol+'//'+host},URL});return {queued,scripts};
 }
 const tracked=run('www.vivahpatrikamaker.in');assert.equal(tracked.scripts[0].src,'/_vercel/insights/script.js');
 const beforeSend=tracked.queued.find(x=>x[0]==='beforeSend')[1];assert.equal(beforeSend({url:origin+'/builder.html?name=private#photo'}).url,origin+'/builder.html');
 assert.equal(run('localhost','http:').scripts.length,0);assert.equal(run('other.example').scripts.length,0);
});
test('robots, sitemap and analytics have public content types',async()=>{
 for(const [file,type] of [['robots.txt','text/plain'],['sitemap.xml','application/xml'],['analytics.js','text/javascript']]){
  const res={setHeader(){},writeHead(status,headers){this.status=status;this.headers=headers;this.headersSent=true;},end(){}};
  await handler({method:'GET',url:'/'+file,headers:{}},res);assert.equal(res.status,200);assert.ok(res.headers['Content-Type'].startsWith(type));
 }
});
