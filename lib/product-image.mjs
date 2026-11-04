import sharp from 'sharp';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_PIXELS = 20_000_000;
const allowed = new Set(['image/jpeg','image/png','image/webp','image/avif']);
export async function resizeImage(data, mime) {
  if (!Buffer.isBuffer(data) || !data.length || data.length > MAX_UPLOAD_BYTES || !allowed.has(mime)) throw new Error('Invalid image type or size');
  let image;
  try {
    image = sharp(data, {limitInputPixels:MAX_PIXELS, failOn:'error', animated:false});
    const meta = await image.metadata();
    const formats = {'image/jpeg':'jpeg','image/png':'png','image/webp':'webp','image/avif':'heif'};
    if (meta.format !== formats[mime] || !meta.width || !meta.height || meta.width * meta.height > MAX_PIXELS) throw new Error('Invalid image format');
    const output = await image.rotate().resize(1600,1600,{fit:'inside',withoutEnlargement:true}).webp({quality:78, effort:5}).toBuffer();
    return {data:output,mime:'image/webp',width:(await sharp(output).metadata()).width,height:(await sharp(output).metadata()).height};
  } catch { throw new Error('Invalid image content or dimensions'); }
}
