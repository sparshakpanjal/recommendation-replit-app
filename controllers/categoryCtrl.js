
import Category from "../models/categoryModel.js";
import asyncHandler from "express-async-handler";

// Helper function for slug creation (instead of using slugify)
const createSlug = (title) => {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const createCategory = asyncHandler(async (req, res) => {
    try {
        const { title } = req.body;
        
        // Check if category exists
        const categoryExists = await Category.findOne({ title });
        if (categoryExists) {
            res.status(400);
            throw new Error("Category already exists");
        }
        
        // Create slug from title
        const slug = createSlug(title);
        
        const category = await Category.create({
            title,
            slug
        });
        
        res.status(201).json(category);
    } catch (error) {
        throw new Error(error);
    }
});

const updateCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        
        // Create slug if title is provided
        let updateData = { ...req.body };
        if (title) {
            updateData.slug = createSlug(title);
        }
        
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        if (!updatedCategory) {
            res.status(404);
            throw new Error("Category not found");
        }
        
        res.json(updatedCategory);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);
        
        if (!deletedCategory) {
            res.status(404);
            throw new Error("Category not found");
        }
        
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        throw new Error(error);
    }
});

const getCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        
        if (!category) {
            res.status(404);
            throw new Error("Category not found");
        }
        
        res.json(category);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        throw new Error(error);
    }
});

export default {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getAllCategories
};
