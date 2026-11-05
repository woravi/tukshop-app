import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {transformSync}=require('next/dist/build/swc');
export function loadFoodComponent(file,overrides={}) {
  const filename=path.resolve(file);
  const source=readFileSync(filename,'utf8');
  const result=transformSync(source,{filename,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}});
  const module={exports:{}};
  const localRequire=(name)=>{
    if (name in overrides) return overrides[name];
    if (name.endsWith('.css')) return {__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
    const target=name.startsWith('@/')?path.resolve(name.slice(2)):name.startsWith('.')?path.resolve(path.dirname(filename),name):name;
    if (target.endsWith('.jsx') && existsSync(target)) return loadFoodComponent(target,overrides);
    return require(target);
  };
  new Function('require','module','exports',result.code)(localRequire,module,module.exports);
  return module.exports;
}
