import { foodHandlers } from '@/lib/food-server.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const GET=foodHandlers.menuGet;
export const POST=foodHandlers.menuPost;
