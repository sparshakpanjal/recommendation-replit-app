import { v4 as uuidv4 } from 'uuid';
import { readCSV, writeCSV, appendCSV } from '../utils/dbconnect.js';

const FILENAME = 'data/curated_product_sample_1_.csv';

const Product = {
  // Create a product
  async create(productData) {
    const products = await readCSV(FILENAME);

    if (products.find(p => p.Title === productData.title)) {
      throw new Error('Product with the same title already exists');
    }

    const newProduct = {
      ProductID: uuidv4(),
      Title: productData.title,
      Category: productData.category || 'Misc',
      Description: productData.description || '',
      Price: productData.price,
      Brand: productData.brand || '',
      Stock: productData.stock || 0,
      Rating: productData.rating || 0,
      ImageURL: productData.image || '',
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };

    await appendCSV(FILENAME, newProduct);
    return newProduct;
  },

  // Get all products (with optional query and pagination)
  async find(query = {}, options = {}) {
    const products = await readCSV(FILENAME);
    let filtered = products;

    for (const [key, val] of Object.entries(query)) {
      filtered = filtered.filter(p => (p[key] || '').toLowerCase() === val.toLowerCase());
    }

    const { limit, skip } = options;
    return filtered.slice(skip || 0, limit ? (skip || 0) + limit : undefined);
  },

  // Find a product by ID
  async findById(id) {
    const products = await readCSV(FILENAME);
    return products.find(p => p.ProductID === id) || null;
  },

  // Update product by ID
  async findByIdAndUpdate(id, update) {
    const products = await readCSV(FILENAME);
    const index = products.findIndex(p => p.ProductID === id);
    if (index === -1) return null;

    const updatedProduct = {
      ...products[index],
      ...update,
      UpdatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    await writeCSV(FILENAME, products);
    return updatedProduct;
  },

  // Delete product by ID (optional feature)
  async deleteById(id) {
    const products = await readCSV(FILENAME);
    const filtered = products.filter(p => p.ProductID !== id);
    await writeCSV(FILENAME, filtered);
    return { success: true, message: 'Product deleted if it existed' };
  }
};

export default Product;
