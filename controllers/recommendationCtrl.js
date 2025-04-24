import fs from 'fs';
import path from 'path';
import asyncHandler from 'express-async-handler';

const PRODUCTS_FILE = path.join('data', 'products.csv');
const ORDERS_FILE = path.join('data', 'orders.csv');

// CSV Parsers
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

// Get frequently bought together product pairs
const buildCoPurchaseMap = (orders) => {
  const coPurchaseMap = {};

  for (const order of orders) {
    const productIds = order.productIds?.split('|') || [];

    for (let i = 0; i < productIds.length; i++) {
      for (let j = i + 1; j < productIds.length; j++) {
        const pairKey = [productIds[i], productIds[j]].sort().join(',');
        coPurchaseMap[pairKey] = (coPurchaseMap[pairKey] || 0) + 1;
      }
    }
  }

  return coPurchaseMap;
};

// Recommend based on most frequent purchases
const getTopProducts = (orders, products, limit = 5) => {
  const productFrequency = {};

  for (const order of orders) {
    const productIds = order.productIds?.split('|') || [];
    for (const pid of productIds) {
      productFrequency[pid] = (productFrequency[pid] || 0) + 1;
    }
  }

  const topProductIds = Object.entries(productFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(entry => entry[0]);

  return products.filter(p => topProductIds.includes(p.id));
};

// Recommend products based on user's past orders
const getUserBasedRecommendations = (userId, orders, products, coPurchaseMap) => {
  const userOrders = orders.filter(o => o.userId === userId);
  const userProductIds = new Set(userOrders.flatMap(o => o.productIds?.split('|') || []));

  const scores = {};

  for (const productId of userProductIds) {
    for (const pair in coPurchaseMap) {
      const [p1, p2] = pair.split(',');
      if (p1 === productId && !userProductIds.has(p2)) {
        scores[p2] = (scores[p2] || 0) + coPurchaseMap[pair];
      } else if (p2 === productId && !userProductIds.has(p1)) {
        scores[p1] = (scores[p1] || 0) + coPurchaseMap[pair];
      }
    }
  }

  const recommendedIds = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 5);

  return products.filter(p => recommendedIds.includes(p.id));
};

// Controller: Get Recommendations
const getRecommendations = asyncHandler(async (req, res) => {
  const { userId } = req.query; // Optional

  const products = readCSV(PRODUCTS_FILE);
  const orders = readCSV(ORDERS_FILE);

  const coPurchaseMap = buildCoPurchaseMap(orders);
  let recommendations;

  if (userId) {
    recommendations = getUserBasedRecommendations(userId, orders, products, coPurchaseMap);
  } else {
    recommendations = getTopProducts(orders, products, 5);
