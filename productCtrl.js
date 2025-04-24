import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import asyncHandler from 'express-async-handler';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';

const csvFilePath = path.join('data', 'products.csv');

// Utility: Read all products
const readProducts = () => {
  return new Promise((resolve, reject) => {
    const products = [];
    fs.createReadStream(csvFilePath)
      .pipe(parse({ columns: true }))
      .on('data', row => products.push(row))
      .on('end', () => resolve(products))
      .on('error', err => reject(err));
  });
};

// Utility: Write all products
const writeProducts = (products) => {
  return new Promise((resolve, reject) => {
    stringify(products, { header: true }, (err, output) => {
      if (err) return reject(err);
      fs.writeFile(csvFilePath, output, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

// ➕ Create product
export const createProduct = asyncHandler(async (req, res) => {
  const { title, ...rest } = req.body;
  const slug = slugify(title);
  const newProduct = {
    id: uuidv4(),
    title,
    slug,
    ...rest,
  };

  const products = await readProducts();
  products.push(newProduct);
  await writeProducts(products);
  res.status(201).json(newProduct);
});

// 🔁 Update product
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, ...rest } = req.body;

  const products = await readProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');

  if (title) {
    products[index].title = title;
    products[index].slug = slugify(title);
  }
  Object.assign(products[index], rest);

  await writeProducts(products);
  res.json(products[index]);
});

// ❌ Delete product
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const products = await readProducts();
  const updatedProducts = products.filter(p => p.id !== id);
  if (products.length === updatedProducts.length) {
    throw new Error("Product not found");
  }

  await writeProducts(updatedProducts);
  res.json({ message: "Product deleted successfully" });
});

// 📥 Get single product
export const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const products = await readProducts();
  const product = products.find(p => p.id === id);
  if (!product) throw new Error("Product not found");
  res.json(product);
});

// 📦 Get all products (no filters/sorting/pagination yet)
export const getAllProduct = asyncHandler(async (req, res) => {
  const products = await readProducts();
  res.json(products);
});

