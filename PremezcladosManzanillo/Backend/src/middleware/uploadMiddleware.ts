import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the storage destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/payments');
    // Ensure the upload directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: fieldname-timestamp-originalename.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Filter to allow only specific file types (PDF, images)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF o de imagen.') as any, false);
  }
};

// Configure multer for multiple fields
// Assuming these are the field names in the form
export const uploadPaymentDocuments = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).fields([
  { name: 'proFormaInvoice', maxCount: 1 },
  { name: 'fiscalInvoice', maxCount: 1 },
  { name: 'deliveryOrder', maxCount: 1 },
]);

// Configure multer for a single receipt file
export const uploadReceipt = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).single('receipt');
