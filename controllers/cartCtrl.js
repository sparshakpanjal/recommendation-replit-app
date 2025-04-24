import path from 'path';
import fs from 'fs';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';

const CART_FILE = path.join('data', 'cart.csv');
const PRODUCTS_FILE = path.join('data', 'products.csv');

if (!fs.existsSync(CART_FILE)) {
  fs.writeFileSync(CART_FILE, 'userId,productId,quantity,price,color\n');
}

const readCSV = (file) => {
  const lines = fs.readFileSync(file, 'utf-8').trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, h, i) => {
      obj[h] = values[i];
      return obj;
    }, {});
  });
};

const writeCSV = (file, data, headers) => {
  const csv = [headers.join(','), ...data.map(row => headers.map(h => row[h] ?? '').join(','))].join('\n');
  fs.writeFileSync(file, csv);
};

const getUserCart = asyncHandler(async (req, res) => {
  const cart = readCSV(CART_FILE).filter(item => item.userId === req.user._id);
  res.json({
    userId: req.user._id,
    items: cart,
    totalPrice: cart.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity), 0)
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, color } = req.body;
  const userId = req.user._id;
  const carts = readCSV(CART_FILE);
  const products = readCSV(PRODUCTS_FILE);

  const product = products.find(p => p.id === productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (Number(product.quantity) < quantity) {
    res.status(400);
    throw new Error("Not enough stock available");
  }

  const existingIndex = carts.findIndex(item => item.userId === userId && item.productId === productId);
  if (existingIndex !== -1) {
    carts[existingIndex].quantity = (Number(carts[existingIndex].quantity) + Number(quantity)).toString();
  } else {
    carts.push({
      userId,
      productId,
      quantity: quantity.toString(),
      price: product.price,
      color: color || product.color || ''
    });
  }

  writeCSV(CART_FILE, carts, ['userId', 'productId', 'quantity', 'price', 'color']);
  res.status(200).json({ message: "Cart updated successfully" });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;
  const carts = readCSV(CART_FILE);
  const products = readCSV(PRODUCTS_FILE);

  const index = carts.findIndex(item => item.userId === userId && item.productId === productId);
  if (index === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  if (quantity <= 0) {
    carts.splice(index, 1);
  } else {
    const product = products.find(p => p.id === productId);
    if (!product || Number(product.quantity) < quantity) {
      res.status(400);
      throw new Error("Not enough stock available");
    }
    carts[index].quantity = quantity.toString();
  }

  writeCSV(CART_FILE, carts, ['userId', 'productId', 'quantity', 'price', 'color']);
  res.status(200).json({ message: "Cart item updated" });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;
  let carts = readCSV(CART_FILE);
  const originalLength = carts.length;

  carts = carts.filter(item => !(item.userId === userId && item.productId === productId));
  if (carts.length === originalLength) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  writeCSV(CART_FILE, carts, ['userId', 'productId', 'quantity', 'price', 'color']);
  res.status(200).json({ message: "Item removed from cart" });
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const carts = readCSV(CART_FILE).filter(item => item.userId !== userId);
  writeCSV(CART_FILE, carts, ['userId', 'productId', 'quantity', 'price', 'color']);
  res.status(200).json({ message: "Cart cleared" });
});

export default {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
