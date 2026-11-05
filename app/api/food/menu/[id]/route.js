import { foodHandlers } from '@/lib/food-server.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const PUT=foodHandlers.menuPut;
export const DELETE=foodHandlers.menuDelete;
