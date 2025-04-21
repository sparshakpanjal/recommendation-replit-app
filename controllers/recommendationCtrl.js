
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
      
      // Find similar products based on category, brand, and price range
      const priceRange = {
        min: product.price * 0.7, // 30% lower than product price
        max: product.price * 1.3  // 30% higher than product price
      };

      // Find similar products with weighted scoring
      const similarProducts = await Product.find({
        _id: { $nin: [...cartProductIds, productId] }, // Exclude items already in cart
        $or: [
          { category: product.category },
          { brand: product.brand },
          { 
            price: { 
              $gte: priceRange.min, 
              $lte: priceRange.max 
            } 
          }
        ]
      }).limit(10);
      
      // Apply weighted scoring to rank similar products
      const scoredProducts = similarProducts.map(p => {
        let score = 0;
        
        // Category match: highest weight
        if (p.category.toString() === product.category.toString()) {
          score += 10;
        }
        
        // Brand match: high weight
        if (p.brand === product.brand) {
          score += 7;
        }
        
        // Price similarity: medium weight
        const priceDifference = Math.abs(p.price - product.price) / product.price;
        if (priceDifference < 0.1) { // Within 10%
          score += 5;
        } else if (priceDifference < 0.2) { // Within 20%
          score += 3;
        }
        
        // Rating boost: small weight
        if (p.ratings > 4) {
          score += 2;
        }
        
        return { ...p._doc, score };
      })
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 5); // Get top 5 products
      
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
