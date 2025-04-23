import {
  createCategory as createCat,
  getCategories,
  updateCategory as updateCat,
  deleteCategory as deleteCat
} from "../models/categoryModel.js";

import asyncHandler from "express-async-handler";

// Helper function to create slugs
const createSlug = (title) => {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const createCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const slug = createSlug(title);
  const categories = await getCategories();

  const exists = categories.find(cat => cat.title === title);
  if (exists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const result = await createCat(title, slug);
  res.status(201).json(result);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  let updateData = { ...req.body };
  if (title) {
    updateData.slug = createSlug(title);
  }

  const updated = await updateCat(id, updateData);
  if (!updated || updated.length === 0) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json(updated[0]);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await deleteCat(id);
  if (!deleted || deleted.length === 0) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json({ message: "Category deleted successfully" });
});

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const categories = await getCategories();
  const category = categories.find(c => c.id.toString() === id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json(category);
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await getCategories();
  res.json(categories);
});

export default {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories
};
