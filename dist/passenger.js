import {STOPS} from './core.js';
import {decodeTicket} from './delivery.js';
const container=document.querySelector('#ticket-content');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function markup(t){return `<article class="travel-ticket"><div class="ticket-top"><strong>safar.</strong><span>${escape(t.requestCode)} · ROUTE 308</span></div><div class="ticket-inner"><p class="journey-label">FROM</p><p class="journey-stop">${STOPS[t.origin]}</p><div class="journey-arrow">↓</div><p class="journey-label">TO</p><p class="journey-stop">${STOPS[t.destination]}</p><div class="ticket-detail"><div><span>Passengers</span><strong>${t.quantity} adults</strong></div><div><span>Fare per adult</span><strong>₹${t.unit}</strong></div><div><span>Payment</span><strong>${t.paymentMethod==='upi'?'UPI':'Cash'} · demo</strong></div><div><span>Issued</span><strong>${escape(new Date(t.created).toLocaleString([],{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))}</strong></div></div><div class="ticket-total"><span>Total fare</span><strong>₹${t.total}</strong></div><p class="ticket-id">${escape(t.id)}<br>Payment ref: ${escape(t.paymentReference)}</p></div><div class="ticket-bottom">SAMPLE TICKET · NOT VALID FOR TRAVEL</div></article>`;}
try{
 const tokens=location.hash.slice(1).split('.');if(tokens.length>99)throw new Error('Too many tickets');
 const tickets=tokens.map(decodeTicket);container.innerHTML=tickets.map(markup).join('');
 document.querySelector('#print-ticket').addEventListener('click',()=>window.print());

}catch{container.innerHTML='<div class="error-message">This demo ticket link is missing or invalid. Ask the conductor to reopen the saved print layout.</div>';document.querySelectorAll('button').forEach(b=>b.hidden=true);}
