import { lazyDatabase } from "@/utils/config/dbConnection";
import { authorizeRoles } from "@/lib/server-access";
import { managementHandlers } from "@/lib/merchandise-http.mjs";
const handlers=managementHandlers({db:lazyDatabase,authorize:authorizeRoles});
export async function PUT(req,{params}){const {productId,variantId}=await params;return handlers.variantSave(req,productId,variantId);}
