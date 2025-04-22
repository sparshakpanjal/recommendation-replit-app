import { sql } from "../dbconnect.js";
import asyncHandler from "express-async-handler";

// Generate recommendation ID by combining user ID and product ID
const generateRecommendationId = (userId, productId) => {
  return userId.toString() + "_" + productId.toString();
};

// Get recommendations based on user's cart items
const getRecommendations = asyncHandler(async (req, res) => {
  try {
    // Get user's cart
    const cart = await sql`
      SELECT c.id, c.user_id
      FROM carts c
      WHERE c.user_id = ${req.user.id}
    `;

    if (!cart || cart.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Get cart items
    const cartItems = await sql`
      SELECT ci.*, p.id as product_id, p.title, p.category_id, p.brand
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ${cart[0].id}
    `;

    if (!cartItems || cartItems.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Get all product IDs from cart
    const cartProductIds = cartItems.map(item => item.product_id);

    // Get similar products based on categories and brands in cart
    const categories = [...new Set(cartItems.map(item => item.category_id))];
    const brands = [...new Set(cartItems.map(item => item.brand))];

    // Find similar products based on category and brand
    const similarProducts = await sql`
      SELECT p.*, c.title as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id != ALL(${cartProductIds})
      AND (
        p.category_id = ANY(${categories}) 
        OR p.brand = ANY(${brands})
      )
      LIMIT 10
    `;

    // Generate recommendation IDs
    const recommendationIds = cartItems.map(item => ({
      productId: item.product_id,
      recommendationId: generateRecommendationId(req.user.id, item.product_id)
    }));

    res.json({
      recommendations: similarProducts,
      recommendationIds
    });
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
});

export default {
  getRecommendations
};