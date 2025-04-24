import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the paths for CSV files
const usersFilePath = path.join(__dirname, '../data/sampled_users.csv');
const productsFilePath = path.join(__dirname, '../data/sampled_products.csv');
const ordersFilePath = path.join(__dirname, '../data/sampled_orders.csv');
const categoriesFilePath = path.join(__dirname, '../data/sampled_categories.csv');

// Function to create a CSV file with headers if it doesn't exist
const createCSVFileIfNotExists = (filePath, headers) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, headers + '\n', 'utf8');
    console.log(`✅ Created new CSV file: ${filePath}`);
  } else {
    console.log(`🔁 CSV file already exists: ${filePath}`);
  }
};

// Setup for Users CSV (headers: id, name, email, password, role, blocked)
createCSVFileIfNotExists(
  usersFilePath,
  'id,name,email,password,role,blocked'
);

// Setup for Products CSV (headers: id, name, description, price, stock, category)
createCSVFileIfNotExists(
  productsFilePath,
  'id,name,description,price,stock,category'
);

// Setup for Orders CSV (headers: id, userId, productIds, status, date)
createCSVFileIfNotExists(
  ordersFilePath,
  'id,userId,productIds,status,date'
);

// Setup for Categories CSV (headers: id, name, description)
createCSVFileIfNotExists(
  categoriesFilePath,
  'id,name,description'
);

console.log('🚀 CSV file setup complete!');

