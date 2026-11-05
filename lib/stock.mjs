export function availableStock(product) {
  if (product?.is_demo) return 0;
  return Number.isSafeInteger(product?.stock) && product.stock >= 0 ? product.stock : 0;
}

export function stockLabel(product) {
  if (product?.is_demo) return 'สินค้าสาธิต — ไม่จำหน่าย';
  if (!Number.isSafeInteger(product?.stock) || product.stock < 0) return 'Stock unavailable';
  return product.stock === 0 ? 'Sold out' : `In stock: ${product.stock}`;
}
