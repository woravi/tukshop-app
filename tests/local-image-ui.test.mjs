import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { File } from 'node:buffer';
import { createRequire } from 'node:module';
import { BAG_CATEGORIES } from '../lib/product-categories.mjs';

const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/build/swc');
const pages = ['create', 'editProduct/[productId]'];

function mount(page, axios = {}) {
  const source = readFileSync(new URL(`../app/${page}/page.jsx`, import.meta.url), 'utf8');
  const code = transformSync(source, { jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'classic' } } }, module: { type: 'commonjs' } }).code;
  const state = [];
  const effects = [];
  let slot = 0;
  const pushes = [];
  const errors = [];
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
    useState(initial) {
      const i = slot++;
      if (!(i in state)) state[i] = initial;
      return [state[i], (value) => { state[i] = typeof value === 'function' ? value(state[i]) : value; }];
    },
    useRef(initial) { const i = slot++; if (!(i in state)) state[i] = { current: initial }; return state[i]; },
    useEffect(fn) { effects.push(fn); },
  };
  const stubs = {
    '@/lib/product-categories.mjs': { BAG_CATEGORIES },
    react: { ...React, default: React },
    'next-auth/react': { useSession: () => ({ data: { user: { _id: 'admin' } } }) },
    'next/navigation': { useRouter: () => ({ push: url => pushes.push(url) }), useParams: () => ({ productId: 'product-1' }) },
    axios,
    'react-hot-toast': { __esModule: true, default: { error: message => errors.push(message), success() {} }, Toaster: 'Toaster' },
    'next/image': 'Image',
    '@/components/CategorySelect':'CategorySelect',
    '@/components/VariantManager':'VariantManager',
    '@/components/ui/button': { Button: 'Button' },
    '@/components/ui/input': { Input: 'Input' },
    '@/components/ui/textarea': { Textarea: 'Textarea' },
    'next-cloudinary': { CldUploadButton: 'CldUploadButton' },
  };
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: name => { if (!(name in stubs)) throw Error(`Unknown import ${name}`); return stubs[name]; }, FormData, console, process }, { filename: page });
  const Component = module.exports.default;
  const render = () => { slot = 0; return Component(); };
  const findAll = (tree, predicate) => {
    if (!tree || typeof tree !== 'object') return [];
    return [...(predicate(tree) ? [tree] : []), ...(tree.children || []).flatMap(child => findAll(child, predicate))];
  };
  const find = (tree, predicate) => findAll(tree, predicate)[0];
  return { render, find, findAll, effects, pushes, errors };
}

const event = () => ({ preventDefault() {} });
const inputOf = view => view.find(view.render(), node => node.type === 'input' && node.props.type === 'file');
const formOf = view => view.find(view.render(), node => node.type === 'form');
const imageSources = view => view.findAll(view.render(), node => node.type === 'Image').map(node => node.props.src);
const file = () => new File(['bytes'], 'watch.png', { type: 'image/png' });

for (const page of pages) {
  test(`${page} waits for upload before saving product`, async () => {
    let resolveUpload;
    const saved = [];
    const view = mount(page, { get: async () => ({ data: { images: ['/api/images/old'] } }), post: (url, body) => url === '/api/images' ? new Promise(resolve => { resolveUpload = resolve; }) : (saved.push(body), Promise.resolve({ status: 201 })), put: async (url, body) => { saved.push(body); return { status: 200 }; } });
    view.render();
    for (const effect of view.effects) await effect();
    await new Promise(resolve => setImmediate(resolve));
    const upload = inputOf(view).props.onChange({ target: { files: [file()], value: 'watch.png' } });
    assert.equal(inputOf(view).props.disabled, true);
    await formOf(view).props.onSubmit(event());
    assert.equal(saved.length, 0);
    resolveUpload({ data: { id: 'new', url: '/api/images/new' } });
    await upload;
    assert.equal(inputOf(view).props.disabled, false);
    await formOf(view).props.onSubmit(event());
    assert.equal(saved.length, 1);
    assert.ok(saved[0].images.includes('/api/images/new'));
  });

  test(`${page} shows upload errors and does not add failed image`, async () => {
    const view = mount(page, { get: async () => ({ data: { images: [] } }), post: async () => { throw { response: { data: { error: 'Image too large' } } }; } });
    view.render();
    for (const effect of view.effects) await effect();
    await new Promise(resolve => setImmediate(resolve));
    await inputOf(view).props.onChange({ target: { files: [file()], value: '' } });
    assert.ok(view.find(view.render(), node => node.props.role === 'alert')?.children.includes('Image too large'));
    assert.equal(imageSources(view).length, 0);
  });

  test(`${page} removes and reorders existing images`, async () => {
    const view = mount(page, { get: async () => ({ data: { images: ['/api/images/a', '/api/images/b', '/api/images/c'] } }) });
    view.render();
    for (const effect of view.effects) await effect();
    await new Promise(resolve => setImmediate(resolve));
    if (page === 'create') {
      // Existing image management applies to edit; create begins empty by design.
      assert.deepEqual(imageSources(view), []);
      return;
    }
    assert.deepEqual(imageSources(view), ['/api/images/a', '/api/images/b', '/api/images/c']);
    view.find(view.render(), node => node.props['aria-label'] === 'Move image 2 up').props.onClick(event());
    assert.deepEqual(imageSources(view), ['/api/images/b', '/api/images/a', '/api/images/c']);
    view.find(view.render(), node => node.props['aria-label'] === 'Remove image 2').props.onClick(event());
    assert.deepEqual(imageSources(view), ['/api/images/b', '/api/images/c']);
  });
}

test('edit blocks legacy external photos until replaced with local uploads', async () => {
  const saved = [];
  const view = mount('editProduct/[productId]', { get: async () => ({ data: { images: ['https://res.cloudinary.com/legacy.jpg'] } }), put: async (...args) => { saved.push(args); return { status: 200 }; } });
  view.render();
  for (const effect of view.effects) await effect();
  await new Promise(resolve => setImmediate(resolve));
  await formOf(view).props.onSubmit(event());
  assert.equal(saved.length, 0);
  assert.ok(view.find(view.render(), node => node.props.role === 'alert')?.children.some(text => String(text).includes('replace')));
});

test('edit persists image order and removals in product update', async () => {
  const saved = [];
  const view = mount('editProduct/[productId]', { get: async () => ({ data: { images: ['/api/images/a', '/api/images/b', '/api/images/c'] } }), put: async (url, body) => { saved.push(body); return { status: 200 }; } });
  view.render();
  for (const effect of view.effects) await effect();
  await new Promise(resolve => setImmediate(resolve));
  view.find(view.render(), node => node.props['aria-label'] === 'Move image 3 up').props.onClick(event());
  view.find(view.render(), node => node.props['aria-label'] === 'Remove image 2').props.onClick(event());
  await formOf(view).props.onSubmit(event());
  assert.deepEqual(Array.from(saved[0].images), ['/api/images/a', '/api/images/b']);
});

test('create rejects non-local upload response instead of saving remote URL', async () => {
  const view = mount('create', { post: async () => ({ data: { id: 'x', url: 'https://res.cloudinary.com/x' } }) });
  await inputOf(view).props.onChange({ target: { files: [file()], value: '' } });
  assert.deepEqual(imageSources(view), []);
  assert.ok(view.find(view.render(), node => node.props.role === 'alert'));
});

test('create starts without externally hosted default images and requires an image', async () => {
  const posts = [];
  const view = mount('create', { post: async (...args) => { posts.push(args); return { status: 201 }; } });
  await formOf(view).props.onSubmit(event());
  assert.deepEqual(imageSources(view), []);
  assert.equal(posts.length, 0);
  assert.ok(view.find(view.render(), node => node.props.role === 'alert')?.children.some(text => String(text).includes('image')));
});

for (const page of pages) {
  test(`${page} uploads selected file as FormData to own image endpoint`, async () => {
    const uploads = [];
    const view = mount(page, { post: async (...args) => { uploads.push(args); return { status: 201, data: { url: '/api/images/123', id: '123' } }; }, get: async () => ({ data: { images: [] } }) });
    view.render();
    for (const effect of view.effects) await effect();
    await new Promise(resolve => setImmediate(resolve));
    const tree = view.render();
    const input = view.find(tree, node => node.type === 'input' && node.props.type === 'file');
    assert.ok(input, 'selectable file input is required');
    const file = new File(['bytes'], 'watch.png', { type: 'image/png' });
    await input.props.onChange({ target: { files: [file], value: 'watch.png' } });
    assert.equal(uploads[0][0], '/api/images');
    assert.ok(uploads[0][1] instanceof FormData);
    assert.equal(uploads[0][1].get('file'), file);
    assert.ok(view.findAll(view.render(), node => node.type === 'Image' && node.props.src === '/api/images/123').length);
  });
}
