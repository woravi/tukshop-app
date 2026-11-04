import { createModel } from '../../lib/mysql-model.mjs';
import { lazyDatabase } from '../config/dbConnection.js';
const User = createModel('users', lazyDatabase);
export default User;
