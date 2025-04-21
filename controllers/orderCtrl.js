
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import asyncHandler from "express-async-handler";

// Create new order
const createOrder = asyncHandler(async (req, res) => {
    try {
        const { 
            orderItems, 
            shippingAddress, 
            paymentMethod, 
            itemsPrice, 
            taxPrice, 
            shippingPrice, 
            totalPrice 
        } = req.body;
        
        if (orderItems && orderItems.length === 0) {
            res.status(400);
            throw new Error("No order items");
        }
        
        const order = await Order.create({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice
        });
        
        // Clear user's cart after successful order
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { items: [], totalPrice: 0 }
        );
        
        res.status(201).json(order);
    } catch (error) {
        throw new Error(error);
    }
});

// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        
        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }
        
        // Check if the order belongs to the logged-in user or user is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error("Not authorized to view this order");
        }
        
        res.json(order);
    } catch (error) {
        throw new Error(error);
    }
});

// Update order to paid
const updateOrderToPaid = asyncHandler(async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }
        
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address
        };
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        throw new Error(error);
    }
});

// Update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }
        
        order.status = status;
        
        if (status === "Delivered") {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        throw new Error(error);
    }
});

// Get logged in user orders
const getMyOrders = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all orders (admin only)
const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json(orders);
    } catch (error) {
        throw new Error(error);
    }
});

export default {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    getMyOrders,
    getAllOrders
};
