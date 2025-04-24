import express from "express";
import fs from "fs";
import path from "path";
import categoryCtrl from "../controllers/categoryCtrl.js";

// Define the path to your CSV file
const categoriesFilePath = path.join(__dirname, '../path-to-categories.csv');

const router = express.Router();

// Function to read categories from CSV
const readCategoriesFromCSV = () => {
    const csvData = fs.readFileSync(categoriesFilePath, 'utf8');
    const rows = csvData.split('\n').slice(1); // Skip the header row
    const categories = rows.map(row => {
        const [id, name] = row.split(','); // Assuming format: id,name
        return { id, name };
    });
    return categories;
};

// Public routes
// Get all categories
router.get("/", async (req, res) => {
    try {
        const categories = readCategoriesFromCSV();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error });
    }
});

// Get category by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const categories = readCategoriesFromCSV();
        const category = categories.find(c => c.id === id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: "Error fetching category", error });
    }
});

// Admin routes
// Create a new category
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;

        // Generate a new category id (you can use a different method for id generation)
        const newId = Date.now();

        const newCategory = { id: newId.toString(), name };

        // Read current categories and append the new one
        const categories = readCategoriesFromCSV();
        categories.push(newCategory);

        // Write the updated categories back to the CSV file
        const updatedCSV = categories
            .map(c => `${c.id},${c.name}`)
            .join("\n");

        fs.writeFileSync(categoriesFilePath, "id,name\n" + updatedCSV);

        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: "Error creating category", error });
    }
});

// Update a category by ID
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const categories = readCategoriesFromCSV();
        const categoryIndex = categories.findIndex(c => c.id === id);

        if (categoryIndex === -1) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Update category data
        const updatedCategory = { id, name };
        categories[categoryIndex] = updatedCategory;

        // Write the updated categories back to the CSV file
        const updatedCSV = categories
            .map(c => `${c.id},${c.name}`)
            .join("\n");

        fs.writeFileSync(categoriesFilePath, "id,name\n" + updatedCSV);

        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error });
    }
});

// Delete a category by ID
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const categories = readCategoriesFromCSV();
        const categoryIndex = categories.findIndex(c => c.id === id);

        if (categoryIndex === -1) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Remove category from the array
        const deletedCategory = categories.splice(categoryIndex, 1)[0];

        // Write the updated categories back to the CSV file
        const updatedCSV = categories
            .map(c => `${c.id},${c.name}`)
            .join("\n");

        fs.writeFileSync(categoriesFilePath, "id,name\n" + updatedCSV);

        res.json(deletedCategory);
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
});

export default router;

