export const MAX_ADDITIONAL_PRODUCT_IMAGES = 3;

const SAFE_PRODUCT_IMAGE_PATH = /^\/(?:images|uploads)\/[A-Za-z0-9][A-Za-z0-9._/-]*\.(?:jpe?g|png|webp)$/i;

/**
 * Validate and normalize optional supplementary product images.
 * `undefined` means an update did not include this field and should preserve existing data.
 * @param {unknown} value
 * @param {string} mainImage
 * @returns {{ images: string[] | undefined, error?: string }}
 */
export function validateAdditionalProductImages(value, mainImage = '') {
  if (value === undefined) return { images: undefined };
  if (!Array.isArray(value)) {
    return { images: [], error: 'รูปเพิ่มเติมต้องอยู่ในรูปแบบรายการ' };
  }
  if (value.length > MAX_ADDITIONAL_PRODUCT_IMAGES) {
    return { images: [], error: `เพิ่มรูปสินค้าได้ไม่เกิน ${MAX_ADDITIONAL_PRODUCT_IMAGES} รูป` };
  }

  const images = [];
  for (const candidate of value) {
    if (typeof candidate !== 'string') {
      return { images: [], error: 'พาธรูปเพิ่มเติมไม่ถูกต้อง' };
    }

    const image = candidate.trim();
    if (!image) continue;
    if (image.includes('..') || !SAFE_PRODUCT_IMAGE_PATH.test(image)) {
      return { images: [], error: 'รูปเพิ่มเติมต้องเป็นไฟล์ JPG, PNG หรือ WebP ภายในเว็บไซต์' };
    }
    if (image !== mainImage && !images.includes(image)) images.push(image);
  }

  return { images };
}
