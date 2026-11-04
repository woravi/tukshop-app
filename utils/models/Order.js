import { createModel } from '../../lib/mysql-model.mjs';
import { lazyDatabase } from '../config/dbConnection.js';
const Order = createModel('orders', lazyDatabase);
export default Order;
