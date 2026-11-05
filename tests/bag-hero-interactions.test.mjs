import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/build/swc');

// Exercise the component's real hooks and handlers. Only framework rendering,
// media-query preference and the clock are substituted at the browser boundary.
function mountHero(reducedMotion = false) {
  const timers = new Map();
  let nextTimer = 0;
  const host = tag => ({ children, ...props }) => React.createElement(tag, props, children);
  const code = transformSync(readFileSync(new URL('../components/HomepageComponents/HeroVideo.jsx', import.meta.url), 'utf8'), {
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' },
  }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    setInterval(fn, delay) { assert.equal(delay, 5500); const id = ++nextTimer; timers.set(id, fn); return id; },
    clearInterval(id) { timers.delete(id); },
    require(id) {
      if (id === 'next/image') return host('img');
      if (id === 'next/link') return host('a');
      if (id === 'framer-motion') return {
        useReducedMotion: () => reducedMotion,
        AnimatePresence: ({ children }) => children,
        motion: { div: host('div') },
      };
      return require(id);
    },
  });
  let renderer;
  act(() => { renderer = TestRenderer.create(React.createElement(module.exports.default)); });
  const controls = () => renderer.root.findAllByType('button').filter(button => button.props['aria-label']);
  return {
    renderer, timers, controls,
    selected() { return controls().findIndex(button => button.props['aria-pressed']); },
    tick() { act(() => { for (const fn of [...timers.values()]) fn(); }); },
    carousel() { return renderer.root.findByProps({ 'aria-roledescription': 'carousel' }); },
    playback() { return renderer.root.findByProps({ 'data-playback': true }); },
    dispose() { act(() => renderer.unmount()); },
  };
}

test('automatic slideshow cycles through all four actual photos and cleans up on unmount', () => {
  const app = mountHero();
  assert.equal(app.timers.size, 1);
  assert.equal(app.selected(), 0);
  for (const expected of [1, 2, 3, 0]) { app.tick(); assert.equal(app.selected(), expected); }
  const sources = app.renderer.root.findAllByType('img').map(image => image.props.src);
  for (const id of [2, 7, 12, 17]) assert.ok(sources.includes(`/api/images/${id}`));
  app.dispose();
  assert.equal(app.timers.size, 0);
});

test('thumbnail selection changes the featured photo and stops automatic playback', () => {
  const app = mountHero();
  try {
    act(() => app.controls()[2].props.onClick());
    assert.equal(app.selected(), 2);
    assert.equal(app.timers.size, 0);
    assert.equal(app.renderer.root.findAllByType('img')[0].props.src, '/api/images/12');
    act(() => app.playback().props.onClick());
    assert.equal(app.timers.size, 1);
    app.tick();
    assert.equal(app.selected(), 3);
    act(() => app.playback().props.onClick());
    assert.equal(app.timers.size, 0);
  } finally { app.dispose(); }
});

test('hover pauses temporarily and keyboard focus stops playback until explicitly resumed', () => {
  const app = mountHero();
  try {
    act(() => app.carousel().props.onMouseEnter());
    assert.equal(app.timers.size, 0);
    act(() => app.carousel().props.onMouseLeave());
    assert.equal(app.timers.size, 1);
    act(() => app.carousel().props.onFocusCapture({ target: { closest: () => null } }));
    assert.equal(app.timers.size, 0);
    act(() => app.carousel().props.onMouseLeave());
    assert.equal(app.timers.size, 0);
  } finally { app.dispose(); }
});

for (const preference of [true, null]) {
  test(`motion preference ${preference} never starts automatic rotation`, () => {
    const app = mountHero(preference);
    try {
      assert.equal(app.timers.size, 0);
      act(() => app.controls()[3].props.onClick());
      assert.equal(app.selected(), 3);
      assert.equal(app.timers.size, 0);
    } finally { app.dispose(); }
  });
}
