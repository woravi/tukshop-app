import { FoodError, fail, object } from './food-domain.mjs';
const MANAGERS=['owner','manager'],STAFF=['owner','manager','kitchen'];
const reply=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff'}});
export async function foodJson(req) {
  if (!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')??''))fail('JSON body required');
  const length=req.headers.get('content-length');
  if(length!==null&&(!/^\d+$/.test(length)||Number(length)>65536))fail('Request too large');
  const reader=req.body?.getReader();if(!reader)fail('JSON body required');
  let size=0;const chunks=[];
  try {
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();fail('Request too large');}chunks.push(value);}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
    if(!object(body))fail('JSON object required');return body;
  }catch(error){if(error instanceof FoodError)throw error;fail('Invalid JSON');}
  finally{reader.releaseLock();}
}
export function createFoodHandlers({getService,authorizeRoles,publicOrigin=process.env.NEXTAUTH_URL||process.env.NEXT_PUBLIC_URL}) {
  const wrap=(roles,mutation,fn)=>async(req,context={})=>{
    try {
      let actor;
      const required=typeof roles==='function'?roles(req):roles;
      if(required){const access=await authorizeRoles(required);if(access.status!==200)fail(access.status===401?'Unauthorized':'Forbidden',access.status===401?'UNAUTHORIZED':'FORBIDDEN',access.status===401?401:403);actor=access.actor;}
      // Managed proxies can expose localhost/http in req.url; trust configured server origin, never forwarded headers.
      if(mutation){const origin=req.headers.get('origin');if((origin&&origin!==new URL(publicOrigin||req.url).origin)||req.headers.get('sec-fetch-site')==='cross-site')fail('Forbidden origin','FORBIDDEN',403);}
      return await fn(req,context,actor);
    }catch(error){return error instanceof FoodError?reply({error:error.message,code:error.code},error.status):reply({error:'Food service unavailable',code:'INTERNAL_ERROR'},500);}
  };
  return {
    settingsGet:wrap(null,false,async()=>reply({settings:await getService().getSettings()})),
    settingsPut:wrap(MANAGERS,true,async(req,_ctx,actor)=>{const body=await foodJson(req);return reply({settings:await getService().putSettings(body,actor)});}),
    menuGet:wrap(req=>new URL(req.url).searchParams.get('include_inactive')==='1'?MANAGERS:null,false,async(req,_ctx,actor)=>reply({items:await getService().listMenu(new URL(req.url).searchParams.get('include_inactive')==='1',actor)})),
    menuPost:wrap(MANAGERS,true,async(req,_ctx,actor)=>{const body=await foodJson(req);return reply({item:await getService().saveMenu(body,null,actor)},201);}),
    menuPut:wrap(MANAGERS,true,async(req,ctx,actor)=>{const {id}=await ctx.params;const body=await foodJson(req);return reply({item:await getService().saveMenu(body,id,actor)});}),
    menuDelete:wrap(MANAGERS,true,async(_req,ctx,actor)=>{const {id}=await ctx.params;return reply(await getService().deleteMenu(id,actor));}),
    orderPost:wrap(null,true,async(req)=>{const body=await foodJson(req);const result=await getService().createOrder(body);return reply(result,result.replayed?200:201);}),
    orderGet:wrap(null,false,async(_req,ctx)=>{const {token}=await ctx.params;return reply({order:await getService().trackOrder(token)});}),
    adminOrdersGet:wrap(STAFF,false,async(req,_ctx,actor)=>reply(await getService().listOrders(new URL(req.url).searchParams.get('date')??undefined,actor))),
    adminOrderPatch:wrap(STAFF,true,async(req,ctx,actor)=>{const {id}=await ctx.params;const body=await foodJson(req);return reply({order:await getService().updateOrder(id,body,actor)});}),
  };
}
