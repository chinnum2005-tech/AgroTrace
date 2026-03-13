import { Router } from 'express';
import { getAllProducts, createProduct, getMyProducts } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route - get all products for marketplace
router.get('/', getAllProducts);

// Protected routes
router.use(authenticate);

// Get farmer's products
router.get('/my-products', getMyProducts);

// Create new product
router.post('/', createProduct);

export default router;
