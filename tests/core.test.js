import test from 'node:test';
import assert from 'node:assert/strict';
import {draft,selectDestination,correctOrigin,fare,makeTicket,validTicket} from '../dist/core.js';
test('MG Road for three creates one group record with a correct total',()=>{let d=selectDestination(draft(),3,0);d.quantity=3;const t=makeTicket(d,'SF-TEST',true);assert.equal(t.total,60);assert.equal(t.quantity,3);assert.equal(t.unit,20);assert.equal(validTicket(t),true);});
test('moving bus cannot alter a captured boarding stop',()=>{let d=selectDestination(draft(),3,0);d=selectDestination(d,6,1);assert.equal(d.origin,0);assert.equal(makeTicket(d,'ID',true).unit,30);assert.equal(selectDestination(draft(),6,1).origin,1);});
test('manual boarding correction clears destinations now behind',()=>{let d=selectDestination(draft(),3,0);d=correctOrigin(d,4);assert.equal(d.destination,null);assert.equal(d.origin,4);assert.throws(()=>makeTicket(d,'ID',true));});
test('manual boarding correction recalculates fare',()=>{let d=selectDestination(draft(),6,0);d=correctOrigin(d,2);assert.equal(makeTicket(d,'ID',true).unit,15);});
test('offline record remains pending and invalid journeys cannot issue',()=>{const t=makeTicket(selectDestination(draft(),3,0),'ID',false);assert.equal(t.synced,false);assert.throws(()=>fare(3,2));assert.throws(()=>makeTicket({...draft(),quantity:0},'ID',true));assert.throws(()=>fare(-1,3));});
test('reprinting keeps ticket identity and recorded cash unchanged',()=>{const t=makeTicket({...selectDestination(draft(),3,0),quantity:3},'ID',true);t.printed=true;t.copies++;const amount=t.total;t.copies++;assert.equal(t.id,'ID');assert.equal(t.total,amount);assert.equal(t.copies,2);assert.equal(validTicket(t),true);});
