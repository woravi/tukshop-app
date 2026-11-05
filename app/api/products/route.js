import connect from "@/utils/config/dbConnection";
import { Product } from "@/utils/models/Product";
import { NextResponse } from "next/server";
import { authorizeRoles } from "@/lib/server-access";
import { validateImageUrls, validateStock } from "@/lib/mysql-model.mjs";
import { validateCategory } from "@/lib/product-categories.mjs";
import { managementError } from "@/lib/merchandise-http.mjs";
import { positiveId } from "@/lib/merchandise.mjs";
const editable=['name','description','brand','category','category_id','material','condition','price','originalPrice','stock','images','is_demo'];
function payload(body) {
 if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Invalid body');
 const data=Object.fromEntries(editable.filter(k=>k in body).map(k=>[k,body[k]]));
 if('name' in data && (typeof data.name!=='string'||!data.name.trim()||data.name.length>255))throw new Error('Invalid name');
 for(const key of ['price','originalPrice'])if(key in data){if(data[key]===''||data[key]===null||!['number','string'].includes(typeof data[key])||!Number.isFinite(Number(data[key]))||Number(data[key])<0||Number(data[key])>9999999999.99)throw new Error('Invalid price');data[key]=Number(data[key]);}
 if('is_demo' in data && typeof data.is_demo!=='boolean')throw new Error('Invalid demo field');
 if('category' in data)validateCategory(data.category);
 return data;
}

export async function GET() {
 try {await connect();return NextResponse.json(await Product.find({}).populate('user','name profileImage').sort({createdAt:-1}));}
 catch(error){return managementError(error);}
}
export async function POST(req) {
 const access=await authorizeRoles(["owner", "manager"]);
 if(access.status!==200)return NextResponse.json({error:'Forbidden'},{status:access.status});
 try {
  const body=await req.json();const data=payload(body);
  const {stock=0,images}=data;validateStock(stock);validateImageUrls(images);
  if(!data.name || data.price==null)throw new Error('Invalid name or price');
  await connect();
  const savedProduct=await Product.create({...data,stock,is_demo:data.is_demo??false,user:access.actor.id});
  return NextResponse.json({message:'Product created successfully',success:true,savedProduct});
 }catch(error){return managementError(error);}
}
