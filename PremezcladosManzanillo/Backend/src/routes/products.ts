import { Router } from "express";
import * as productController from "../controllers/productController";
import * as productPriceController from "../controllers/productPriceController";
import { jwtCheck } from "../middleware/jwtCheck";
import { checkRole } from "../middleware/checkRole";

const router = Router();

// Obtener todos los productos
router.get("/", jwtCheck, productController.getProducts);

// Crear un nuevo producto (solo Administrador y Contable)
router.post(
  "/",
  jwtCheck,
  checkRole(["Administrador", "Contable"]),
  productController.createProduct
);

// Actualizar un producto (solo Administrador y Contable)
router.put(
  "/:id",
  jwtCheck,
  checkRole(["Administrador", "Contable"]),
  productController.updateProduct
);

// Eliminar un producto (solo Administrador y Contable)
router.delete(
  "/:id",
  jwtCheck,
  checkRole(["Administrador", "Contable"]),
  productController.deleteProduct
);

// Price management
router.post(
  "/:id/prices",
  jwtCheck,
  productPriceController.createProductPrice
);

router.get(
  "/:id/prices",
  jwtCheck,
  productPriceController.getProductPrice
);

export default router;