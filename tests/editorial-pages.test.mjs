import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/build/swc');
const root = new URL('../', import.meta.url);
function load(path) {
  const code = transformSync(readFileSync(new URL(path, root), 'utf8'), {
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'classic' } } },
    module: { type: 'commonjs' },
  }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { React, module, exports: module.exports, require: name => {
    if (name.startsWith('@/')) {
      const file = name.slice(2);
      return load(/\.(mjs|jsx|js)$/.test(file) ? file : `${file}.jsx`);
    }
    return require(name);
  } }, { filename: path });
  return module.exports;
}
const render = path => renderToStaticMarkup(React.createElement(load(path).default));

test('about tells the verified demo-store story without fabricated business credentials', () => {
  const html = render('app/about/page.jsx');
  assert.match(html, /ผ้ายีนส์/);
  assert.match(html, /4 ใบ/);
  assert.match(html, /แฮนด์เมด/);
  assert.match(html, /เรียนรู้/);
  assert.match(html, /ไม่เปิดรับการซื้อขายจริง/);
  assert.match(html, /ราคาสาธิต/);
  assert.ok((html.match(/<h2\b/g) || []).length >= 3);
  assert.match(html, /href="\/blog"/);
  assert.match(html, /href="\/contact"/);
  assert.doesNotMatch(html, /ก่อตั้งเมื่อ|กว่า \d+ ปี|ลูกค้ากว่า|รับประกันตลอดชีพ/);
});

test('contact clearly marks every channel as pending, requests no sensitive data and has no fake sending form', () => {
  const html = render('app/contact/page.jsx');
  for (const label of ['อีเมล', 'โทรศัพท์', 'LINE', 'ที่อยู่', 'เวลาติดต่อ']) assert.ok(html.includes(label), label);
  assert.match(html, /รอยืนยัน/);
  assert.match(html, /ยังไม่เปิดรับข้อความผ่านเว็บไซต์/);
  assert.match(html, /ไม่เปิดรับการซื้อขายจริง/);
  assert.match(html, /ไม่ต้องส่งข้อมูลส่วนตัว/);
  assert.doesNotMatch(html, /<form|<input|<textarea|mailto:|tel:|ส่งข้อความสำเร็จ|@[a-zA-Z0-9]|\b0\d{8,9}\b/);
  assert.match(html, /href="\/blog"/);
  assert.match(html, /href="\/about"/);
  assert.ok((html.match(/<h2\b/g) || []).length >= 3);
});

test('Thai blog index offers three distinct full article routes, not placeholders', () => {
  const html = render('app/blog/page.jsx');
  for (const route of ['post1', 'post3', 'post4']) assert.match(html, new RegExp(`href="/blog/${route}"`));
  assert.equal((html.match(/<article\b/g) || []).length, 3);
  assert.match(html, /ทดลอง/);
  assert.doesNotMatch(html, /ยังไม่มีบทความ|Lorem ipsum/);
});

test('each linked article renders original substantive Thai guidance with navigation and safe care caveats', () => {
  const titles = new Set();
  for (const route of ['post1', 'post3', 'post4']) {
    const html = render(`app/blog/${route}/page.jsx`);
    const title = html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1];
    assert.ok(title, `${route} must render, not redirect`);
    titles.add(title);
    assert.ok((html.match(/<h2\b/g) || []).length >= 4, 'at least four substantive sections');
    assert.ok(html.replace(/<[^>]+>/g, '').length > 1800, 'full article rather than a teaser');
    assert.match(html, /href="\/blog"/);
    assert.match(html, /href="\/products\/category\/all"/);
    assert.match(html, /ทดลอง/);
    assert.doesNotMatch(html, /ซักเครื่องได้|รับประกันสีไม่ตก|กันน้ำได้|Lorem ipsum/);
  }
  assert.equal(titles.size, 3);
  const care = render('app/blog/post4/page.jsx');
  assert.match(care, /ป้ายดูแล/);
  assert.match(care, /ไม่.*ซักได้/);
  assert.match(care, /เฉพาะรุ่น/);
});
