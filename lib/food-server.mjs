import { getPool } from '@/utils/config/dbConnection';
import { authorizeRoles } from '@/lib/server-access';
import { createFoodStore } from './food-store.mjs';
import { createFoodService } from './food-service.mjs';
import { createFoodHandlers } from './food-http.mjs';
export const foodHandlers=createFoodHandlers({authorizeRoles,getService:()=>createFoodService(createFoodStore(getPool()))});
