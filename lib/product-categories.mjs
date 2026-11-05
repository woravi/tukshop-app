export const BAG_CATEGORIES = Object.freeze([
  'กระเป๋าถือ', 'กระเป๋าสะพายข้าง', 'กระเป๋าสะพายไหล่', 'กระเป๋าโท้ท',
  'กระเป๋าเป้', 'กระเป๋าเดินทาง', 'กระเป๋าอื่นๆ',
]);

export function validateCategory(category) {
  if (category !== null && (typeof category !== 'string' || !category.trim() || category.length > 255 || category !== category.trim())) throw new Error('Invalid category');
  // Numeric route tokens are reserved for stable category IDs, not names or rename aliases.
  if (typeof category === 'string' && /^\d+$/.test(category)) throw new Error('Invalid category name: ชื่อหมวดหมู่ต้องไม่เป็นตัวเลขล้วน');
  return category;
}
