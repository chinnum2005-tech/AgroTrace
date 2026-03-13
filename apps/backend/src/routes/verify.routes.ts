import { Router } from 'express';
import { verifyProduct, generateQRCode } from '../controllers/verify.controller';

const router = Router();

// GET /api/verify/:qrCode - Verify product by QR code (public)
router.get('/:qrCode', verifyProduct);

// POST /api/verify/generate/:cropId - Generate QR code (requires auth in controller)
router.post('/generate/:cropId', generateQRCode);

export default router;
