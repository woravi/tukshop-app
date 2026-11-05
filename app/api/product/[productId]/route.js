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

export async function GET(req,{params}) {
 try {const {productId}=await params;positiveId(productId);await connect();const product=await Product.findById(productId);return product?NextResponse.json(product):NextResponse.json({error:'Product not found'},{status:404});}
 catch(error){return managementError(error);}
}
export async function PUT(req,{params}) {
 const access=await authorizeRoles(["owner", "manager"]);
 if(access.status!==200)return NextResponse.json({error:'Forbidden'},{status:access.status});
 try {
  const {productId}=await params;positiveId(productId);
  const body=await req.json();const data=payload(body);
  if('stock' in body){validateStock(body.stock);validateStock(body.expectedStock);}
  if('images' in body)validateImageUrls(body.images);
  await connect();
  const product=await Product.findByIdAndUpdate(productId,data,{expectedStock:'stock' in body?body.expectedStock:undefined});
  return product?NextResponse.json(product):NextResponse.json({error:'Product not found'},{status:404});
 }catch(error){
  if(error.message?.startsWith('Stock changed'))return NextResponse.json({error:error.message},{status:409});
  return managementError(error);
 }
}
export async function DELETE(req,{params}) {
 const access=await authorizeRoles(["owner", "manager"]);
 if(access.status!==200)return NextResponse.json({error:'Forbidden'},{status:access.status});
 try {const {productId}=await params;positiveId(productId);await connect();const old=await Product.findByIdAndDelete(productId);return old?NextResponse.json({success:true}):NextResponse.json({error:'Product not found'},{status:404});}
 catch(error){return managementError(error);}
}
