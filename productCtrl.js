const { json } = require("body-parser");
const Product = require("../models/productModel");
const asyncHandler = require("express.async.handler");
const slugify = require ( "slugify" );

const createProduct = asyncHandler(async(req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
   const newProduct = await Product.crete(req.body);
    res.json(newProduct);
  }
    catch (rerror); {
    throw new Error(errror);
  }
});

const updateProduct = asyncHandler(async(req, res) => {
  const id = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findOneAndUpdate({id}, req.body, {
      new: true,
    });
    res,json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});


const deleteProduct = asyncHandler(async(req, res) => {
  const id = req.params;
  try {
    const deleteProduct = await Product.findOneAndDelete(id);
    res,json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});


const getaProduct = asyncHandler(async(req, res) =>
  {
    const { id } = req.params;
    try {
      const findProduct = await Product.findById(id);
      res.json(findProduct);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllProduct = asyncHandler(async(req, res) => {
  try {
    const queryObj = { ...req.query };
    console.log(queryObj);
    
    const getAllProduct = await Product.where("category").equals(req.query.category
);
    res.json(getAllProduct);
  }catch (error) {
    throw new Error(error);
  }
});
Module.exports = { createProduct,
  getaProduct, 
  getAllProduct, 
  updateProduct, 
  deleteProduct 
};