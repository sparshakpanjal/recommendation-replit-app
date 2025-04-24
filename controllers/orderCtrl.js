import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const ordersFilePath = path.join('data', 'orders.csv');

// Helper to read orders from CSV
const readOrders = () => {
  const data = fs.existsSync(ordersFilePath) ? fs.readFileSync(ordersFilePath, 'utf-8') : '';
  return data ? parse(data, { columns: true, skip_empty_lines: true }) : [];
};

// Helper to write orders to CSV
const writeOrders = (orders) => {
  const csv = stringify(orders, { header: true });
  fs.writeFileSync(ordersFilePath, csv);
};

const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  const orders = readOrders();

  const newOrder = {
    id: uuidv4(),
    userId: req.user._id,
    orderItems: JSON.stringify(orderItems),
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: false,
    paidAt: '',
    isDelivered: false,
    deliveredAt: '',
    status: 'Pending',
    paymentResult: ''
  };

  orders.push(newOrder);
  writeOrders(orders);

  res.status(201).json(newOrder);
});

const getOrderById = asyncHandler(async (req, res) => {
  const orders = readOrders();
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.userId !== req.user._id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error("Not authorized to view this order");
  }

  res.json(order);
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const orders = readOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) throw new Error("Order not found");

  orders[index].isPaid = true;
  orders[index].paidAt = new Date().toISOString();
  orders[index].paymentResult = JSON.stringify(req.body);

  writeOrders(orders);
  res.json(orders[index]);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const orders = readOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) throw new Error("Order not found");

  orders[index].status = req.body.status;
  if (req.body.status === "Delivered") {
    orders[index].isDelivered = true;
    orders[index].deliveredAt = new Date().toISOString();
  }

  writeOrders(orders);
  res.json(orders[index]);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = readOrders().filter(o => o.userId === req.user._id);
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

export default {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getAllOrders
};
