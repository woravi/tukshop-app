import { lazyDatabase } from "@/utils/config/dbConnection";
import { authorizeRoles } from "@/lib/server-access";
import { managementHandlers } from "@/lib/merchandise-http.mjs";
const handlers=managementHandlers({db:lazyDatabase,authorize:authorizeRoles});
export const GET=req=>handlers.categories(req);
export const POST=req=>handlers.categorySave(req,null);
export const PATCH=req=>handlers.categoryReorder(req);
