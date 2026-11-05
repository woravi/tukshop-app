export const BAG_CATEGORIES = Object.freeze([
  'กระเป๋าถือ', 'กระเป๋าสะพายข้าง', 'กระเป๋าสะพายไหล่', 'กระเป๋าโท้ท',
  'กระเป๋าเป้', 'กระเป๋าเดินทาง', 'กระเป๋าอื่นๆ',
]);

export function validateCategory(category) {
  if (category !== null && !BAG_CATEGORIES.includes(category)) throw new Error('Invalid category');
  return category;
}
