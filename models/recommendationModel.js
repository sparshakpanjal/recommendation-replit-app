import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const RECOMMENDATIONS_FILE = path.join('data', 'recommendations.csv');

// Ensure the CSV file exists with headers
if (!fs.existsSync(RECOMMENDATIONS_FILE)) {
  fs.writeFileSync(RECOMMENDATIONS_FILE, 'id,userId,productId,interactionType,timestamp\n');
}

// Read CSV and parse
function readCSV(file) {
  const lines = fs.readFileSync(file, 'utf-8').trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, h, i) => {
      obj[h] = values[i];
      return obj;
    }, {});
  });
}

// Write CSV from object list
function writeCSV(file, data, headers) {
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h] ?? '').join(','))
  ].join('\n');
  fs.writeFileSync(file, csv);
}

// 🔧 Log user interaction with a product
export const logInteraction = async (userId, productId, interactionType = 'view') => {
  const interactions = readCSV(RECOMMENDATIONS_FILE);
  const newEntry = {
    id: uuidv4(),
    userId,
    productId,
    interactionType,
    timestamp: Date.now().toString()
  };

  interactions.push(newEntry);
  writeCSV(RECOMMENDATIONS_FILE, interactions, ['id', 'userId', 'productId', 'interactionType', 'timestamp']);
  return newEntry;
};

// 📊 Get product recommendations for a user
export const getRecommendations = async (userId, limit = 5) => {
  const interactions = readCSV(RECOMMENDATIONS_FILE);

  // Get products user has interacted with most
  const userInteractions = interactions.filter(i => i.userId === userId);

  const productCount = {};
  for (const i of userInteractions) {
    productCount[i.productId] = (productCount[i.productId] || 0) + 1;
  }

  const sortedProducts = Object.entries(productCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([productId]) => productId);

  return sortedProducts;
};

// 🧹 Optional: clear all interactions for a user
export const clearUserRecommendations = async (userId) => {
  let interactions = readCSV(RECOMMENDATIONS_FILE);
  interactions = interactions.filter(i => i.userId !== userId);
  writeCSV(RECOMMENDATIONS_FILE, interactions, ['id', 'userId', 'productId', 'interactionType', 'timestamp']);
};
