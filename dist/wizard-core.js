import {STOPS,fare,makeTicket} from './core.js';
export function newRun(id,origin=0,mode='single'){return {id,origin,mode,step:'destinations',selected:[],groups:[],active:0,editingPayment:false};}
export function amount(run,g){return fare(run.origin,g.destination)*g.quantity;}
export function committed(run){return run.groups.some(g=>['pending','unknown','paid'].includes(g.payment.status));}
export function toggleStop(run,to){
 if(run.step!=='destinations'||committed(run))throw new Error('Finish the current payments before changing destinations.');fare(run.origin,to);
 if(run.mode==='single')run.selected=run.selected[0]===to?[]:[to];
 else run.selected=run.selected.includes(to)?run.selected.filter(x=>x!==to):[...run.selected,to];
}
export function beginCounts(run){if(!run.selected.length)throw new Error('Choose at least one destination.');if(committed(run))throw new Error('Payments are already in progress.');run.groups=run.selected.map(destination=>run.groups.find(g=>g.destination===destination)||{destination,quantity:1,confirmed:false,payment:{method:'cash',status:'unpaid',reference:null},ticketId:null});run.active=0;run.step='passengers';run.editingPayment=false;}
export function setCount(run,q){if(!Number.isInteger(q)||q<1||q>99)throw new Error('Choose 1–99 passengers.');const g=run.groups[run.active];if(!g||['pending','unknown','paid'].includes(g.payment.status))throw new Error('This journey is locked for payment.');g.quantity=q;g.confirmed=false;g.payment.status='unpaid';g.payment.reference=null;}
export function nextCount(run){const g=run.groups[run.active];if(!g)throw new Error('Choose a journey.');g.confirmed=true;if(run.editingPayment){run.step='payments';run.editingPayment=false;delete run.editBackup;run.selected=[...new Set(run.groups.map(g=>g.destination))];if(run.selected.length!==run.groups.length)run.expressQueue=true;}else if(run.active<run.groups.length-1)run.active++;else run.step='payments';}
export function editCount(run,i){const g=run.groups[i];if(!g||['pending','unknown','paid'].includes(g.payment.status))throw new Error('Paid or pending journeys cannot be edited.');run.editBackup=JSON.parse(JSON.stringify(g));run.active=i;run.step='passengers';run.editingPayment=true;}
export function editDestination(run,to){const g=run.groups[run.active];if(!run.editingPayment||!g||['pending','unknown','paid'].includes(g.payment.status))throw new Error('Only an unpaid ticket can be corrected.');fare(run.origin,to);g.destination=to;g.payment={method:g.payment.method,status:'unpaid',reference:null};g.confirmed=false;run.selected=[...new Set([...run.selected,to])];}
export function cancelEdit(run){if(!run.editingPayment)return;if(run.editBackup)run.groups[run.active]=run.editBackup;delete run.editBackup;run.editingPayment=false;run.step='payments';run.selected=[...new Set(run.groups.map(g=>g.destination))];}
export function addJourney(run,destination,quantity){
 if(run.editingPayment||run.step==='passengers')throw new Error('Save or cancel the current count first.');
 fare(run.origin,destination);if(!Number.isInteger(quantity)||quantity<1||quantity>99)throw new Error('Choose 1–99 passengers.');
 if(run.groups.length>=99)throw new Error('Finish these tickets before starting another run.');
 run.groups.push({destination,quantity,confirmed:true,payment:{method:'cash',status:'unpaid',reference:null},ticketId:null});
 run.selected=[...new Set([...run.selected,destination])];run.step='payments';run.expressQueue=true;return run.groups.length-1;
}
export function cashChange(total,received){if(!Number.isFinite(received)||received<total||!Number.isInteger(received))throw new Error('Cash received must cover the full fare.');return received-total;}
export function method(run,i,value){const g=run.groups[i];if(!g||!['cash','upi'].includes(value))throw new Error('Choose cash or UPI.');if(['pending','unknown','paid'].includes(g.payment.status))throw new Error('Resolve this payment before changing its method.');g.payment={method:value,status:'unpaid',reference:null};}
export function confirmCash(run,i,reference){const g=run.groups[i];if(run.step!=='payments'||!g?.confirmed||g.payment.method!=='cash'||!['unpaid','failed'].includes(g.payment.status))throw new Error('This cash payment cannot be confirmed again.');g.payment={method:'cash',status:'paid',reference,amount:amount(run,g)};}
export function requestUpi(run,i,reference,online){const g=run.groups[i];if(!online)throw new Error('Reconnect to collect UPI. Cash remains available.');if(run.step!=='payments'||!g?.confirmed||g.payment.method!=='upi')throw new Error('Choose UPI for this destination.');if(g.payment.status==='paid')throw new Error('Payment already received.');if(['pending','unknown'].includes(g.payment.status))return g.payment;g.payment={method:'upi',status:'pending',reference,amount:amount(run,g)};return g.payment;}
export function resolveUpi(run,i,reference,outcome,online){const g=run.groups[i];if(!online)throw new Error('Reconnect before checking payment.');if(!g||g.payment.method!=='upi'||g.payment.reference!==reference||!['pending','unknown'].includes(g.payment.status))throw new Error('This request is no longer pending.');if(!['paid','failed','unknown'].includes(outcome))throw new Error('Invalid payment result.');g.payment.status=outcome;}
export function paidUnprinted(run,history){return run.groups.filter(g=>g.payment.status==='paid'&&(!g.ticketId||!history.find(t=>t.id===g.ticketId)?.printed));}
export function preparePrint(run,history){
 const work=[];for(let i=0;i<run.groups.length;i++){
  const g=run.groups[i];if(g.payment.status!=='paid')continue;
  let t=g.ticketId?history.find(t=>t.id===g.ticketId):null;
  if(g.ticketId&&!t)throw new Error('Saved ticket missing. Recover its record instead of issuing again.');
  if(!t){t={...makeTicket({origin:run.origin,destination:g.destination,quantity:g.quantity},`${run.id}-${i+1}`,false),group:i+1,requestCode:g.requestCode,runId:run.id,paymentMethod:g.payment.method,paymentReference:g.payment.reference,delivery:'print',printError:false};g.ticketId=t.id;history.unshift(t);}
  if(!t.printed)work.push(t);
 }return work;
}
export function allPrinted(run,history){return !!run.groups.length&&run.groups.every(g=>g.payment.status==='paid'&&g.ticketId&&history.find(t=>t.id===g.ticketId)?.printed);}
export function restoreRun(value){
 if(!value||!/^[A-Z0-9-]+$/.test(value.id)||!['single','multi'].includes(value.mode)||!['destinations','passengers','payments','complete'].includes(value.step)||!Number.isInteger(value.origin)||value.origin<0||value.origin>=STOPS.length-1||!Array.isArray(value.selected)||!Array.isArray(value.groups))throw new Error('Invalid saved session');
 if(new Set(value.selected).size!==value.selected.length||value.selected.some(d=>!Number.isInteger(d)||d<=value.origin||d>=STOPS.length))throw new Error('Invalid stops');
 if(value.groups.some(g=>!value.selected.includes(g.destination)||!Number.isInteger(g.quantity)||g.quantity<1||g.quantity>99||!['cash','upi'].includes(g.payment?.method)||!['unpaid','pending','unknown','paid','failed'].includes(g.payment?.status)))throw new Error('Invalid saved group');
 if(value.step!=='destinations'&&(!value.groups.length||!Number.isInteger(value.active)||value.active<0||value.active>=value.groups.length))throw new Error('Invalid progress');return value;
}
