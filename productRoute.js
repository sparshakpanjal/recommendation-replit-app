const express = require("express");
import { createProduct, 
       getaProduct,
       getAllProduct,
       updateProduct,
       deleteProduct
      } from "./controllers/productCtrl.js";
import { authMiddleware, isAdmin } from "./authMiddleware.js";
const router = express.Router();

router.post("/", authMiddleware, isAdmin,  createProduct);
router.get("/:id",  getaProduct);
router.put("/:id", authMiddleware, isAdmin,  updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/", getAllProduct);


export default router;

