/* Local, phonetic English-to-Devanagari typing helper for the builder. */
(function(root){
 'use strict';
 const words={
  vishal:'विशाल',akshay:'अक्षय',akshaya:'अक्षया',sagar:'सागर',rahul:'राहुल',rohit:'रोहित',pratik:'प्रतीक',prateek:'प्रतीक',prasad:'प्रसाद',sachin:'सचिन',santosh:'संतोष',ganesh:'गणेश',mahesh:'महेश',suresh:'सुरेश',dinesh:'दिनेश',ramesh:'रमेश',anil:'अनिल',sunil:'सुनील',nilesh:'निलेश',abhishek:'अभिषेक',aditya:'आदित्य',amol:'अमोल',sanket:'संकेत',swapnil:'स्वप्नील',sandeep:'संदीप',sneha:'स्नेहा',pooja:'पूजा',puja:'पूजा',priya:'प्रिया',priyanka:'प्रियांका',vaishali:'वैशाली',snehal:'स्नेहल',dipali:'दिपाली',deepali:'दीपाली',ananya:'अनन्या',neha:'नेहा',aarti:'आरती',arti:'आरती',sonali:'सोनाली',shubham:'शुभम',shubhangi:'शुभांगी',raut:'राऊत',patil:'पाटील',jadhav:'जाधव',deshmukh:'देशमुख',kulkarni:'कुलकर्णी',pawar:'पवार',shinde:'शिंदे',more:'मोरे',kadam:'कदम',
  marathi:'मराठी',maharashtra:'महाराष्ट्र',pune:'पुणे',mumbai:'मुंबई',nashik:'नाशिक',nagpur:'नागपूर',satara:'सातारा',kolhapur:'कोल्हापूर',namaskar:'नमस्कार',namaste:'नमस्ते',dhanyavad:'धन्यवाद',dhanyavaad:'धन्यवाद',nav:'नाव',naav:'नाव',purna:'पूर्ण',purn:'पूर्ण',mulache:'मुलाचे',muliche:'मुलीचे',janma:'जन्म',janm:'जन्म',tarikh:'तारीख',pata:'पत्ता',patta:'पत्ता',sheti:'शेती',shetkari:'शेतकरी',vyavasay:'व्यवसाय',vyavsay:'व्यवसाय',nokari:'नोकरी',naukri:'नोकरी',shikshan:'शिक्षण',kutumb:'कुटुंब',vadil:'वडील',aai:'आई',aaji:'आजी',aajoba:'आजोबा',baba:'बाबा',bhau:'भाऊ',bahin:'बहीण',samaj:'समाज',bauddha:'बौद्ध',baudh:'बौद्ध',buddha:'बुद्ध',jay:'जय',jai:'जय',bhim:'भीम',shree:'श्री',shri:'श्री'
 };
 Object.assign(words,{
  vishaal:'विशाल',sanjay:'संजय',vijay:'विजय',ashok:'अशोक',pravin:'प्रवीण',praveen:'प्रवीण',pranav:'प्रणव',anand:'आनंद',siddharth:'सिद्धार्थ',jayesh:'जयेश',sunita:'सुनीता',savita:'सविता',anita:'अनिता',shilpa:'शिल्पा',rekha:'रेखा',swati:'स्वाती',archana:'अर्चना',anjali:'अंजली',sujata:'सुजाता',sakhar:'साखर',kanda:'कांदा',batata:'बटाटा',chaha:'चहा',shahar:'शहर',gaon:'गाव',taluka:'तालुका',jilha:'जिल्हा',biodata:'बायोडाटा',parichay:'परिचय',patrika:'पत्रिका',vivah:'विवाह',vivahit:'विवाहित',avivahit:'अविवाहित',shikshak:'शिक्षक',abhiyanta:'अभियंता',seva:'सेवा',mobile:'मोबाईल',sampark:'संपर्क',mahiti:'माहिती',aahe:'आहे',ahe:'आहे',ani:'आणि',aani:'आणि',majha:'माझा',majhi:'माझी',tumcha:'तुमचा',tumchi:'तुमची'
 });
 const consonants={ksh:'क्ष',dny:'ज्ञ',jny:'ज्ञ',chh:'छ',shh:'ष',kh:'ख',gh:'घ',ch:'च',jh:'झ',th:'थ',dh:'ध',ph:'फ',bh:'भ',sh:'श',tt:'ट',dd:'ड',nn:'ण',ll:'ळ',k:'क',g:'ग',c:'च',j:'ज',t:'त',d:'द',n:'न',p:'प',f:'फ',b:'ब',m:'म',y:'य',r:'र',l:'ल',v:'व',w:'व',s:'स',h:'ह',q:'क',z:'ज',x:'क्स'};
 const vowels={aa:['आ','ा'],ai:['ऐ','ै'],au:['औ','ौ'],ee:['ई','ी'],ii:['ई','ी'],oo:['ऊ','ू'],uu:['ऊ','ू'],a:['अ',''],i:['इ','ि'],u:['उ','ु'],e:['ए','े'],o:['ओ','ो']};
 const keys=[...Object.keys(consonants),...Object.keys(vowels)].sort((a,b)=>b.length-a.length);
 const hindiWords={naam:'नाम',mera:'मेरा',meri:'मेरी',hai:'है',pita:'पिता',mata:'माता',shadi:'शादी',shaadi:'शादी',nikah:'निकाह',mohammad:'मोहम्मद',mohammed:'मोहम्मद',muhammad:'मुहम्मद',ahmed:'अहमद',ahmad:'अहमद',ali:'अली',aisha:'आयशा',ayesha:'आयशा',fatima:'फ़ातिमा',salaam:'सलाम',salam:'सलाम',allah:'अल्लाह',urdu:'उर्दू',hindi:'हिंदी',parivar:'परिवार',shiksha:'शिक्षा',pata:'पता',pesha:'पेशा',khan:'खान'};
 const urduWords={naam:'نام',mera:'میرا',meri:'میری',hai:'ہے',shadi:'شادی',shaadi:'شادی',nikah:'نکاح',mohammad:'محمد',mohammed:'محمد',muhammad:'محمد',ahmed:'احمد',ahmad:'احمد',ali:'علی',aisha:'عائشہ',ayesha:'عائشہ',fatima:'فاطمہ',salaam:'سلام',salam:'سلام',allah:'اللہ',bismillah:'بسم اللہ',urdu:'اردو',hindi:'ہندی',pata:'پتہ',pesha:'پیشہ',khan:'خان',shaikh:'شیخ',sheikh:'شیخ',begum:'بیگم',muslim:'مسلم',islam:'اسلام',walid:'والد',walida:'والدہ',beti:'بیٹی',beta:'بیٹا',umar:'عمر',taleem:'تعلیم',rishta:'رشتہ',dua:'دعا',sara:'سارہ',zoya:'زویا',sana:'ثنا',fahad:'فہد',farhan:'فرحان',imran:'عمران',arif:'عارف',irfan:'عرفان',sameer:'سمیر',shabana:'شبانہ',saira:'سائرہ',hassan:'حسن',hussain:'حسین',yasmin:'یاسمین'};
 const urduConsonants={kh:'خ',gh:'غ',chh:'چھ',ch:'چ',jh:'جھ',th:'تھ',dh:'دھ',ph:'پھ',bh:'بھ',sh:'ش',k:'ک',g:'گ',j:'ج',t:'ت',d:'د',n:'ن',p:'پ',f:'ف',b:'ب',m:'م',y:'ی',r:'ر',l:'ل',v:'و',w:'و',s:'س',h:'ہ',q:'ق',z:'ز',x:'کس'};
 const urduVowels={aa:'ا',ai:'ی',au:'و',ee:'ی',ii:'ی',oo:'و',uu:'و',a:'',i:'ی',u:'و',e:'ے',o:'و'};
 const urduKeys=[...Object.keys(urduConsonants),...Object.keys(urduVowels)].sort((a,b)=>b.length-a.length);
 function urduWord(value){
  const lower=value.toLowerCase();if(urduWords[lower])return urduWords[lower];let result='';
  for(let i=0;i<lower.length;){const token=urduKeys.find(k=>lower.startsWith(k,i));if(!token){result+=value[i++];continue;}
   if(Object.hasOwn(urduVowels,token)){if(i===0)result+='ا';result+=urduVowels[token];}
   else result+=urduConsonants[token];i+=token.length;
  }return result;
 }
 function word(value,language='mr'){
  if(language==='ur')return urduWord(value);
  if(language==='hi'&&hindiWords[value.toLowerCase()])return hindiWords[value.toLowerCase()];
  const lower=value.toLowerCase();if(words[lower])return words[lower];
  let result='',pending=false;
  for(let i=0;i<lower.length;){
   const token=keys.find(k=>lower.startsWith(k,i));
   if(!token){result+=value[i];pending=false;i++;continue;}
   if(vowels[token]){result+=vowels[token][pending?1:0];pending=false;}
   else{if(pending)result+='्';result+=consonants[token];pending=true;}
   i+=token.length;
  }
  return result;
 }
 function transliterate(text,language='mr'){return String(text).replace(/[A-Za-z]+/g,w=>word(w,language));}
 const alternatives={vishal:['विशाल','विषाल','विशाळ'],sagar:['सागर','सगर'],sheti:['शेती','सेती'],patil:['पाटील','पाटिल'],raut:['राऊत','रावत'],shilpa:['शिल्पा','शिल्प'],sujata:['सुजाता','सुझाता'],vyavsay:['व्यवसाय','व्यवसाई'],kanda:['कांदा','कंद'],sanjay:['संजय','सन्जय']};
 function suggest(value,language='mr'){
  const source=String(value).toLowerCase();if(!/^[a-z]{1,40}$/.test(source))return [];
  const results=[...(language==='mr'?(alternatives[source]||[]):[]),word(source,language)];
  const replacements=[['a','aa'],['i','ee'],['u','oo'],['t','tt'],['d','dd'],['n','nn'],['l','ll'],['s','sh']];
  for(const [from,to] of replacements){
   for(let at=source.indexOf(from);at>=0;at=source.indexOf(from,at+1)){
    if(source[at-1]===from||source[at+1]===from)continue;
    results.push(word(source.slice(0,at)+to+source.slice(at+from.length),language));
   }
  }
  return [...new Set(results)].filter(s=>language==='ur'?/[\u0600-\u06ff]/.test(s):/[\u0900-\u097f]/.test(s)).slice(0,6);
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={transliterate,suggest};
 if(typeof document==='undefined')return;
 const toggle=document.querySelector('#marathi-toggle'),panel=document.querySelector('#marathi-panel');
 if(!toggle||!panel)return;
 const source=document.querySelector('#marathi-input'),output=document.querySelector('#marathi-output'),status=document.querySelector('#marathi-status');
 const suggestionBox=document.querySelector('#marathi-suggestions'),suggestionList=document.querySelector('#marathi-suggestion-list'),regenerate=document.querySelector('#marathi-regenerate');
 const languageSelect=document.querySelector('#transliteration-language');
 const language=()=>languageSelect?.value||'mr',convert=value=>transliterate(value,language());
 const message=(mr,hi)=>languageSelect?hi:mr;
 if(languageSelect)output.setAttribute('lang',language());
 let lastGenerated=output.value;
 function activeWord(){
  const value=source.value,pos=source.selectionStart??value.length;
  let start=pos,end=pos;while(start>0&&/[a-z]/i.test(value[start-1]))start--;while(end<value.length&&/[a-z]/i.test(value[end]))end++;
  return end>start?{start,end,text:value.slice(start,end)}:null;
 }
 function updateSuggestions(){
  const active=activeWord(),items=active?suggest(active.text,language()):[];
  suggestionList.replaceChildren();suggestionBox.hidden=!items.length;
  items.forEach(item=>{
   const button=document.createElement('button');button.type='button';button.textContent=item;button.setAttribute('dir','auto');button.setAttribute('aria-label',item+message(' निवडा',' चुनें'));
   button.addEventListener('click',()=>chooseSuggestion(active,item));suggestionList.append(button);
  });
 }
 function chooseSuggestion(active,choice){
  if(source.value.slice(active.start,active.end)!==active.text){updateSuggestions();return;}
  const prefix=convert(source.value.slice(0,active.start)),current=word(active.text,language()),manual=output.value!==lastGenerated;
  if(manual&&(output.value.slice(0,prefix.length)!==prefix||output.value.slice(prefix.length,prefix.length+current.length)!==current)){
   status.textContent=message('तुमचे बदल जपले आहेत. हा शब्द मराठी मजकुरात बदला.','आपके बदलाव सुरक्षित हैं। शब्द नीचे दिए पाठ में बदलें।');return;
  }
  const updated=source.value.slice(0,active.start)+choice+source.value.slice(active.end);
  source.value=updated;
  output.value=manual?output.value.slice(0,prefix.length)+choice+output.value.slice(prefix.length+current.length):convert(updated);
  lastGenerated=convert(updated);regenerate.hidden=output.value===lastGenerated;
  status.textContent='';source.focus();source.setSelectionRange(active.start+choice.length,active.start+choice.length);updateSuggestions();
 }
 function setOpen(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)source.focus();else toggle.focus();}
 toggle.addEventListener('click',()=>setOpen(panel.hidden));
 document.querySelector('#marathi-close').addEventListener('click',()=>setOpen(false));
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);}});
 source.addEventListener('input',()=>{
  if(output.value!==lastGenerated){regenerate.hidden=false;status.textContent=message('मराठीतील बदल जपले आहेत. नवीन रूपांतरासाठी पुन्हा तयार करा निवडा.','आपके बदलाव सुरक्षित हैं। नया पाठ बनाने के लिए फिर से बनाएँ चुनें।');}
  else{output.value=convert(source.value);lastGenerated=output.value;regenerate.hidden=true;status.textContent='';}
  updateSuggestions();
 });
 source.addEventListener('click',updateSuggestions);source.addEventListener('keyup',updateSuggestions);source.addEventListener('select',updateSuggestions);
 source.addEventListener('keydown',event=>{if(event.key==='ArrowDown'&&!suggestionBox.hidden){const first=suggestionList.querySelector('button');if(first){event.preventDefault();first.focus();}}});
 output.addEventListener('input',()=>{regenerate.hidden=output.value===lastGenerated;status.textContent='';});
 regenerate.addEventListener('click',()=>{output.value=convert(source.value);lastGenerated=output.value;regenerate.hidden=true;status.textContent=message('मजकूर पुन्हा तयार केला.','पाठ फिर से बनाया गया।');});
 languageSelect?.addEventListener('change',()=>{output.setAttribute('lang',language());output.placeholder=language()==='ur'?'مثلاً علی':'उदा. अली';if(output.value!==lastGenerated){regenerate.hidden=false;status.textContent=message('तुमचे बदल जपले आहेत. पुन्हा तयार करा निवडा.','आपके बदलाव सुरक्षित हैं। फिर से बनाएँ चुनें।');}else{output.value=convert(source.value);lastGenerated=output.value;status.textContent='';}updateSuggestions();});
 document.querySelector('#marathi-copy').addEventListener('click',async()=>{
  if(!output.value){status.textContent=message('आधी मजकूर लिहा.','पहले कुछ लिखें।');return;}
  try{
   if(navigator.clipboard?.writeText&&window.isSecureContext)await navigator.clipboard.writeText(output.value);
   else{output.focus();output.select();if(!document.execCommand('copy'))throw Error('copy failed');}
   status.textContent=message('मजकूर कॉपी झाला.','पाठ कॉपी हुआ।');
  }catch{output.focus();output.select();status.textContent=message('मजकूर निवडला आहे. Ctrl+C वापरा.','पाठ चुन लिया है। Ctrl+C दबाएँ।');}
 });
})(typeof globalThis!=='undefined'?globalThis:this);
