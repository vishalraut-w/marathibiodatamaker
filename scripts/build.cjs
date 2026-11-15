'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public');
fs.mkdirSync(out,{recursive:true});
// Explicit allowlist keeps server code, secrets and private data out of static hosting.
for(const file of ['index.html','templates.html','buddhist-templates.html','christian-templates.html','islamic-templates.html','builder.html','islamic-builder.html','preview.html','download.html','privacy.html','varshradh-templates.html','varshradh-builder.html','memorial.css','memorial-data.js','memorial-renderer.js','memorial-app.js','styles.css','paper.css','home.css','templates.css','app.js','home.js','site-nav.js','transliterator.js','data.js','renderer.js','analytics.js','robots.txt','sitemap.xml']){
 fs.copyFileSync(path.join(root,file),path.join(out,file));
}
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
console.log('Built public assets for Vercel.');
