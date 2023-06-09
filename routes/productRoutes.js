import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  brainTreePaymentController,
  brainTreeTokenController,
  changeOrderStatusController,
  createProductController,
  deleteProductController,
  getOrdersController,
  getProductController,
  getSingleProductController,
  relatedProductController,
  updateProductController,
} from "../controllers/productController.js";

const router = express.Router();

// create product
router.post("/create-product", requireSignIn, isAdmin, createProductController);

// Get ALL product
router.get("/get-product", getProductController);

// Get Single Product
router.get("/get-product/:slug", getSingleProductController);

// delete product
router.delete(
  "/delete-product/:_id",
  requireSignIn,
  isAdmin,
  deleteProductController
);

// Update Product
router.put(
  "/update-product/:_id",
  requireSignIn,
  isAdmin,
  updateProductController
);

router.get("/related-product/:c_id/:pid", relatedProductController);

router.get("/braintree/token", brainTreeTokenController);
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);

router.get("/orders", requireSignIn, getOrdersController);
router.post(
  "/orders/changestatus/:_id",
  requireSignIn,
  isAdmin,
  changeOrderStatusController
);

export default router;
