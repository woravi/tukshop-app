import { authorizeRoles } from '@/lib/server-access';
import { getPool } from '@/utils/config/dbConnection';
import { resizeImage, MAX_UPLOAD_BYTES } from '@/lib/product-image.mjs';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
const MAX_REQUEST_BYTES = MAX_UPLOAD_BYTES + 65536;
async function boundedFormData(req) {
  const length = Number(req.headers.get('content-length'));
  if (length > MAX_REQUEST_BYTES) throw new Error('Image too large');
  const chunks = [];
  let total = 0;
  const reader = req.body?.getReader();
  if (!reader) throw new Error('Image required');
  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REQUEST_BYTES) {await reader.cancel(); throw new Error('Image too large');}
    chunks.push(value);
  }
  return new Request('http://localhost/', {method:'POST',headers:{'content-type':req.headers.get('content-type') || ''},body:Buffer.concat(chunks)}).formData();
}
export async function POST(req) {
  const { status: access } = await authorizeRoles(['owner', 'manager']);
  if (access !== 200) return NextResponse.json({error:'Forbidden'},{status:access});
  try {
    const form = await boundedFormData(req);
    const file = form.get('file') || form.get('image');
    if (!(file instanceof File) || file.size > MAX_UPLOAD_BYTES) return NextResponse.json({error:'Invalid image'},{status:400});
    const image = await resizeImage(Buffer.from(await file.arrayBuffer()),file.type);
    const [result] = await getPool().execute('INSERT INTO product_images (mime,data,byte_size,width,height) VALUES (?,?,?,?,?)', [image.mime,image.data,image.data.length,image.width,image.height]);
    const id = String(result.insertId);
    return NextResponse.json({id,url:`/api/images/${id}`},{status:201});
  } catch (error) {
    if (/Image|image/.test(error.message)) return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json({error:'Upload failed'},{status:500});
  }
}
