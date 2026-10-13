import QRCode from './vendor/qr/index.js';
import {validTicket} from './core.js';
export function encodeTicket(t){if(!validTicket(t))throw new Error('Invalid ticket');return btoa(JSON.stringify([t.id,t.origin,t.destination,t.quantity,t.unit,t.total,t.created,t.group||1,t.paymentMethod||'cash',t.paymentReference||'DEMO',t.requestCode||'A'+String(t.group||1).padStart(3,'0')])).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
export function decodeTicket(token){
 if(typeof token!=='string'||token.length>1500||!/^[\w-]+$/.test(token))throw new Error('Invalid ticket link');
 const a=JSON.parse(atob(token.replace(/-/g,'+').replace(/_/g,'/')));
 if(!Array.isArray(a)||![8,10,11].includes(a.length))throw new Error('Invalid ticket data');
 const [id,origin,destination,quantity,unit,total,created,group,paymentMethod='cash',paymentReference='DEMO',requestCode='A'+String(group).padStart(3,'0')]=a;
 const t={id,origin,destination,quantity,unit,total,created,group,paymentMethod,paymentReference,requestCode,synced:true,printed:false,copies:0};
 if(!/^A[0-9]{3,10}$/.test(requestCode)||!['cash','upi'].includes(paymentMethod)||!/^[-A-Z0-9]{1,80}$/.test(paymentReference)||!validTicket(t)||!/^[A-Z0-9-]{1,80}$/.test(t.id)||!Number.isInteger(group)||group<1||group>99)throw new Error('Invalid ticket data');
 return t;
}
export function qrSVG(text){const q=new QRCode(-1,1);q.addData(text);q.make();const n=q.getModuleCount(),size=n+8;let d='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(q.isDark(y,x))d+=`M${x+4} ${y+4}h1v1h-1z`;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Scan to open this demo ticket" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="white"/><path d="${d}" fill="#000"/></svg>`;}
