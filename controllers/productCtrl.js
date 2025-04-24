import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';

const PRODUCTS_FILE = path.join('data', 'products.csv');

// Ensure CSV file exists
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, 'id,title,slug,description,price,categoryId,images,numReviews,ratings\n');
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

const createSlug = (title) => {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const createProduct = asyncHandler(async (req, res) => {
  const products = readCSV(PRODUCTS_FILE);
  const { title, description, price, categoryId, images } = req.body;

  const newProduct = {
    id: uuidv4(),
    title,
    slug: createSlug(title),
    description,
    price: price.toString(),
    categoryId,
    images,
    numReviews: '0',
    ratings: '0'
  };

  products.push(newProduct);
  writeCSV(PRODUCTS_FILE, products, Object.keys(newProduct));

  res.status(201).json(newProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const products = readCSV(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404);
    throw new Error("Product not found");
  }

  const updatedProduct = {
    ...products[index],
    ...req.body
  };

  if (req.body.title) {
    updatedProduct.slug = createSlug(req.body.title);
  }

  products[index] = updatedProduct;
  writeCSV(PRODUCTS_FILE, products, Object.keys(updatedProduct));

  res.json(updatedProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let products = readCSV(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404);
    throw new Error("Product not found");
  }

  const deleted = products.splice(index, 1)[0];
  writeCSV(PRODUCTS_FILE, products, Object.keys(deleted));

  res.json(deleted);
});

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const products = readCSV(PRODUCTS_FILE);
  const product = products.find(p => p.id === id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = readCSV(PRODUCTS_FILE);
  res.json({
    count: products.length,
    products
  });
});

const createProductReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  const products = readCSV(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404);
    throw new Error("Product not found");
  }

  const product = products[index];
  const prevNumReviews = parseInt(product.numReviews || '0');
  const prevRating = parseFloat(product.ratings || '0');

  const newNumReviews = prevNumReviews + 1;
  const newRating = ((prevRating * prevNumReviews) + parseFloat(rating)) / newNumReviews;

  product.numReviews = newNumReviews.toString();
  product.ratings = newRating.toFixed(2);

  products[index] = product;
  writeCSV(PRODUCTS_FILE, products, Object.keys(product));

  res.status(201).json({ message: "Review added" });
});

export default {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  createProductReview
};
