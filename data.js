/* Shared field definitions and validation for browser and server. */
(function(root) {
'use strict';
const sections = {
  personal: { title: 'वैयक्तिक माहिती', fields: [
    ['fullName','पूर्ण नाव','उदा. सौ. अनन्या विजय कुलकर्णी'], ['birthDate','जन्म तारीख','उदा. १२ ऑगस्ट १९९८'], ['birthTime','जन्म वेळ','उदा. सकाळी ६:४०'], ['birthPlace','जन्म स्थळ','उदा. पुणे'], ['height','उंची','उदा. ५ फूट ४ इंच'], ['religion','धर्म','धर्म निवडा',['हिंदू','जैन','बौद्ध','मुस्लिम','शीख','ख्रिश्चन','इतर']], ['community','जात / समाज','उदा. देशस्थ ब्राह्मण'], ['motherTongue','मातृभाषा','मातृभाषा निवडा',['मराठी','हिंदी','इंग्रजी','गुजराती','कन्नड','इतर']], ['complexion','वर्ण','वर्ण निवडा',['गोरा','गव्हाळ','सावळा','इतर']], ['bloodGroup','रक्तगट','रक्तगट निवडा',['A+','A-','B+','B-','AB+','AB-','O+','O-']], ['maritalStatus','वैवाहिक स्थिती','स्थिती निवडा',['अविवाहित','घटस्फोटित','विधवा / विधुर','इतर']], ['education','शिक्षण','उदा. बी.ई. (कॉम्प्युटर)'], ['profession','व्यवसाय','उदा. शेती'], ['company','कार्यस्थळ / संस्था','उदा. पुणे'], ['income','उत्पन्नाचा तपशील (ऐच्छिक)','उदा. आवश्यक असल्यास'], ['about','माझ्याविषयी','थोडक्यात स्वतःबद्दल लिहा']
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

const islamicSections={
 personal:{title:'व्यक्तिगत जानकारी',fields:[['fullName','पूरा नाम','उदा. आयशा खान'],['birthDate','जन्म तिथि','उदा. १२ मई १९९८'],['birthPlace','जन्म स्थान','उदा. मुंबई'],['height','कद','उदा. ५ फीट ४ इंच'],['maritalStatus','वैवाहिक स्थिति','उदा. अविवाहित'],['motherTongue','मातृभाषा','उदा. उर्दू'],['education','शिक्षा','उदा. स्नातक'],['profession','पेशा','उदा. शिक्षक'],['company','कार्यस्थल','उदा. पुणे'],['income','आय (वैकल्पिक)','अपनी इच्छानुसार लिखें'],['about','अपने बारे में','संक्षेप में लिखें']]},
 faith:{title:'धार्मिक व सामुदायिक जानकारी',fields:[['religion','धर्म (वैकल्पिक)','उदा. इस्लाम'],['sect','मसलक / फ़िरक़ा (वैकल्पिक)','अपनी इच्छानुसार लिखें'],['community','बिरादरी / समुदाय (वैकल्पिक)','अपनी इच्छानुसार लिखें'],['faithPractice','धार्मिक अभ्यास (वैकल्पिक)','अपनी इच्छानुसार लिखें'],['religiousEducation','धार्मिक शिक्षा (वैकल्पिक)','अपनी इच्छानुसार लिखें']]},
 family:{title:'परिवार की जानकारी',fields:[['father','पिता का नाम','उदा. मोहम्मद खान'],['fatherJob','पिता का पेशा','उदा. व्यवसाय'],['mother','माता का नाम','उदा. सायरा खान'],['motherJob','माता का पेशा','उदा. गृहिणी'],['brothers','भाई','उदा. एक भाई'],['sisters','बहनें','उदा. एक बहन'],['familyType','परिवार का विवरण','अपनी इच्छानुसार लिखें'],['nativePlace','मूल स्थान','उदा. मुंबई'],['relatives','परिवार की अन्य जानकारी','अपनी इच्छानुसार लिखें']]},
 contact:{title:'संपर्क और अपेक्षाएँ',fields:[['contactName','संपर्क व्यक्ति / अभिभावक','उदा. परिवार का सदस्य'],['phone','मोबाइल नंबर','उदा. +९१'],['whatsapp','व्हाट्सऐप नंबर','वैकल्पिक'],['email','ईमेल','वैकल्पिक'],['address','वर्तमान पता','उदा. मुंबई'],['expectations','जीवनसाथी से अपेक्षाएँ','वैकल्पिक']]}
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
// New motif pairs use different frame treatments, paper colors, and ink palettes.
const additionalSeed = [
 ['rajmandal','राजमंडल','#b68c48','mandala-heavy',true,'#fffaf0','#30251e','mandala'],
 ['nishamandal','निशामंडल','#e5bb75','mandala-heavy',false,'#17213a','#f6ebd7','mandala'],
 ['padmakona','पद्मकोन','#b85b79','mandala-corner',true,'#fff8fa','#39272f','mandala'],
 ['nilpadma','नीलपद्म','#96bfe0','mandala-corner',false,'#152a40','#eef6fa','mandala'],
 ['mandaprekha','मंडपरेखा','#a96d3d','mandala-arch',true,'#fff8ef','#382a25','mandala'],
 ['tamramandap','ताम्रमंडप','#dda575','mandala-arch',false,'#332420','#f7eae0','mandala'],
 ['suryaavali','सूर्यावली','#c78335','sunburst',true,'#fffaf0','#3c2b1f','mandala'],
 ['ratrisurya','रात्रीसूर्य','#e2b36c','sunburst',false,'#232334','#f7ecd8','mandala'],
 ['zenduvel','केशरी कोपरा','#bc6b28','marigold',true,'#fffbf1','#382b21','corner'],
 ['zendurang','केशरी रात्र','#e6ad54','marigold',false,'#28392b','#f8f1df','corner'],
 ['gulabvel','गुलाबी कमान','#aa4864','rose-vine',true,'#fff8f7','#392832','corner'],
 ['gulabratra','गुलाबी रात्र','#e5a4ae','rose-vine',false,'#36202e','#fff0ed','corner'],
 ['jaimala','हिरवा तिरपा','#628b6c','jasmine',true,'#fbfff7','#26352b','corner'],
 ['jaichhaya','हिरवी छाया','#b8d6b2','jasmine',false,'#203c3a','#ecf7ef','corner'],
 ['kamalsar','त्रिकोणी काठ','#bd648b','lotus-chain',true,'#fff9fc','#352631','corner'],
 ['kamalnisha','त्रिकोणी निशा','#ddacd2','lotus-chain',false,'#29223d','#f8eff9','corner'],
 ['mogra','सुंदर चौकट','#778a53','blossom',true,'#fffff8','#313525','corner'],
 ['mogarachand','चांदणी चौकट','#d9ddaa','blossom',false,'#2c3428','#f6f7df','corner'],
 ['soneri-zari','सोनेरी जरी','#b58532','zari',true,'#fffaf1','#352a20','border'],
 ['nilzari','नील जरी','#e5c47e','zari',false,'#17253c','#f9f2e5','border'],
 ['morjharokha','मोर झरोखा','#367977','jali',true,'#f7fffc','#273633','border'],
 ['ratrichijali','रात्रीची जाळी','#8abfbb','jali',false,'#172f32','#eff9f6','border'],
 ['chaukoni','चौकोनी','#556fa0','geometric',true,'#f8fbff','#293144','border'],
 ['shahi-chaukoni','शाही चौकोनी','#aab8e3','geometric',false,'#20283f','#f1f4ff','border'],
 ['peshwai','पेशवाई','#9f3f46','heritage',true,'#fff9f3','#3b2827','border'],
 ['peshwai-ratra','पेशवाई रात्र','#dca69c','heritage',false,'#382329','#f8eeea','border'],
 ['morpankhi-kath','मोरपंखी काठ','#38717a','peacock-eye',true,'#f8fefc','#26353a','border'],
 ['morpankhi-nisha','मोरपंखी निशा','#9cc9c2','peacock-eye',false,'#172e39','#f0f8f5','border'],
 ['kiran-kath','किरण काठ','#ac633c','art-deco',true,'#fffbf6','#362b27','border'],
 ['kiran-sandhya','किरण संध्या','#e2a97f','art-deco',false,'#302838','#f8efe6','border'],
 ['rang-petal','रंगछाप','#9e507e','blockprint',true,'#fffafd','#3c2939','corner'],
 ['rang-petal-ratra','रंगछाप रात्र','#d49fc1','blockprint',false,'#33253b','#f8eff6','corner']
];
const templates = [...templateSeed,...additionalSeed].map(([id,name,color,border,photo,background='#fff',ink='#282329',family='classic'],i)=>({id,name,color,border,photo,background,ink,family,index:i}));
const buddhistSeed=[
 ['buddha-dhamma','धम्मचक्र सुवर्ण','#ad7830','wheel',true,'#fffaf0','#332b24'],
 ['buddha-blue','धम्म निळाई','#d0a95f','wheel',false,'#182d50','#f9f2df'],
 ['buddha-bodhi','बोधी छाया','#46735f','bodhi',true,'#f7fbf3','#26382f'],
 ['buddha-bodhi-night','बोधी निशा','#b9d3ab','bodhi',false,'#203a36','#f1f8e9'],
 ['buddha-saffron','केशरी त्रिरत्न','#bc692d','rays',true,'#fffaf0','#3b2c23'],
 ['buddha-indigo','नील त्रिरत्न','#e3bb79','rays',false,'#262940','#fcf2e2'],
 ['buddha-peace','शांत धम्म','#486d9d','pillar',true,'#f7faff','#263244'],
 ['buddha-heritage','धम्म वारसा','#e3bf88','pillar',false,'#352a32','#fbf0e4'],
 ['buddha-azure','निळे धम्मचक्र','#275992','azure',true,'#f3f8ff','#1d3048'],
 ['buddha-amethyst','जांभळा धम्म','#e2b878','archway',false,'#332547','#fcf2dd'],
 ['buddha-jade','शांत हिरवा','#2e796f','minimal-wheel',true,'#f5fcf8','#203c35'],
 ['buddha-copper','ताम्र वारसा','#e7b487','stepped',false,'#3b2824','#fff2e8'],
 ['buddha-bodhi-path','बोधी मार्ग','#56762f','bodhi-path',true,'#fcfff3','#2f3a26'],
 ['buddha-ocean','नील धम्मतरंग','#adccdf','waves',false,'#192e43','#eff9ff'],
 ['buddha-colors','पंचरंगी धम्म','#1e5790','five-colors',true,'#fffdf6','#26323d']
];
buddhistSeed.forEach(([id,name,color,border,photo,background,ink])=>templates.push({id,name,color,border,photo,background,ink,family:'buddhist',religion:'buddhist',index:templates.length}));
const islamicSeed=[
 ['islamic-noor','हरा नूर','#256744','arch',true,'#fffdf5','#29392c'],['islamic-mehfil','सुनहरी महफ़िल','#e2c47a','arch',false,'#3b3022','#f9f3e7'],
 ['islamic-hilal','हरी हिलाल','#c5e5ca','crescent',true,'#183e2c','#f1f8f2'],['islamic-sahar','सुनहरी सहर','#8f6e25','crescent',false,'#fffdf4','#372e23'],
 ['islamic-jali','हरी जाली','#26745c','lattice',true,'#f3faf4','#263c31'],['islamic-raat','सुनहरी जाली','#dcca87','lattice',false,'#3d3323','#f9f4e6'],
 ['islamic-sitara','हरा सितारा','#d1e6bf','star',true,'#25432e','#f2f8ed'],['islamic-shahi','शाही सितारा','#886522','star',false,'#fffaf0','#372f20'],
 ['islamic-rekha','हरी रेखा','#316845','minimal',true,'#f9fdf6','#293b2e'],['islamic-sadaf','सुनहरा सदफ़','#ead09a','minimal',false,'#342b1f','#fbf3e4'],
 ['islamic-henna','मेहंदी कोना','#d6e7b3','corner',true,'#34462b','#f4f8ea'],['islamic-zar','ज़र कोना','#946c2b','corner',false,'#fff9ed','#392f20'],
 ['islamic-sehar','हरी सहर','#3f7952','mihrab',true,'#f7fcf4','#293c30'],['islamic-mehrab','सुनहरी कमान','#ddc484','mihrab',false,'#392d1d','#fcf4e5'],
 ['islamic-nazakat','हरी नज़ाकत','#c1dfce','lines',true,'#173d34','#eff8f3'],['islamic-yaqoot','सुनहरा नूर','#80642f','lines',false,'#fffdf5','#372f24']
];
islamicSeed.forEach(([id,name,color,border,photo,background,ink],i)=>templates.push({id,name,color,border,photo,background,ink,family:'islamic',religion:'islamic',theme:i%2===0?'green':'gold',dark:i%4===1||i%4===2,index:templates.length}));
const christianSeed=[
 ['christian-grace','कृपेची चौकट','#526f9e','cross-corner',true,'#f7faff','#27364b'],['christian-night','निळी प्रार्थना','#c2d4ee','cross-corner',false,'#24354e','#f2f6ff'],
 ['christian-dove-light','शांततेचा प्रकाश','#627c69','dove-arch',true,'#f8fcf7','#293a2e'],['christian-dove-dark','शांती संध्या','#d1dfca','dove-arch',false,'#293c35','#f2f8ed'],
 ['christian-window','प्रार्थना कमान','#815c98','church-window',true,'#fcf8ff','#3b2b46'],['christian-violet','जांभळी कमान','#dbc2e7','church-window',false,'#392d44','#fbf1ff'],
 ['christian-rose','गुलाबी आशीर्वाद','#a45165','ribbon-cross',true,'#fff8f8','#3c2930'],['christian-ruby','गडद आशीर्वाद','#edc0c5','ribbon-cross',false,'#4a2a35','#fff1f2'],
 ['christian-geometric','निळी नक्षी','#386f84','cross-grid',true,'#f5fcfd','#263a40'],['christian-ocean','निळे वैभव','#afd4df','cross-grid',false,'#243e4a','#f0f9fb'],
 ['christian-sunrise','सुवर्ण किरण','#946b2e','rays-cross',true,'#fffaf0','#3b3025'],['christian-evening','सुवर्ण संध्या','#e8c687','rays-cross',false,'#403326','#fcf3e5'],
 ['christian-classic','पारंपरिक क्रूस','#7d596e','classic-cross',true,'#fff9fc','#3d2e37'],['christian-royal','शाही क्रूस','#e1c3d4','classic-cross',false,'#423142','#fbf1f8'],
 ['christian-simple','साधी प्रार्थना','#416a83','simple-cross',true,'#f7fbff','#283b46']
];
christianSeed.forEach(([id,name,color,border,photo,background,ink])=>templates.push({id,name,color,border,photo,background,ink,family:'christian',religion:'christian',index:templates.length}));
const headers = [
{id:'buddhist-ambedkar',name:'डॉ. बाबासाहेब आंबेडकर',file:'assets/buddhist-ambedkar.png',religion:'buddhist'},
{id:'buddhist-buddha',name:'भगवान बुद्ध',file:'assets/buddhist-buddha.png',religion:'buddhist'},
{id:'buddhist-leaf',name:'बोधी पान',file:'assets/buddhist-bodhi-leaf.png',religion:'buddhist'},
{id:'buddhist-meditation',name:'ध्यानस्थ बुद्ध',file:'assets/buddhist-meditation.png',religion:'buddhist'},
{id:'buddhist-stupa',name:'बौद्ध स्तूप',file:'assets/buddhist-stupa.png',religion:'buddhist'},
{id:'christian-jesus',name:'येशू ख्रिस्त',file:'assets/christian-jesus.png',religion:'christian'},
{id:'christian-cross',name:'क्रूस',file:'assets/christian-cross.png',religion:'christian'},
{id:'christian-dove',name:'शांततेचे कबूतर',file:'assets/christian-dove.png',religion:'christian'},
{id:'christian-church',name:'चर्च',file:'assets/christian-church.png',religion:'christian'},
{id:'christian-bible',name:'पवित्र बायबल',file:'assets/christian-bible.png',religion:'christian'},
{id:'islamic-crescent',name:'चाँद और सितारा',file:'assets/islamic-crescent.png',religion:'islamic'},
{id:'islamic-allah',name:'اللہ',file:'assets/islamic-allah-urdu.png',religion:'islamic'},
{id:'islamic-lantern',name:'लालटेन',file:'assets/islamic-lantern.png',religion:'islamic'},
{id:'islamic-arch',name:'कमान',file:'assets/islamic-arch.png',religion:'islamic'},
{id:'islamic-star',name:'ज्यामितीय सितारा',file:'assets/islamic-star.png',religion:'islamic'},
{id:'dhamma-wheel',name:'धम्मचक्र',file:'assets/dharma-wheel.svg',invocation:'बुद्धं शरणं गच्छामि',religion:'buddhist'},
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
function sectionsFor(d){return d?.profileType==='islamic'?islamicSections:sections;}
function fresh(profileType) {
 const order={}, hidden={}, custom={};
 Object.entries(profileType==='islamic'?islamicSections:sections).forEach(([s,data])=>{order[s]=data.fields.map(f=>f[0]);hidden[s]=[];custom[s]=[];});
 const draft={version:2,templateId:'pushp',values:{invocation:'॥ श्री गणेशाय नमः ॥'},order,hidden,custom,customSections:[],professionLabel:'व्यवसाय',labelOverrides:{},header:'ganesha',photo:null,headerImage:null,showPhoto:true};
 if(profileType==='islamic'){draft.profileType='islamic';draft.templateId='islamic-noor';draft.header='islamic-crescent';draft.values.invocation='';}
 return draft;
}
function normalize(raw) {
 const d=fresh(raw?.profileType==='islamic'||templates.find(t=>t.id===raw?.templateId)?.religion==='islamic'?'islamic':undefined); if(!raw || typeof raw!=='object')return d;
 const selected=templates.find(t=>t.id===raw.templateId); if(selected)d.templateId=selected.id;
 d.showPhoto=typeof raw.showPhoto==='boolean'?raw.showPhoto:(selected?selected.photo:true);
 d.header=headers.some(h=>h.id===raw.header)?raw.header:d.header;
 d.photo=imageData(raw.photo);d.headerImage=imageData(raw.headerImage);
 d.professionLabel=['व्यवसाय','नोकरी'].includes(raw.professionLabel)?raw.professionLabel:'व्यवसाय';
 const labelOptions={fullName:['मुलाचे नाव','मुलीचे नाव'],community:['जात','समाज'],company:['कार्यस्थळ','संस्था']};
 if(d.profileType==='islamic'){labelOptions.sect=['मसलक','फ़िरक़ा'];labelOptions.community=['बिरादरी','समुदाय'];}
 for(const [key,options] of Object.entries(labelOptions))if(options.includes(raw.labelOverrides?.[key]))d.labelOverrides[key]=raw.labelOverrides[key];
 const sectionIds=new Set();
 d.customSections=(Array.isArray(raw.customSections)?raw.customSections:[]).slice(0,20).filter(s=>s&&typeof s.id==='string'&&/^section_[a-zA-Z0-9_]+$/.test(s.id)&&!sectionIds.has(s.id)&&sectionIds.add(s.id)).map(s=>{
  const fieldIds=new Set();
  return {id:s.id,title:clean(s.title,80),fields:(Array.isArray(s.fields)?s.fields:[]).slice(0,50).filter(f=>f&&typeof f.id==='string'&&/^field_[a-zA-Z0-9_]+$/.test(f.id)&&!fieldIds.has(f.id)&&fieldIds.add(f.id)).map(f=>({id:f.id,label:clean(f.label,80),value:clean(f.value)}))};
 });
 d.values.invocation=typeof raw.values?.invocation==='string'?clean(raw.values.invocation,100):d.values.invocation;
 Object.entries(sectionsFor(d)).forEach(([s,data])=>{
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
  const meta=sectionsFor(d)[s]?.fields.find(f=>f[0]===k);
  const label=custom?custom.label:k==='profession'&&d.profileType!=='islamic'?(d.professionLabel||'व्यवसाय'):(d.labelOverrides?.[k]||meta?.[1]), value=custom?custom.value:d.values[k];
  return label?.trim()&&value?.trim()?{key:k,label:label.trim(),value:value.trim()}:null;
 }).filter(Boolean);
}
function customSectionEntries(d){
 return (d.customSections||[]).map(s=>({title:s.title.trim(),rows:s.fields.filter(f=>f.label.trim()&&f.value.trim()).map(f=>({key:f.id,label:f.label.trim(),value:f.value.trim()}))})).filter(s=>s.title&&s.rows.length);
}
function demo(profileType) {
 const d=fresh(profileType);
 if(profileType==='islamic'){
  d.values={...d.values,fullName:'आयशा खान',birthDate:'१२ मई १९९८',birthPlace:'मुंबई',height:'५ फीट ४ इंच',maritalStatus:'अविवाहित',motherTongue:'उर्दू',education:'स्नातक',profession:'शिक्षक',father:'अहमद खान',mother:'सायरा खान',brothers:'एक भाई',contactName:'परिवार',phone:'९XXXXXXXXX',address:'मुंबई'};
  return d;
 }
 d.values={...d.values,fullName:'चि. आदित्य अभय देशमुख',birthDate:'१५ मे १९९८',birthTime:'सकाळी ८:३०',birthPlace:'पुणे',height:'५ फूट १० इंच',religion:'हिंदू',community:'मराठा',education:'बी.ई. (संगणक अभियांत्रिकी)',profession:'सॉफ्टवेअर अभियंता',company:'पुणे',kuldaivat:'तुळजाभवानी',gotra:'कश्यप',rashi:'सिंह',nakshatra:'मघा',nadi:'आदि',gan:'देव',father:'श्री. अभय देशमुख',fatherJob:'शेती',mother:'सौ. माधवी देशमुख',motherJob:'गृहिणी',sisters:'एक बहीण (विवाहित)',nativePlace:'सातारा',relatives:'पाटील, जाधव, कदम',contactName:'श्री. अभय देशमुख',phone:'९XXXXXXXXX',address:'पुणे, महाराष्ट्र'};
 return d;
}
const api={sections,islamicSections,sectionsFor,templates,headers,fresh,normalize,entries,customSectionEntries,demo,esc,imageData};
if(typeof module!=='undefined'&&module.exports)module.exports=api; else root.Patrika=api;
})(typeof globalThis!=='undefined'?globalThis:this);

