import { createManagement } from './merchandise.mjs';
export function managementError(error) {
  const status=error.status||(error.code==='ER_DUP_ENTRY'?409:error instanceof SyntaxError||/^Invalid/.test(error.message)?400:500);
  return Response.json({error:status===500?'Unable to save merchandise':error.code==='ER_DUP_ENTRY'?'Name or SKU already exists':error.message},{status});
}
export function managementHandlers({db,authorize}) {
  const api=createManagement(db);
  const mutate=async(req,work)=>{
    const access=await authorize(['owner','manager']);
    if(access.status!==200)return Response.json({error:'Forbidden'},{status:access.status});
    try { const input=await req.json(); if(!input||typeof input!=='object'||Array.isArray(input))return Response.json({error:'Invalid body'},{status:400});return Response.json(await work(input,access.actor)); }
    catch(error){return managementError(error);}
  };
  const list=async(req,work)=>{
    const all=new URL(req.url).searchParams.get('all')==='1';
    if(all){const access=await authorize(['owner','manager']);if(access.status!==200)return Response.json({error:'Forbidden'},{status:access.status});}
    try{return Response.json(await work(all));}catch(error){return managementError(error);}
  };
  return {
    categories:req=>list(req,all=>api.listCategories(all)),
    categorySave:(req,id)=>mutate(req,input=>api.saveCategory(id,input)),
    categoryReorder:req=>mutate(req,input=>api.reorderCategories(input.order)),
    variants:(req,productId)=>list(req,all=>api.listVariants(productId,all)),
    variantSave:(req,productId,id)=>mutate(req,(input,actor)=>api.saveVariant(productId,id,input,actor.id)),
  };
}
