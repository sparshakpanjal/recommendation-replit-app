import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES_FILE = path.join('data', 'categories.csv');

// Ensure the CSV file exists with headers
if (!fs.existsSync(CATEGORIES_FILE)) {
  fs.writeFileSync(CATEGORIES_FILE, 'id,title,slug\n');
}

// Helper: Read CSV and parse to objects
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

// Helper: Convert object array to CSV and save
function writeCSV(file, data, headers) {
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h] ?? '').join(','))
  ].join('\n');
  fs.writeFileSync(file, csv);
}

// 🔧 Create a new category
export const createCategory = async (title, slug) => {
  try {
    const categories = readCSV(CATEGORIES_FILE);

    // Prevent duplicate slugs
    if (categories.some(c => c.slug === slug)) {
      throw new Error('Category slug must be unique.');
    }

    const newCategory = {
      id: uuidv4(),
      title,
      slug
    };

    categories.push(newCategory);
    writeCSV(CATEGORIES_FILE, categories, ['id', 'title', 'slug']);
    return newCategory;
  } catch (err) {
    console.error('🔥 Error in createCategory:', err.message);
    throw err;
  }
};

// 🔎 Get all categories
export const getCategories = async () => {
  try {
    return readCSV(CATEGORIES_FILE);
  } catch (err) {
    console.error('🔥 Error in getCategories:', err.message);
    throw err;
  }
};

// ✏️ Update a category by ID
export const updateCategory = async (id, updates) => {
  try {
    const categories = readCSV(CATEGORIES_FILE);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found.');

    // Check for slug uniqueness if updating slug
    if (updates.slug && categories.some(c => c.slug === updates.slug && c.id !== id)) {
      throw new Error('Slug must be unique.');
    }

    categories[index] = {
      ...categories[index],
      ...updates
    };

    writeCSV(CATEGORIES_FILE, categories, ['id', 'title', 'slug']);
    return categories[index];
  } catch (err) {
    console.error('🔥 Error in updateCategory:', err.message);
    throw err;
  }
};

// 🗑️ Delete a category by ID
export const deleteCategory = async (id) => {
  try {
    let categories = readCSV(CATEGORIES_FILE);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found.');

    const [deleted] = categories.splice(index, 1);
    writeCSV(CATEGORIES_FILE, categories, ['id', 'title', 'slug']);
    return deleted;
  } catch (err) {
    console.error('🔥 Error in deleteCategory:', err.message);
    throw err;
  }
};

// 🔍 Get category by slug (optional helper)
export const getCategoryBySlug = async (slug) => {
  try {
    const categories = readCSV(CATEGORIES_FILE);
    return categories.find(c => c.slug === slug) || null;
  } catch (err) {
    console.error('🔥 Error in getCategoryBySlug:', err.message);
    throw err;
  }
};
