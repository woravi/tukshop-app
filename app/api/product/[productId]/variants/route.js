import { lazyDatabase } from "@/utils/config/dbConnection";
import { authorizeRoles } from "@/lib/server-access";
import { managementHandlers } from "@/lib/merchandise-http.mjs";
const handlers=managementHandlers({db:lazyDatabase,authorize:authorizeRoles});
export async function GET(req,{params}){const {productId}=await params;return handlers.variants(req,productId);}
export async function POST(req,{params}){const {productId}=await params;return handlers.variantSave(req,productId,null);}
