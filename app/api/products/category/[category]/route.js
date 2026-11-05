import connect, { lazyDatabase } from "@/utils/config/dbConnection";
import { Product } from "@/utils/models/Product";
import { createManagement } from "@/lib/merchandise.mjs";
import { managementError } from "@/lib/merchandise-http.mjs";
import { NextResponse } from "next/server";
export async function GET(request,{params}) {
 try {
  const {category}=await params;await connect();
  const found=await createManagement(lazyDatabase).resolveCategory(category);
  const products=await Product.find({category_id:found.id}).populate('user','name profileImage').sort({createdAt:-1});
  return NextResponse.json(products);
 }catch(error){return managementError(error);}
}
