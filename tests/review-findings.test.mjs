import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = p => readFileSync(new URL("../"+p, import.meta.url), "utf8");
test("stock migration is safe to run after current initial schema", () => {
  assert.match(read("sql/002_product_stock.sql"), /ADD COLUMN IF NOT EXISTS stock/i);
});
test("featured savings require a genuine discount", () => {
  const source=read("components/HomepageComponents/FeaturedProduct.jsx");
  assert.match(source, /Number\(featuredWatch1\?\.originalPrice\)\s*>\s*Number\(featuredWatch1\?\.price\)\s*&&/);
});
test("review mutations update only product aggregates", () => {
  const source=read("app/api/review/route.js");
  assert.doesNotMatch(source, /product\.save\(/);
  assert.equal((source.match(/Product\.findByIdAndUpdate\(/g)||[]).length,3);
});
test("checkout is unconditionally disabled even when enabled in environment", () => {
  const source=read("app/api/checkout/route.js");
  assert.doesNotMatch(source, /CHECKOUT_ENABLED|new Stripe|Order\.create|sessions\.create/);
  assert.match(source, /status:\s*503/);
});
