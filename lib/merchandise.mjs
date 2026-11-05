import { validateCategory } from './product-categories.mjs';
export function problem(message, status=400) { return Object.assign(new Error(message), {status}); }
export function positiveId(value) {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) throw problem('Invalid ID');
  return Number(value);
}
export async function transaction(db, work) {
  const conn=await db.getConnection();
  try { await conn.beginTransaction(); const result=await work(conn); await conn.commit(); return result; }
  catch(error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}
export function createManagement(db) {
  const listCategories=async (all=false)=> {
    const [rows]=await db.execute(`SELECT * FROM product_categories${all?'':' WHERE active=1'} ORDER BY sort_order,id`);
    return rows;
  };
  const resolveCategory=async(token, target=db)=>{
    const numeric=/^[1-9]\d*$/.test(String(token));
    const [rows]=await target.execute(`SELECT * FROM product_categories WHERE ${numeric?'id':'name'}=? AND active=1`,[token]);
    if(rows[0]) return rows[0];
    if(!numeric){const [aliases]=await target.execute('SELECT c.* FROM product_category_aliases a JOIN product_categories c ON c.id=a.category_id WHERE a.name=? AND c.active=1',[token]); if(aliases[0])return aliases[0];}
    throw problem('Unknown category',404);
  };
  const saveCategory=(id, input)=>transaction(db,async conn=>{
    validateCategory(input.name);
    if(input.name===null)throw problem('Invalid category name');
    if(typeof input.active!=='boolean' || !Number.isInteger(input.sort_order) || input.sort_order<0 || input.sort_order>2147483647)throw problem('Invalid category fields');
    const parent=input.parent_id==null?null:positiveId(input.parent_id);
    if(id!=null)id=positiveId(id);
    // Serialize tree changes, including concurrent cross-parent edits.
    const [rows]=await conn.execute('SELECT * FROM product_categories ORDER BY id FOR UPDATE');
    const old=id==null?null:rows.find(r=>Number(r.id)===id);
    if(id!=null&&!old)throw problem('Category not found',404);
    if(old&&(!Number.isSafeInteger(input.version)||old.version!==input.version))throw problem('Category changed; reload before saving',409);
    const seen=new Set(id==null?[]:[id]); let cursor=parent;
    while(cursor!=null){if(seen.has(cursor))throw problem('Category parent cycle'); seen.add(cursor);const node=rows.find(r=>Number(r.id)===cursor);if(!node||!node.active)throw problem('Invalid parent category');cursor=node.parent_id==null?null:Number(node.parent_id);}
    if(old&&!input.active){
      const [used]=await conn.execute('SELECT COUNT(*) total FROM products WHERE category_id=? OR (category_id IS NULL AND category=?)',[id,old.name]);
      if(Number(used[0].total)>0||rows.some(r=>Number(r.parent_id)===id&&r.active))throw problem('Cannot deactivate nonempty category',409);
    }
    if(old){
      if(old.name!==input.name){
        const [aliases]=await conn.execute('SELECT category_id FROM product_category_aliases WHERE name=? FOR UPDATE',[input.name]);
        if(aliases.some(a=>Number(a.category_id)!==id))throw problem('Category name already used',409);
        await conn.execute('INSERT IGNORE INTO product_category_aliases (name,category_id) VALUES (?,?)',[old.name,id]);
      }
      await conn.execute('UPDATE product_categories SET name=?,parent_id=?,sort_order=?,active=?,version=version+1 WHERE id=? AND version=?',[input.name,parent,input.sort_order,input.active,id,input.version]);
      await conn.execute('UPDATE products SET category=?,category_id=? WHERE category_id=? OR (category_id IS NULL AND category=?)',[input.name,id,id,old.name]);
      return {...old,...input,id,parent_id:parent,version:old.version+1};
    }
    const [aliases]=await conn.execute('SELECT category_id FROM product_category_aliases WHERE name=? FOR UPDATE',[input.name]);
    if(aliases.length)throw problem('Category name already used',409);
    const [result]=await conn.execute('INSERT INTO product_categories (name,parent_id,sort_order,active) VALUES (?,?,?,?)',[input.name,parent,input.sort_order,input.active]);
    return {id:result.insertId,name:input.name,parent_id:parent,sort_order:input.sort_order,active:input.active,version:1};
  });
  const reorderCategories=async(order)=>{
    if(!Array.isArray(order)||!order.length||order.length>10000)throw problem('Invalid category order');
    const ids=order.map(row=>positiveId(row?.id));
    if(new Set(ids).size!==ids.length||order.some(row=>!Number.isSafeInteger(row.version)||row.version<1))throw problem('Invalid category order');
    return transaction(db,async conn=>{
      const [rows]=await conn.execute('SELECT * FROM product_categories ORDER BY id FOR UPDATE');
      if(rows.length!==order.length||order.some((item,i)=>!rows.some(row=>Number(row.id)===ids[i]&&row.version===item.version)))throw problem('Categories changed; reload before reordering',409);
      for(const [position,item] of order.entries()){
        const [result]=await conn.execute('UPDATE product_categories SET sort_order=?,version=version+1 WHERE id=? AND version=?',[position,ids[position],item.version]);
        if(!result.affectedRows)throw problem('Categories changed; reload before reordering',409);
      }
      return {success:true};
    });
  };
  const listVariants=async(productId,all=false)=>{
    const [rows]=await db.execute(`SELECT * FROM product_variants WHERE product_id=?${all?'':' AND active=1'} ORDER BY id`,[positiveId(productId)]);
    return rows.map(row=>({...row,active:Boolean(row.active),price:Number(row.price)}));
  };
  const saveVariant=async(productId,id,input,actorId)=>{
    productId=positiveId(productId); if(id!=null)id=positiveId(id);
    for(const key of ['sku','color','size'])if(typeof input[key]!=='string'||!input[key].trim()||input[key].length>(key==='sku'?100:80))throw problem(`Invalid ${key}`);
    if(typeof input.price!=='number'||!Number.isFinite(input.price)||input.price<0||input.price>9999999999.99||Math.abs(input.price*100-Math.round(input.price*100))>0.0001)throw problem('Invalid price');
    if(!Number.isInteger(input.stock)||input.stock<0||input.stock>4294967295)throw problem('Invalid stock');
    if(typeof input.active!=='boolean')throw problem('Invalid active');
    return transaction(db,async conn=>{
      // All inventory writers acquire the product lock first.
      const [products]=await conn.execute('SELECT id FROM products WHERE id=? FOR UPDATE',[productId]);
      if(!products.length)throw problem('Product not found',404);
      const [rows]=await conn.execute('SELECT * FROM product_variants WHERE product_id=? ORDER BY id FOR UPDATE',[productId]);
      const old=id==null?null:rows.find(r=>Number(r.id)===id);
      if(id!=null&&!old)throw problem('Variant not found',404);
      if(input.active&&rows.some(v=>Number(v.id)!==id&&v.active&&v.color===input.color.trim()&&v.size===input.size.trim()))throw problem('Color-size combination already exists',409);
      const args=[input.sku.trim(),input.color.trim(),input.size.trim(),input.price,input.stock,input.active];
      if(old){
        if(!Number.isSafeInteger(input.version)||input.version!==old.version)throw problem('Variant changed; reload before saving',409);
        const [result]=await conn.execute('UPDATE product_variants SET sku=?,color=?,size=?,price=?,stock=?,active=?,version=version+1 WHERE id=? AND product_id=? AND version=?',[...args,id,productId,input.version]);
        if(!result.affectedRows)throw problem('Variant changed; reload before saving',409);
      }else{const [result]=await conn.execute('INSERT INTO product_variants (sku,color,size,price,stock,active,product_id) VALUES (?,?,?,?,?,?,?)',[...args,productId]);id=result.insertId;}
      await conn.execute('UPDATE products SET stock=(SELECT COALESCE(SUM(stock),0) FROM product_variants WHERE product_id=? AND active=1) WHERE id=?',[productId,productId]);
      await conn.execute('INSERT INTO inventory_changes (product_id,variant_id,actor_id,old_stock,new_stock,reason) VALUES (?,?,?,?,?,?)',[productId,id,positiveId(actorId),old?.stock??0,input.stock,input.active?'variant save':'variant deactivate']);
      return {...input,id,product_id:productId,version:old?old.version+1:1};
    });
  };
  return {listCategories,resolveCategory,saveCategory,reorderCategories,listVariants,saveVariant};
}
