import express from 'express'
import multer from 'multer';
import { 
    importProducts,
    updateMultipleProducts,
    getProductHistory,
    exportProducts,
    getAllProducts,
    getCategories,
    updateProduct,
    deleteProduct,
} from '../controllers/product.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/import', upload.single('csvFile'), importProducts);
router.put('/update-multiple', updateMultipleProducts);
router.get('/:id/history', getProductHistory);
router.get('/export', exportProducts);
router.get('/search', getAllProducts);
router.get('/categories', getCategories);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;