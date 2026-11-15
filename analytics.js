/* Vercel Web Analytics: collect page views without biodata or URL parameters. */
(function(){
'use strict';
if(location.protocol!=='https:'||!(location.hostname==='vivahpatrikamaker.in'||location.hostname==='www.vivahpatrikamaker.in'||location.hostname.endsWith('.vercel.app')))return;
window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};
window.va('beforeSend',function(event){
 try{const url=new URL(event.url,location.origin);url.search='';url.hash='';return {...event,url:url.toString()};}catch{return null;}
});
const script=document.createElement('script');script.defer=true;script.src='/_vercel/insights/script.js';document.head.appendChild(script);
})();
