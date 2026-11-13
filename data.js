/* Shared field definitions and validation for browser and server. */
(function(root) {
'use strict';
const sections = {
  personal: { title: 'वैयक्तिक माहिती', fields: [
    ['fullName','पूर्ण नाव','उदा. सौ. अनन्या विजय कुलकर्णी'], ['birthDate','जन्म तारीख','उदा. १२ ऑगस्ट १९९८'], ['birthTime','जन्म वेळ','उदा. सकाळी ६:४०'], ['birthPlace','जन्म स्थळ','उदा. पुणे'], ['height','उंची','उदा. ५ फूट ४ इंच'], ['religion','धर्म','धर्म निवडा',['हिंदू','जैन','बौद्ध','मुस्लिम','शीख','ख्रिश्चन','इतर']], ['community','जात / समाज','उदा. देशस्थ ब्राह्मण'], ['motherTongue','मातृभाषा','मातृभाषा निवडा',['मराठी','हिंदी','इंग्रजी','गुजराती','कन्नड','इतर']], ['complexion','वर्ण','वर्ण निवडा',['गोरा','गव्हाळ','सावळा','इतर']], ['bloodGroup','रक्तगट','रक्तगट निवडा',['A+','A-','B+','B-','AB+','AB-','O+','O-']], ['maritalStatus','वैवाहिक स्थिती','स्थिती निवडा',['अविवाहित','घटस्फोटित','विधवा / विधुर','इतर']], ['education','शिक्षण','उदा. बी.ई. (कॉम्प्युटर)'], ['profession','व्यवसाय / नोकरी','उदा. सॉफ्टवेअर अभियंता'], ['company','कार्यस्थळ / संस्था','उदा. पुणे'], ['income','उत्पन्नाचा तपशील (ऐच्छिक)','उदा. आवश्यक असल्यास'], ['about','माझ्याविषयी','थोडक्यात स्वतःबद्दल लिहा']
  ]},
  patrika: { title: 'पत्रिका माहिती', fields: [
    ['kuldaivat','कुलदैवत','उदा. खंडोबा, जेजुरी'], ['gotra','गोत्र','गोत्र निवडा',['कश्यप','भारद्वाज','वसिष्ठ','अत्री','गौतम','कौशिक','जमदग्नी','विश्वामित्र','अगस्त्य','शांडिल्य','पराशर','वत्स','भृगु','इतर']], ['devak','देवक','उदा. कदंब'], ['rashi','रास','रास निवडा',['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुळ','वृश्चिक','धनु','मकर','कुंभ','मीन']], ['nakshatra','नक्षत्र','नक्षत्र निवडा',['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशीर्ष','आर्द्रा','पुनर्वसू','पुष्य','आश्लेषा','मघा','पूर्वा फाल्गुनी','उत्तरा फाल्गुनी','हस्त','चित्रा','स्वाती','विशाखा','अनुराधा','ज्येष्ठा','मूळ','पूर्वाषाढा','उत्तराषाढा','श्रवण','धनिष्ठा','शततारका','पूर्वाभाद्रपदा','उत्तराभाद्रपदा','रेवती']], ['charan','चरण','चरण निवडा',['१ला','२रा','३रा','४था']], ['nadi','नाडी','नाडी निवडा',['आदि','मध्य','अंत्य']], ['gan','गण','गण निवडा',['देव','मनुष्य','राक्षस']], ['manglik','मंगळ','स्थिती निवडा',['अमंगळ','मंगळ','सौम्य मंगळ','लागू नाही']], ['kundali','कुंडली उपलब्ध','पर्याय निवडा',['होय','नाही','आंशिक']]
  ]},
  family: { title: 'कौटुंबिक माहिती', fields: [
    ['father','वडिलांचे नाव','उदा. श्री. विजय कुलकर्णी'], ['fatherJob','वडिलांचा व्यवसाय','उदा. शेती'], ['mother','आईचे नाव','उदा. सौ. कविता कुलकर्णी'], ['motherJob','आईचा व्यवसाय','उदा. गृहिणी'], ['brothers','भाऊ','उदा. एक भाऊ (विवाहित)'], ['sisters','बहिणी','उदा. एक बहीण'], ['siblings','भावंडांविषयी अधिक','ऐच्छिक तपशील'], ['familyType','कुटुंबाचा प्रकार','प्रकार निवडा',['एकत्र कुटुंब','विभक्त कुटुंब','इतर']], ['familyValues','कौटुंबिक मूल्ये','उदा. सुशिक्षित, संस्कारी'], ['nativePlace','मूळ गाव','उदा. वाई, जि. सातारा'], ['maternal','मामांचे नाव व गाव','उदा. आवश्यक असल्यास'], ['relatives','आप्तेष्टांची आडनावे','उदा. पाटील, देशमुख']
  ]},
  contact: { title: 'संपर्क व अपेक्षा', fields: [
    ['contactName','संपर्क व्यक्तीचे नाव','उदा. श्री. विजय कुलकर्णी'], ['phone','मोबाईल क्रमांक','उदा. +९१ ९८७६५ ४३२१०'], ['whatsapp','व्हॉट्सअॅप क्रमांक','उदा. +९१ ९८७६५ ४३२१०'], ['email','ई-मेल','उदा. family@example.com'], ['address','सध्याचा पत्ता','उदा. कोथरूड, पुणे'], ['expectations','जोडीदाराकडून अपेक्षा','थोडक्यात अपेक्षा लिहा']
  ]}
};

const templateSeed = [
['pushp','पुष्परेखा','#ae2d75','floral',true],['mangal','मंगल सुवर्ण','#ae6b20','temple',true],
['mor','मोरपंख','#206864','peacock',true],['gulab','गुलाब पाकळी','#b14e60','petal',true],
['paithani','पैठणी','#7a326a','paithani',true],['kesari','केसरी महिरप','#bd5d20','arch',true],
['nil','नीलमणी','#34528a','lattice',true],['tulsi','तुळशी वृंदावन','#527348','leaf',true],
['rangoli','अंगण रांगोळी','#a33c46','rangoli',true],['reshim','रेशीमबंध','#853445','ribbon',true],
['sun','सुवर्ण किरण','#997023','sun',true],['motif','कुंदन','#755073','medallion',true],
['rekha','शुभ्र रेखा','#626574','minimal',false],['chandan','चंदन','#987352','double',false],
['kamal','कमळ','#b23e78','lotus',false],['hirva','हिरवळ','#3c745c','vine',false],
['manik','माणिक','#a33b45','diamond',false],['akash','आकाश','#3b7190','wave',false],
['tambra','ताम्ररेखा','#9a5139','corner',false],['jui','जाई-जुई','#617954','daisy',false],
['shahi','राजमुद्रा','#5e416e','royal',false],['lekh','हस्ताक्षर','#444b5b','bracket',false],
['sandhya','संध्यारंग','#ad5d71','scallop',false],['parampara','परंपरा','#8e3431','classic',false]
];
const templates = templateSeed.map(([id,name,color,border,photo],i)=>({id,name,color,border,photo,index:i}));
const headers = [
{id:'ganesha',name:'श्री गणेश · मंगलमूर्ती',file:'assets/deity-ganesh-classic.png',invocation:'॥ श्री गणेशाय नमः ॥'},
{id:'ganesh-gold',name:'श्री गणेश · सुवर्ण',file:'assets/deity-ganesh-gold.png',invocation:'॥ श्री गणेशाय नमः ॥'},
{id:'ganesh-lotus',name:'श्री गणेश · कमळासन',file:'assets/deity-ganesh-lotus.png',invocation:'॥ श्री गणेशाय नमः ॥'},
{id:'ganesh-sindoor',name:'श्री गणेश · शेंदूर',file:'assets/deity-ganesh-sindoor.png',invocation:'॥ श्री गणेशाय नमः ॥'},
{id:'ganesh-blessing',name:'श्री गणेश · आशीर्वाद',file:'assets/deity-ganesh-blessing.png',invocation:'॥ श्री गणेशाय नमः ॥'},
{id:'tuljabhavani',name:'श्री तुळजाभवानी',file:'assets/deity-tuljabhavani.png',invocation:'॥ श्री तुळजाभवानी प्रसन्न ॥'},
{id:'khandoba',name:'श्री खंडोबा',file:'assets/deity-khandoba.png',invocation:'॥ श्री खंडोबा प्रसन्न ॥'},
{id:'vitthal-rukmini',name:'श्री विठ्ठल रुक्मिणी',file:'assets/deity-vitthal-rukmini.png',invocation:'॥ श्री विठ्ठल रुक्मिणी प्रसन्न ॥'},
{id:'mahalaxmi',name:'श्री महालक्ष्मी',file:'assets/deity-mahalaxmi.png',invocation:'॥ श्री महालक्ष्मी प्रसन्न ॥'},
{id:'dattatreya',name:'श्री दत्तात्रेय',file:'assets/deity-dattatreya.png',invocation:'॥ श्री गुरुदेव दत्त ॥'},
{id:'shiv-parvati',name:'श्री शिव पार्वती',file:'assets/deity-shiv-parvati.png',invocation:'॥ ॐ नमः शिवाय ॥'},
{id:'hanuman',name:'श्री हनुमान',file:'assets/deity-hanuman.png',invocation:'॥ श्री हनुमान प्रसन्न ॥'},
{id:'krishna',name:'श्री कृष्ण',file:'assets/deity-krishna.png',invocation:'॥ श्री कृष्णाय नमः ॥'},
{id:'saraswati',name:'श्री सरस्वती',file:'assets/deity-saraswati.png',invocation:'॥ श्री सरस्वती प्रसन्न ॥'},
{id:'ram-sita',name:'श्री राम सीता',file:'assets/deity-ram-sita.png',invocation:'॥ श्री सीताराम प्रसन्न ॥'},
{id:'ganesha-line',name:'गणेश रेखा',file:'assets/ganesha-line.svg',legacy:true},
{id:'lotus',name:'कमळ',file:'assets/lotus.svg',legacy:true},
{id:'om',name:'ॐ',file:'assets/om.svg',legacy:true},
{id:'none',name:'चिन्ह नको',file:null}
];
const clean = (value, max=1500) => typeof value === 'string' ? value.slice(0,max) : '';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageData = value => typeof value === 'string' && value.length < 1800000 && /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value) ? value : null;
function fresh() {
 const order={}, hidden={}, custom={};
 Object.entries(sections).forEach(([s,data])=>{order[s]=data.fields.map(f=>f[0]);hidden[s]=[];custom[s]=[];});
 return {version:2,templateId:'pushp',values:{invocation:'॥ श्री गणेशाय नमः ॥'},order,hidden,custom,header:'ganesha',photo:null,headerImage:null,showPhoto:true};
}
function normalize(raw) {
 const d=fresh(); if(!raw || typeof raw!=='object')return d;
 const selected=templates.find(t=>t.id===raw.templateId); if(selected)d.templateId=selected.id;
 d.showPhoto=typeof raw.showPhoto==='boolean'?raw.showPhoto:(selected?selected.photo:true);
 d.header=headers.some(h=>h.id===raw.header)?raw.header:'ganesha';
 d.photo=imageData(raw.photo);d.headerImage=imageData(raw.headerImage);
 d.values.invocation=typeof raw.values?.invocation==='string'?clean(raw.values.invocation,100):d.values.invocation;
 Object.entries(sections).forEach(([s,data])=>{
  const keys=data.fields.map(f=>f[0]);
  keys.forEach(k=>d.values[k]=clean(raw.values?.[k]));
  const items=Array.isArray(raw.custom?.[s])?raw.custom[s]:[];
  const seen=new Set();
  d.custom[s]=items.slice(0,50).filter(i=>i&&/^custom_[a-zA-Z0-9_]+$/.test(i.id)&&!seen.has(i.id)&&seen.add(i.id)).map(i=>({id:i.id,label:clean(i.label,80),value:clean(i.value)}));
  const all=[...keys,...d.custom[s].map(i=>i.id)];
  const order=Array.isArray(raw.order?.[s])?raw.order[s]:[];
  d.order[s]=[...new Set([...order.filter(k=>all.includes(k)),...all])];
  d.hidden[s]=Array.isArray(raw.hidden?.[s])?raw.hidden[s].filter(k=>all.includes(k)):[];
 });
 return d;
}
function entries(d,s) {
 return d.order[s].filter(k=>!d.hidden[s].includes(k)).map(k=>{
  const custom=d.custom[s].find(i=>i.id===k);
  const meta=sections[s].fields.find(f=>f[0]===k);
  const label=custom?custom.label:meta?.[1], value=custom?custom.value:d.values[k];
  return label?.trim()&&value?.trim()?{key:k,label:label.trim(),value:value.trim()}:null;
 }).filter(Boolean);
}
function demo() {
 const d=fresh();
 d.values={...d.values,fullName:'चि. आदित्य अभय देशमुख',birthDate:'१५ मे १९९८',birthTime:'सकाळी ८:३०',birthPlace:'पुणे',height:'५ फूट १० इंच',religion:'हिंदू',community:'मराठा',education:'बी.ई. (संगणक अभियांत्रिकी)',profession:'सॉफ्टवेअर अभियंता',company:'पुणे',kuldaivat:'तुळजाभवानी',gotra:'कश्यप',rashi:'सिंह',nakshatra:'मघा',nadi:'आदि',gan:'देव',father:'श्री. अभय देशमुख',fatherJob:'शेती',mother:'सौ. माधवी देशमुख',motherJob:'गृहिणी',sisters:'एक बहीण (विवाहित)',nativePlace:'सातारा',relatives:'पाटील, जाधव, कदम',contactName:'श्री. अभय देशमुख',phone:'९XXXXXXXXX',address:'पुणे, महाराष्ट्र'};
 return d;
}
const api={sections,templates,headers,fresh,normalize,entries,demo,esc,imageData};
if(typeof module!=='undefined'&&module.exports)module.exports=api; else root.Patrika=api;
})(typeof globalThis!=='undefined'?globalThis:this);

