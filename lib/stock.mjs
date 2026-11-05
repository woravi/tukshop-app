export function availableStock(product) {
  return Number.isSafeInteger(product?.stock) && product.stock >= 0 ? product.stock : 0;
}

export function stockLabel(product) {
  if (!Number.isSafeInteger(product?.stock) || product.stock < 0) return 'Stock unavailable';
  return product.stock === 0 ? 'Sold out' : `In stock: ${product.stock}`;
}
