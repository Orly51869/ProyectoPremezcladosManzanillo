"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController = __importStar(require("../controllers/productController"));
const productPriceController = __importStar(require("../controllers/productPriceController"));
const jwtCheck_1 = require("../middleware/jwtCheck");
// import { checkRole } from "../middleware/roleCheck"; // Este middleware se creará más adelante
const router = (0, express_1.Router)();
// Obtener todos los productos
router.get("/", jwtCheck_1.jwtCheck, productController.getProducts);
// Crear un nuevo producto (solo Administrador y Contable)
router.post("/", jwtCheck_1.jwtCheck, 
// checkRole(["Administrador", "Contable"]),
productController.createProduct);
// Actualizar un producto (solo Administrador y Contable)
router.put("/:id", jwtCheck_1.jwtCheck, 
// checkRole(["Administrador", "Contable"]),
productController.updateProduct);
// Eliminar un producto (solo Administrador y Contable)
router.delete("/:id", jwtCheck_1.jwtCheck, 
// checkRole(["Administrador", "Contable"]),
productController.deleteProduct);
// Price management
router.post("/:id/prices", jwtCheck_1.jwtCheck, productPriceController.createProductPrice);
router.get("/:id/prices", jwtCheck_1.jwtCheck, productPriceController.getProductPrice);
exports.default = router;
