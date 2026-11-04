import { createModel } from '../../lib/mysql-model.mjs';
import { lazyDatabase } from '../config/dbConnection.js';
const Review = createModel('reviews', lazyDatabase);
export default Review;
