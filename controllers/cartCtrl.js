
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import asyncHandler from "express-async-handler";

// Get user cart
const getUserCart = asyncHandler(async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        
        if (!cart) {
            // Create empty cart if no cart exists
            const newCart = await Cart.create({
                user: req.user._id,
                items: [],
                totalPrice: 0
            });
            return res.json(newCart);
        }
        
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

// Add to cart
const addToCart = asyncHandler(async (req, res) => {
    try {
        const { productId, quantity, color } = req.body;
        
        // Verify product exists and is in stock
        const product = await Product.findById(productId);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        
        if (product.quantity < quantity) {
            res.status(400);
            throw new Error("Not enough stock available");
        }
        
        // Find user's cart or create new one
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [],
                totalPrice: 0
            });
        }
        
        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );
        
        if (existingItemIndex > -1) {
            // Update quantity if product already in cart
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                color: color || product.color
            });
        }
        
        // Recalculate total price
        cart.totalPrice = cart.items.reduce(
            (total, item) => total + (item.price * item.quantity), 0
        );
        
        await cart.save();
        
        // Return populated cart
        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.status(200).json(populatedCart);
    } catch (error) {
        throw new Error(error);
    }
});

// Update cart item
const updateCartItem = asyncHandler(async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        if (!productId || !quantity) {
            res.status(400);
            throw new Error("Product ID and quantity are required");
        }
        
        // Find user's cart
        const cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            res.status(404);
            throw new Error("Cart not found");
        }
        
        // Find the item in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );
        
        if (itemIndex === -1) {
            res.status(404);
            throw new Error("Item not found in cart");
        }
        
        // If quantity is 0, remove item
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
            
            // Check if product has enough stock
            const product = await Product.findById(productId);
            if (!product || product.quantity < quantity) {
                res.status(400);
                throw new Error("Not enough stock available");
            }
        }
        
        // Recalculate total price
        cart.totalPrice = cart.items.reduce(
            (total, item) => total + (item.price * item.quantity), 0
        );
        
        await cart.save();
        
        // Return populated cart
        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.status(200).json(populatedCart);
    } catch (error) {
        throw new Error(error);
    }
});

// Remove from cart
const removeFromCart = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Find user's cart
        const cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            res.status(404);
            throw new Error("Cart not found");
        }
        
        // Remove item from cart
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );
        
        // Recalculate total price
        cart.totalPrice = cart.items.reduce(
            (total, item) => total + (item.price * item.quantity), 0
        );
        
        await cart.save();
        
        // Return populated cart
        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.status(200).json(populatedCart);
    } catch (error) {
        throw new Error(error);
    }
});

// Clear cart
const clearCart = asyncHandler(async (req, res) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { user: req.user._id },
            { items: [], totalPrice: 0 },
            { new: true }
        );
        
        if (!cart) {
            res.status(404);
            throw new Error("Cart not found");
        }
        
        res.status(200).json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

export default {
    getUserCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
