// A deliberately small SQL-backed compatibility surface for the existing API routes.
// All identifiers are server-side allowlisted; all values use mysql2 bound parameters.
import { validateCategory } from './product-categories.mjs';
const fields = {
  products: ['stock','name','description','price','originalPrice','brand','category','material','bracelet','condition','user','averageRating','numReviews','featured','movement','thickness','glass','luminova','casematerial','crown','bandsize','lugs','water'],
  users: ['name','email','password','admin','profileImage','notificationPreferences'],
  orders: ['name','email','city','postalCode','streetAddress','country','paid','status','total','user'],
  reviews: ['user','product','rating','comment'],
};
const defaults = { users: {admin:0, notificationPreferences:{orderUpdates:true,promotions:false}}, products: {stock:0,featured:0,averageRating:0,numReviews:0}, orders:{paid:0,status:'pending'} };
const booleanFields = new Set(['admin','featured','paid']);
const jsonFields = new Set(['notificationPreferences']);
const column = (name, table) => {
  if (name === '_id') return 'id';
  if (name === 'createdAt' || name === 'updatedAt' || fields[table].includes(name)) return `\`${name}\``;
  throw new Error(`Unknown ${table} field: ${name}`);
};
const value = v => v instanceof RegExp ? v.source : v;
const like = v => `%${String(value(v)).replace(/\\s\*/g, '').replace(/\\/g,'')}%`;
function where(table, criteria = {}) {
  if (criteria.$or) {
    const pieces = criteria.$or.map(c => where(table,c));
    return [`(${pieces.map(p => p[0]).join(' OR ')})`, pieces.flatMap(p => p[1])];
  }
  const parts = [], params = [];
  for (const [key, v] of Object.entries(criteria)) {
    if (key === 'cartProducts.product') {
      if (table !== 'orders') throw new Error('Invalid order filter');
      parts.push('EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id=orders.id AND oi.product_id=?)'); params.push(v); continue;
    }
    const col = column(key, table);
    if (v && typeof v === 'object' && !(v instanceof RegExp) && '$in' in v) {
      if (!Array.isArray(v.$in) || !v.$in.length) {parts.push('1=0'); continue;}
      parts.push(`${col} IN (${v.$in.map(() => '?').join(',')})`); params.push(...v.$in); continue;
    }
    if (v instanceof RegExp || (v && typeof v === 'object' && '$regex' in v)) {
      parts.push(`${col} LIKE ?`); params.push(like(v instanceof RegExp ? v : v.$regex)); continue;
    }
    if (v === null) parts.push(`${col} IS NULL`);
    else { parts.push(`${col} = ?`); params.push(v); }
  }
  return [parts.length ? parts.join(' AND ') : '1=1', params];
}
export const localImageIds = images => {
  if (!Array.isArray(images) || images.length > 12) throw new Error('Invalid product images');
  return images.map(url => {
    if (typeof url !== 'string' || !/^\/api\/images\/[1-9]\d*$/.test(url)) throw new Error('Invalid product image URL');
    const id = Number(url.slice('/api/images/'.length));
    if (!Number.isSafeInteger(id)) throw new Error('Invalid product image ID');
    return id;
  });
};
export function validateImageUrls(images) { localImageIds(images); return images; }
export function validateStock(stock) {
  if (!Number.isInteger(stock) || stock < 0 || stock > 4294967295) throw new Error('Invalid stock');
  return stock;
}
function clean(row, table) {
  const item = {...row, _id: String(row.id)};
  delete item.id;
  for (const key of booleanFields) if (key in item) item[key] = Boolean(item[key]);
  for (const key of jsonFields) if (key in item && typeof item[key] === 'string') item[key] = JSON.parse(item[key]);
  if (table === 'users') { delete item.password; item.wishlist = []; }
  return item;
}
export function createModel(table, db) {
  if (!fields[table]) throw new Error('Unknown table');
  async function enrich(rows, populate = false, password = false) {
    return Promise.all(rows.map(async row => {
      const item = clean(row, table);
      if (password && table === 'users') item.password = row.password;
      if (table === 'products') {
        const [images] = await db.execute('SELECT id FROM product_images WHERE product_id=? ORDER BY position,id', [row.id]);
        item.images = images.map(im => `/api/images/${im.id}`);
      }
      if (table === 'users') {
        const [wish] = await db.execute('SELECT product_id FROM wishlists WHERE user_id=? ORDER BY createdAt', [row.id]);
        item.wishlist = wish.map(w => String(w.product_id));
      }
      if (table === 'orders') {
        const [lines] = await db.execute('SELECT product_id,quantity,price FROM order_items WHERE order_id=? ORDER BY id', [row.id]);
        item.cartProducts = await Promise.all(lines.map(async line => ({product: populate ? await createModel('products',db).findById(line.product_id) : String(line.product_id), quantity:line.quantity,price:Number(line.price)})));
      }
      if (table === 'reviews' && populate) {
        const [users] = await db.execute('SELECT id,name,profileImage FROM users WHERE id=?', [row.user]);
        item.user = users.length ? {_id:String(users[0].id), name:users[0].name, profileImage:users[0].profileImage} : null;
      }
      if (table === 'products' && populate && row.user) {
        const [users] = await db.execute('SELECT id,name,profileImage FROM users WHERE id=?', [row.user]);
        item.user = users.length ? {_id:String(users[0].id), name:users[0].name, profileImage:users[0].profileImage} : null;
      }
      item.save = async () => {
        if (table !== 'products') return update(row.id, item);
        const changes = {...item};
        if (changes.stock === row.stock) delete changes.stock;
        return update(row.id, changes, 'stock' in changes ? {expectedStock: row.stock} : {});
      };
      return item;
    }));
  }
  const query = (criteria={}, one=false) => {
    const state = {sort:null,skip:0,limit:null,populate:false,password:false};
    const q = {
      sort(s) { state.sort = s; return q; },
      skip(n) { state.skip = Math.max(0,Number(n)||0); return q; },
      limit(n) {state.limit = Math.max(0,Number(n)||0); return q;},
      populate() {state.populate = true; return q;},
      select(s) {state.password = s === '+password'; return q;},
      async exec() {
        const [filter, args] = where(table,criteria);
        let sql = `SELECT * FROM ${table} WHERE ${filter}`;
        if (state.sort) { const [key,dir] = Object.entries(state.sort)[0]; sql += ` ORDER BY ${column(key,table)} ${dir === -1 ? 'DESC' : 'ASC'}`; }
        if (one) sql += ' LIMIT 1';
        else if (state.limit !== null) {sql += ' LIMIT ? OFFSET ?'; args.push(state.limit,state.skip);}
        const [rows] = await db.execute(sql,args);
        const result = await enrich(rows,state.populate,state.password);
        return one ? result[0] || null : result;
      },
      then(resolve,reject) {return q.exec().then(resolve,reject);},
    };
    return q;
  };
  async function update(id, changes, options = {}) {
    if (table === 'products' && 'category' in changes && changes.category !== undefined) validateCategory(changes.category);
    if (options.expectedStock !== undefined) validateStock(options.expectedStock);
    if (table === 'products' && 'stock' in changes) validateStock(changes.stock);
    const patch = Object.fromEntries(Object.entries(changes).filter(([k,v]) => fields[table].includes(k) && v !== undefined));
    if ('images' in changes && table === 'products') validateImageUrls(changes.images);
    const relational = (table === 'products' && 'images' in changes) || (table === 'users' && 'wishlist' in changes);
    const connection = relational && db.getConnection ? await db.getConnection() : null;
    const target = connection || db;
    try {
    if (connection) await connection.beginTransaction();
    const ids = table === 'products' && 'images' in changes ? localImageIds(changes.images) : [];
    if (ids.length) {
      const [owned] = await target.execute(`SELECT id,product_id FROM product_images WHERE id IN (${ids.map(()=>'?').join(',')}) FOR UPDATE`, ids);
      if (owned.length !== ids.length || owned.some(i => i.product_id && String(i.product_id) !== String(id))) throw new Error('Invalid product image ownership');
    }
    if (Object.keys(patch).length) {
      const keys=Object.keys(patch);
      const compareStock = table === 'products' && options.expectedStock !== undefined;
      const [result] = await target.execute(`UPDATE ${table} SET ${keys.map(k=>`${column(k,table)}=?`).join(',')} WHERE id=?${compareStock ? ' AND `stock`=?' : ''}`, [...keys.map(k=> jsonFields.has(k) ? JSON.stringify(patch[k]) : patch[k]),id,...(compareStock ? [options.expectedStock] : [])]);
      if (compareStock && result.affectedRows === 0) throw new Error('Stock changed; reload the product before saving');
    }
    if (table === 'products' && 'images' in changes) {
      await target.execute('DELETE FROM product_images WHERE product_id=? AND id NOT IN ('+(ids.length ? ids.map(()=>'?').join(',') : 'NULL')+')',[id,...ids]);
      for (const [position,im] of ids.entries()) await target.execute('UPDATE product_images SET product_id=?,position=? WHERE id=?',[id,position,im]);
    }
    if (table === 'users' && 'wishlist' in changes) {
      await target.execute('DELETE FROM wishlists WHERE user_id=?',[id]);
      for (const product of changes.wishlist) await target.execute('INSERT IGNORE INTO wishlists (user_id,product_id) VALUES (?,?)',[id,product]);
    }
    if (connection) await connection.commit();
    } catch (error) { if (connection) await connection.rollback(); throw error; }
    finally { if (connection) connection.release(); }
    return query({_id:id},true).exec();
  }
  return class Model {
    constructor(data={}) {Object.assign(this,defaults[table],data);}
    static find(c={}) {return query(c);}
    static findOne(c={}) {return query(c,true);}
    static findById(id) {return query({_id:id},true);}
    static async countDocuments(c={}) {const [filter,args]=where(table,c); const [rows]=await db.execute(`SELECT COUNT(*) total FROM ${table} WHERE ${filter}`,args); return Number(rows[0].total);}
    static async create(data) {return new this(data).save();}
    static async findByIdAndUpdate(id,data,options) {const old=await this.findById(id); return old ? update(id,data,options) : null;}
    static async findOneAndUpdate(c,data) {const old=await this.findOne(c); return old ? update(old._id,data) : null;}
    static async updateMany(c,data) {const found=await this.find(c); for (const row of found) await update(row._id,data); return {modifiedCount:found.length};}
    static async findByIdAndDelete(id) {const old=await this.findById(id); if(old) await db.execute(`DELETE FROM ${table} WHERE id=?`,[id]); return old;}
    static async deleteOne(c) {const old=await this.findOne(c); if(old) await db.execute(`DELETE FROM ${table} WHERE id=?`,[old._id]); return {deletedCount:old?1:0};}
    async save() {
      if (this._id) return update(this._id,this);
      if (table === 'products' && this.category !== undefined) validateCategory(this.category);
      if (table === 'products') validateStock(this.stock);
      if (table === 'products' && 'images' in this) validateImageUrls(this.images);
      const keys=fields[table].filter(k=>this[k]!==undefined);
      const relational = table === 'products' && this.images?.length || table === 'orders' && this.cartProducts?.length;
      const connection = relational && db.getConnection ? await db.getConnection() : null;
      const target = connection || db;
      let id;
      try {
        if (connection) await connection.beginTransaction();
        const [res]=await target.execute(`INSERT INTO ${table} (${keys.map(k=>column(k,table)).join(',')}) VALUES (${keys.map(()=>'?').join(',')})`, keys.map(k=>jsonFields.has(k)?JSON.stringify(this[k]):this[k]));
        id=res.insertId;
        if (table === 'products' && this.images?.length) {
          const ids=localImageIds(this.images);
          const [owned]=await target.execute(`SELECT id,product_id FROM product_images WHERE id IN (${ids.map(()=>'?').join(',')}) FOR UPDATE`,ids);
          if (owned.length !== ids.length || owned.some(im=>im.product_id)) throw new Error('Invalid product image ownership');
          for (const [position,im] of ids.entries()) await target.execute('UPDATE product_images SET product_id=?,position=? WHERE id=?',[id,position,im]);
        }
        if (table === 'orders' && this.cartProducts) for(const line of this.cartProducts) await target.execute('INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,?,?,?)',[id,line.product,line.quantity,line.price]);
        if (connection) await connection.commit();
      } catch(error) {if(connection) await connection.rollback(); throw error;}
      finally {if(connection) connection.release();}
      return query({_id:id},true).exec();
    }
  };
}
