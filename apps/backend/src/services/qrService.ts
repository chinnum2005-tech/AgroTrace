import QRCode from 'qrcode';

/**
 * Generate QR Code as Data URL
 * @param data - The data to encode in the QR code (e.g., product ID, verification URL)
 * @returns Promise<string> - Base64 encoded PNG image
 */
export async function generateQRCode(
  data: string, 
  options?: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<string> {
  try {
    const qr = await QRCode.toDataURL(data, {
      width: options?.width || 400,
      margin: options?.margin || 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'H', // High error correction for better scanning
    });
    
    return qr;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR Code and save to file (optional)
 * @param filePath - Path to save the QR code image
 * @param data - The data to encode
 */
export async function generateQRCodeToFile(
  filePath: string, 
  data: string
): Promise<void> {
  try {
    await QRCode.toFile(filePath, data, {
      type: 'png',
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error saving QR code to file:', err);
    throw new Error('Failed to save QR code');
  }
}
