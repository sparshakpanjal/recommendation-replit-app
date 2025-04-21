
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

// Generate recommendation ID by combining user ID and product ID
const generateRecommendationId = (userId, productId) => {
  return userId.toString() + "_" + productId.toString();
};

// Get recommendations based on user's cart items
const getRecommendations = asyncHandler(async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    
    if (!cart || cart.items.length === 0) {
      return res.json({ recommendations: [] });
    }
    
    // Get all product IDs from cart
    const cartProductIds = cart.items.map(item => item.product._id);
    
    // Generate recommendation IDs for each product in cart
    const recommendationPromises = cartProductIds.map(async (productId) => {
      // Create recommendation ID
      const recommendationId = generateRecommendationId(req.user._id, productId);
      
      // Get product details to find similar products
      const product = await Product.findById(productId);
      
      if (!product) return [];
      
      // Find similar products based on category and brand
      const similarProducts = await Product.find({
        _id: { $nin: [...cartProductIds, productId] }, // Exclude items already in cart
        $or: [
          { category: product.category },
          { brand: product.brand }
        ]
      }).limit(5);
      
      return {
        recommendationId,
        originalProduct: productId,
        similarProducts
      };
    });
    
    const recommendations = await Promise.all(recommendationPromises);
    
    // Flatten and deduplicate recommendations
    const flattenedRecommendations = recommendations
      .flatMap(rec => rec.similarProducts)
      .filter((product, index, self) => 
        index === self.findIndex(p => p._id.toString() === product._id.toString())
      )
      .slice(0, 10); // Limit to top 10 recommendations
    
    res.json({
      recommendations: flattenedRecommendations,
      recommendationIds: recommendations.map(rec => ({
        productId: rec.originalProduct,
        recommendationId: rec.recommendationId
      }))
    });
  } catch (error) {
    throw new Error(error);
  }
});

export default {
  getRecommendations
};
