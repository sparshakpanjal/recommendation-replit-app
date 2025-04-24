import express from "express";
import fs from "fs";
import path from "path";
import productCtrl from "../controllers/productCtrl.js";

// Define the path to your CSV file
const productsFilePath = path.join(__dirname, '../path-to-products.csv');

const router = express.Router();

// Function to read products from CSV
const readProductsFromCSV = () => {
    const csvData = fs.readFileSync(productsFilePath, 'utf8');
    const rows = csvData.split('\n').slice(1); // Skip the header row
    const products = rows.map(row => {
        const [id, title, description, price, category] = row.split(',');  // Assuming format: id,title,description,price,category
        return { id, title, description, price, category };
    });
    return products;
};

// Get all products
router.get("/", async (req, res) => {
    try {
        const products = readProductsFromCSV();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error });
    }
});

// Get a single product by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const products = readProductsFromCSV();
        const product = products.find(p => p.id === id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error });
    }
});

// Create a new product
router.post("/", async (req, res) => {
    try {
        const { title, description, price, category } = req.body;

        // Generate a new product id (you can use a different method for id generation)
        const newId = Date.now();

        const newProduct = { id: newId.toString(), title, description, price, category };

        // Read current products and append the new one
        const products = readProductsFromCSV();
        products.push(newProduct);

        // Write the updated products back to the CSV file
        const updatedCSV = products
            .map(p => `${p.id},${p.title},${p.description},${p.price},${p.category}`)
            .join("\n");

        fs.writeFileSync(productsFilePath, "id,title,description,price,category\n" + updatedCSV);

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
});

// Update a product by ID
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, category } = req.body;

        const products = readProductsFromCSV();
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update product data
        const updatedProduct = { id, title, description, price, category };
        products[productIndex] = updatedProduct;

        // Write the updated products back to the CSV file
        const updatedCSV = products
            .map(p => `${p.id},${p.title},${p.description},${p.price},${p.category}`)
            .join("\n");

        fs.writeFileSync(productsFilePath, "id,title,description,price,category\n" + updatedCSV);

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
});

// Delete a product by ID
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const products = readProductsFromCSV();
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Remove product from the array
        const deletedProduct = products.splice(productIndex, 1)[0];

        // Write the updated products back to the CSV file
        const updatedCSV = products
            .map(p => `${p.id},${p.title},${p.description},${p.price},${p.category}`)
            .join("\n");

        fs.writeFileSync(productsFilePath, "id,title,description,price,category\n" + updatedCSV);

        res.json(deletedProduct);
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
});

export default router;

