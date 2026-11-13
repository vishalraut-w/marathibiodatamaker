'use strict';
const {chromium}=require('playwright-core'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const P=require('../data.js');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:4173',out=path.join(__dirname,'artifacts');
(async()=>{
 await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin);await page.locator('#hero-sheet .biodata-paper[data-fits]').waitFor();
  await page.screenshot({path:path.join(out,'homepage.png'),fullPage:true});
  await page.goto(origin+'/templates.html');assert.equal(await page.locator('.template-card').count(),24);
  await page.getByRole('button',{name:'फोटोशिवाय',exact:true}).click();assert.equal(await page.locator('.template-card').count(),12);
  await page.getByRole('button',{name:'सर्व रचना',exact:false}).click();
  await page.locator('[data-choose="pushp"]').click();await page.locator('[data-field="fullName"]').fill('चि. चाचणी देशमुख');
  assert.equal(await page.locator('#header-options [data-header]').count(),15);
  assert.equal(await page.locator('#header-select option').last().getAttribute('value'),'upload');
  await page.locator('#header-select').selectOption('tuljabhavani');
  assert.equal(await page.locator('#invocation').inputValue(),'॥ श्री तुळजाभवानी प्रसन्न ॥');
  await page.locator('#invocation').fill('॥ माझी आशीर्वाद ओळ ॥');
  await page.locator('[data-header="khandoba"]').click();
  assert.equal(await page.locator('#header-select').inputValue(),'khandoba');
  assert.equal(await page.locator('#invocation').inputValue(),'॥ माझी आशीर्वाद ओळ ॥');
  for(const h of P.headers.filter(h=>h.file&&!h.legacy)){
   const response=await context.request.get(origin+'/'+h.file);assert.equal(response.status(),200,h.name+' PNG accessible');
   const bytes=await response.body();assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.ok([4,6].includes(bytes[25]),h.name+' retains alpha');
  }
  await page.locator('#header-upload').setInputFiles(path.join(__dirname,'../assets/deity-ganesh-gold.png'));
  await page.locator('#selected-header-preview strong').filter({hasText:'तुमचे देवतेचे चित्र'}).waitFor();
  assert.equal(await page.locator('#header-select').inputValue(),'upload');
  const testPortrait=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=160;c.height=200;const g=c.getContext('2d');g.fillStyle='#e9ded6';g.fillRect(0,0,160,200);g.fillStyle='#98796b';g.beginPath();g.arc(80,65,33,0,Math.PI*2);g.fill();g.fillRect(30,110,100,90);return c.toDataURL('image/png').split(',')[1];});
  await page.locator('#photo-upload').setInputFiles({name:'synthetic-test-avatar.png',mimeType:'image/png',buffer:Buffer.from(testPortrait,'base64')});
  await page.locator('#photo-thumb img').waitFor();
  await page.locator('[data-header="tuljabhavani"]').click();
  await page.setViewportSize({width:1440,height:1500});
  await page.locator('#header-select').scrollIntoViewIfNeeded();
  await page.locator('#toast').waitFor({state:'hidden'});
  await page.locator('.deity-picker').evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+window.scrollY-100));
  await page.locator('.deity-picker').screenshot({path:path.join(out,'deity-gallery.png')});
  await page.setViewportSize({width:1440,height:1050});
  await page.locator('[data-field="kuldaivat"]').fill('श्री खंडोबा, जेजुरी');
  await page.locator('[data-field="gotra"]').selectOption('अगस्त्य');
  await page.locator('[data-field="rashi"]').selectOption('मेष');
  await page.locator('[data-field="gotra"]').selectOption('__other__');
  await page.locator('[data-other="gotra"]').fill('माझे गोत्र');
  await page.locator('[data-add="family"]').click();
  const row=page.locator('#family .custom-row').last();
  await row.locator('[data-custom-label]').fill('मामा');await row.locator('[data-custom-value]').fill('श्री. नमुना पाटील');
  await row.locator('[data-action="up"]').click();await row.locator('[data-action="hide"]').click();
  await page.locator('#family [data-restore]').last().click();
  await page.locator('[data-field="bloodGroup"]').selectOption('B+');
  await page.locator('[data-row="bloodGroup"] [data-action="hide"]').click();
  await page.locator('[data-field="fullName"]').blur();await page.waitForTimeout(250);await page.reload();
  assert.equal(await page.locator('[data-field="kuldaivat"]').inputValue(),'श्री खंडोबा, जेजुरी');assert.equal(await page.locator('[data-other="gotra"]').inputValue(),'माझे गोत्र');
  assert.equal(await page.locator('#header-select').inputValue(),'tuljabhavani');
  await page.goto(origin+'/preview.html');await page.locator('.biodata-paper[data-fits]').waitFor();
  assert.equal(await page.locator('.biodata-row').filter({hasText:'रक्तगट'}).count(),0);
  assert.equal(await page.locator('.biodata-row').filter({hasText:'मामा'}).count(),1);
  assert.equal(await page.locator('.ganesh-icon').getAttribute('src'),'assets/deity-tuljabhavani.png');
  assert.ok(await page.locator('.biodata-photo').evaluate(el=>el.complete&&el.naturalWidth>0));
  const fitResults=[];
  for(const scenario of ['short','reference','full','long','extreme']){
   const d=P.demo();
   if(scenario==='short'){d.values={invocation:d.values.invocation,fullName:'चि. आदित्य देशमुख',education:'अभियांत्रिकी',profession:'व्यवसाय',father:'श्री. अभय देशमुख',phone:'९XXXXXXXXX',address:'पुणे'};}
   if(scenario==='full'||scenario==='long'||scenario==='extreme'){
    Object.entries(P.sections).forEach(([s,meta])=>meta.fields.forEach(([key,,placeholder,options])=>{d.values[key]=d.values[key]||options?.[0]||'नमुना माहिती';}));
   }
   if(scenario==='long'||scenario==='extreme')for(let i=0;i<(scenario==='extreme'?80:18);i++){const id='custom_test_'+i;d.custom.family.push({id,label:'अधिक माहिती '+i,value:scenario==='extreme'?'लांब माहिती '.repeat(45):'कौटुंबिक माहिती · नमुना तपशील'});d.order.family.push(id);}
   const result=await page.evaluate(async d=>{localStorage.setItem('mpm-fresh-v1',JSON.stringify(d));const target=document.querySelector('#preview-sheet');const sheet=PatrikaRender.createSheet(d,{sample:true});target.replaceChildren(sheet);PatrikaRender.scaleSheet(target);return PatrikaRender.readySheet(sheet);},d);
   fitResults.push({scenario,...result});
   console.log('Measured:',scenario,JSON.stringify(result));
   if(scenario!=='extreme')assert.equal(result.fits,true,scenario+' must fit without clipping');else assert.equal(result.fits,false,'extreme content must report overflow');
   if(['reference','full','long'].includes(scenario)){await page.locator('#preview-sheet').scrollIntoViewIfNeeded();await page.locator('#preview-sheet').screenshot({path:path.join(out,scenario+'-sheet.png')});}
  }
  console.log('Fit results:',JSON.stringify(fitResults));assert.ok(fitResults[0].font>fitResults[2].font,'Fewer fields should have larger text');assert.ok(fitResults[2].font>fitResults[3].font);
  await page.evaluate(d=>localStorage.setItem('mpm-fresh-v1',JSON.stringify(d)),P.demo());
  for(const route of ['index.html','templates.html','builder.html','preview.html','download.html']){
   await page.setViewportSize({width:390,height:844});await page.goto(origin+'/'+route);await page.waitForTimeout(350);
   const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));assert.ok(dimensions.scroll<=dimensions.width+1,route+' horizontal overflow');
   if(route==='preview.html')await page.screenshot({path:path.join(out,'mobile-preview.png'),fullPage:true});
   if(route==='builder.html')await page.screenshot({path:path.join(out,'mobile-builder.png'),fullPage:true});
   if(route!=='download.html'){const text=await page.locator('body').innerText();assert.doesNotMatch(text,/₹49|मोफत|पेमेंट|वॉटरमार्कशिवाय/);}
  }
  await page.goto(origin+'/download.html');await page.locator('#download-status').filter({hasText:'वॉटरमार्कशिवाय डाउनलोड सध्या उपलब्ध नाही'}).waitFor();
  assert.equal(await page.locator('#paid-download').isDisabled(),true);
  assert.match(await page.locator('#paid-download').innerText(),/Razorpay सुरक्षित पेमेंट/);
  assert.match(await page.locator('#paid-download').innerText(),/₹49 भरून अनलॉक करा/);
  await page.locator('input[name="export-format"][value="png"]').check();
  assert.match(await page.locator('#free-download').innerText(),/PNG/);
  const pngDownload=page.waitForEvent('download');await page.locator('#free-download').click();
  const downloaded=await pngDownload;assert.equal(downloaded.suggestedFilename(),'parichay-patrika.png');
  await downloaded.saveAs(path.join(out,'sample-watermarked.png'));
  const png=await fs.readFile(path.join(out,'sample-watermarked.png'));assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),1588);assert.equal(png.readUInt32BE(20),2246);
  await page.waitForFunction(()=>!document.querySelector('#export-format').disabled);
  await page.screenshot({path:path.join(out,'download-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1100});await page.screenshot({path:path.join(out,'download-formats.png'),fullPage:true});
  await page.locator('input[name="export-format"][value="pdf"]').check();assert.match(await page.locator('#free-download').innerText(),/PDF/);
  const pdfDownload=page.waitForEvent('download');await page.locator('#free-download').click();
  assert.equal((await pdfDownload).suggestedFilename(),'parichay-patrika.pdf');
  await page.waitForFunction(()=>!document.querySelector('#export-format').disabled);
  const forged=await context.request.post(origin+'/api/pdf/paid',{headers:{Origin:origin},data:{orderId:'forged',paid:true,watermark:false}});assert.notEqual(forged.status(),200);
  const denied=await context.request.get(origin+'/.env');assert.equal(denied.status(),404);
  const denial=await context.request.post(origin+'/api/pdf/free',{headers:{Origin:'https://evil.example'},data:{draft:P.demo()}});assert.equal(denial.status(),403);
  const pdfDraft=P.demo();pdfDraft.header='tuljabhavani';pdfDraft.values.invocation='॥ श्री तुळजाभवानी प्रसन्न ॥';pdfDraft.photo='data:image/png;base64,'+testPortrait;
  const response=await context.request.post(origin+'/api/pdf/free',{headers:{Origin:origin},data:{draft:pdfDraft,watermark:false},timeout:60000});
  assert.equal(response.status(),200,await response.text().then(x=>x.slice(0,200)));const pdf=await response.body();assert.equal(pdf.subarray(0,4).toString(),'%PDF');
  await fs.writeFile(path.join(out,'sample-watermarked.pdf'),pdf);
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,'results.json'),JSON.stringify({fitResults,errors,pdfBytes:pdf.length},null,2));
  console.log('PASS: all routes, mobile widths, form controls, draft persistence, 24 designs, adaptive A4 and protected PDF endpoints.');
 }finally{await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});


