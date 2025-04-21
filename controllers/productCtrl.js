
import Product from "../models/productModel.js";
import asyncHandler from "express-async-handler";

// Helper function for slug creation (instead of using slugify)
const createSlug = (title) => {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const createProduct = asyncHandler(async(req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = createSlug(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const updateProduct = asyncHandler(async(req, res) => {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = createSlug(req.body.title);
        }
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updatedProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteProduct = asyncHandler(async(req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        res.json(deletedProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const getProduct = asyncHandler(async(req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id).populate('category');
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllProducts = asyncHandler(async(req, res) => {
    try {
        // Filtering
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);
        
        // Build query
        let query = Product.find(queryObj);
        
        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }
        
        // Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        
        const products = await query.populate('category');
        res.json({
            count: products.length,
            products
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Add product review
const createProductReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    try {
        const product = await Product.findById(id);
        
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        
        // Check if user already reviewed
        const alreadyReviewed = product.reviews.find(
            r => r.user.toString() === req.user._id.toString()
        );
        
        if (alreadyReviewed) {
            res.status(400);
            throw new Error("Product already reviewed");
        }
        
        const review = {
            user: req.user._id,
            rating: Number(rating),
            comment
        };
        
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        
        await product.save();
        res.status(201).json({ message: "Review added" });
    } catch (error) {
        throw new Error(error);
    }
});

export default { 
    createProduct, 
    getProduct, 
    getAllProducts, 
    updateProduct, 
    deleteProduct,
    createProductReview
};
