import { Router } from "express";
import * as productController from "../controllers/productController";
import { jwtCheck } from "../middleware/jwtCheck";
// import { checkRole } from "../middleware/roleCheck"; // This middleware will be created later

const router = Router();

// Get all products
router.get("/", jwtCheck, productController.getProducts);

// Create a new product (Admin and Contable only)
router.post(
  "/",
  jwtCheck,
  // checkRole(["Administrador", "Contable"]),
  productController.createProduct
);

// Update a product (Admin and Contable only)
router.put(
  "/:id",
  jwtCheck,
  // checkRole(["Administrador", "Contable"]),
  productController.updateProduct
);

// Delete a product (Admin and Contable only)
router.delete(
  "/:id",
  jwtCheck,
  // checkRole(["Administrador", "Contable"]),
  productController.deleteProduct
);

export default router;