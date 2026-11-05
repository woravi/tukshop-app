export function categoryHref(category) {
  return `/products/category/${encodeURIComponent(category)}`;
}

// Client route params can still be URL-encoded. Decode exactly one layer;
// preserve malformed input so the API can reject it through the normal UI error.
export function normalizeCategoryParam(category) {
  try {
    return decodeURIComponent(category);
  } catch {
    return category;
  }
}
