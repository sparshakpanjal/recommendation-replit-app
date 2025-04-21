const express = require("express");
const { createProduct, 
       getaProduct,
       gatAllProduct,
       filterProduct,
      } = require("../controller/productCtrl");
const { isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin,  createProduct);
router.get("/:id",  getaProduct);
router.put("/:id", authMiddleware, isAdmin,  updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/", getAllProduct);


module.exports = router;

