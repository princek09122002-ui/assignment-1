export const STOPS = ['Majestic','Cubbon Park','Shivajinagar','MG Road','Trinity','Halasuru','Indiranagar','Swami Vivekananda Road','Baiyappanahalli','KR Puram','ITPL Main Gate','Whitefield'];
export const FARES = [0,10,15,20,20,25,30,30,35,35,40,45];
export const COMMON = [3,2,6,11];
export function fare(from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to>=STOPS.length||to<=from)throw new Error('Choose a destination ahead of boarding.');return Math.max(10,FARES[to]-FARES[from]);}
export function draft(){return {origin:null,destination:null,quantity:1};}
export function selectDestination(state,to,currentStop){const origin=state.origin??currentStop;fare(origin,to);return {...state,origin,destination:to};}
export function correctOrigin(state,origin){if(!Number.isInteger(origin)||origin<0||origin>=STOPS.length-1)throw new Error('Invalid boarding stop');return {...state,origin,destination:state.destination>origin?state.destination:null};}
export function makeTicket(state,id,online,now=new Date().toISOString()){if(!Number.isInteger(state.quantity)||state.quantity<1||state.quantity>99)throw new Error('Invalid passenger count');if(state.origin===null||state.destination===null)throw new Error('Select a journey first');const unit=fare(state.origin,state.destination);return {id,origin:state.origin,destination:state.destination,quantity:state.quantity,unit,total:unit*state.quantity,created:now,synced:online,printed:false,copies:0};}
export function validTicket(t){return t&&typeof t.id==='string'&&Number.isInteger(t.origin)&&Number.isInteger(t.destination)&&t.origin>=0&&t.destination>t.origin&&t.destination<STOPS.length&&Number.isInteger(t.quantity)&&t.quantity>=1&&t.quantity<=99&&t.unit===fare(t.origin,t.destination)&&t.total===t.unit*t.quantity&&typeof t.created==='string'&&Number.isFinite(Date.parse(t.created))&&typeof t.synced==='boolean'&&typeof t.printed==='boolean'&&Number.isInteger(t.copies)&&t.copies>=0;}
export function batchTotal(groups){return groups.reduce((total,g)=>total+fare(g.origin,g.destination)*g.quantity,0);}
export function makeBatch(groups,batchId,online,now=new Date().toISOString()){
 if(!groups.length||groups.length>3)throw new Error('A batch needs 1–3 separate groups.');
 if(groups.some(g=>g.paid!==true))throw new Error('Confirm cash received for every group.');
 if(groups.some(g=>!['print','digital'].includes(g.delivery)))throw new Error('Choose delivery for every group.');
 if(groups.some(g=>g.origin!==groups[0].origin))throw new Error('All groups in this batch must share a boarding stop.');
 return groups.map((g,i)=>({...makeTicket(g,`${batchId}-${i+1}`,online,now),batchId,group:i+1,delivery:g.delivery,digitalDelivered:false,printError:false}));
}
