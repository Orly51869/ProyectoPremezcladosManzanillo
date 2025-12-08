"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadInvoiceDocuments = exports.uploadReceipt = exports.uploadPaymentDocuments = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define the storage destination and filename
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../uploads/payments');
        // Ensure the upload directory exists
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename: fieldname-timestamp-originalename.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    },
});
// Filter to allow only specific file types (PDF, images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Solo se permiten archivos PDF o de imagen.'), false);
    }
};
// Configure multer for multiple fields
// Assuming these are the field names in the form
exports.uploadPaymentDocuments = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).fields([
    { name: 'proFormaInvoice', maxCount: 1 },
    { name: 'fiscalInvoice', maxCount: 1 },
    { name: 'deliveryOrder', maxCount: 1 },
]);
// Configure multer for a single receipt file
exports.uploadReceipt = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).single('receipt');
// Configure multer for invoice documents (fiscal invoice and delivery order)
exports.uploadInvoiceDocuments = (0, multer_1.default)({
    storage: storage, // Use the same storage for now
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).fields([
    { name: 'fiscalInvoice', maxCount: 1 },
    { name: 'deliveryOrder', maxCount: 1 },
]);
