import { Router, Request, Response } from 'express';
import { generateQRCode } from '../services/qrService';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/qr/generate
 * Generate QR code for a product/crop
 * 
 * Request body:
 * - productId: string (ID of the product) OR cropId: string
 * - format: 'url' | 'text' (optional, default: 'url')
 */
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const { productId, cropId, format = 'url' } = req.body;
    
    // Use productId if provided, otherwise fallback to cropId
    const id = productId || cropId;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Product ID or Crop ID is required',
      });
    }

    // Generate verification URL or plain text
    const qrData = format === 'url' 
      ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${id}`
      : `AGRITRACE-${id}`;

    // Generate QR code
    const qrCodeImage = await generateQRCode(qrData, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
    });

    res.json({
      success: true,
      data: {
        productId: id,
        qrCode: qrCodeImage,
        qrData,
        format,
      },
      message: 'QR code generated successfully',
    });

  } catch (error: any) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code',
      message: error.message,
    });
  }
});

/**
 * GET /api/qr/:id
 * Get QR code for a specific product or crop
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const qrData = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${id}`;
    const qrCodeImage = await generateQRCode(qrData, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
    });

    res.json({
      success: true,
      data: {
        id,
        qrCode: qrCodeImage,
        qrData,
      },
      message: 'QR code retrieved successfully',
    });

  } catch (error: any) {
    console.error('Error retrieving QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve QR code',
      message: error.message,
    });
  }
});

export default router;
