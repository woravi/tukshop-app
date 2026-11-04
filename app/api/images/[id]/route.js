import { getPool } from '@/utils/config/dbConnection';
export const runtime = 'nodejs';
export async function GET(req,{params}) {
  const {id} = await params;
  if (!/^[1-9]\d*$/.test(id)) return new Response(null,{status:404});
  try {
    const [rows] = await getPool().execute('SELECT mime,data FROM product_images WHERE id=?',[id]);
    if (!rows.length) return new Response(null,{status:404});
    return new Response(new Uint8Array(rows[0].data), {headers:{'Content-Type':rows[0].mime,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
  } catch {return new Response(null,{status:500});}
}
