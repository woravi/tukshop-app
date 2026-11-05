import test from 'node:test';
import assert from 'node:assert/strict';

test('food manager and kitchen route permissions are distinct and deny customer by default',async()=>{
 const {foodRole,canManageFood,canUseKitchen}=await import('../lib/food-permissions.mjs');
 assert.equal(foodRole(null),'customer');
 for(const role of ['owner','manager']){assert.equal(canManageFood({user:{role}}),true);assert.equal(canUseKitchen({user:{role}}),true);}
 assert.equal(canManageFood({user:{role:'kitchen',admin:true}}),false);
 assert.equal(canUseKitchen({user:{role:'kitchen'}}),true);
 assert.equal(canUseKitchen({user:{role:'customer'}}),false);
 assert.equal(canManageFood({user:{admin:true}}),true);
});
