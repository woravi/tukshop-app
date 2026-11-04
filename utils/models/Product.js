import { createModel } from '../../lib/mysql-model.mjs';
import { lazyDatabase } from '../config/dbConnection.js';
export const Product = createModel('products', lazyDatabase);
