'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public');
fs.mkdirSync(out,{recursive:true});
// Explicit allowlist keeps server code, secrets and private data out of static hosting.
for(const file of ['index.html','templates.html','builder.html','preview.html','download.html','privacy.html','styles.css','paper.css','app.js','data.js','renderer.js']){
 fs.copyFileSync(path.join(root,file),path.join(out,file));
}
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
console.log('Built public assets for Vercel.');
