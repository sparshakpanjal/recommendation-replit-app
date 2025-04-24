import express from "express";
import fs from "fs";
import path from "path";
import cartCtrl from "../controllers/cartCtrl.js";
import { authMiddleware } from "../authMiddleware.js";

// Define the path to your CSV file
const cartFilePath = path.join(__dirname, '../path-to-cart.csv');

const router = express.Router();

// Function to read cart data from CSV
const readCartFromCSV = (userId) => {
    const csvData = fs.readFileSync(cartFilePath, 'utf8');
    const rows = csvData.split('\n').slice(1); // Skip the header row
    const carts = rows.map(row => {
        const [userId, productId, quantity] = row.split(',');
        return { userId, productId, quantity };
    });
    return carts.filter(cart => cart.userId === userId);
};

// Function to write cart data to CSV
const writeCartToCSV = (carts) => {
    const updatedCSV = carts
        .map(cart => `${cart.userId},${cart.productId},${cart.quantity}`)
        .join("\n");

    fs.writeFileSync(cartFilePath, "userId,productId,quantity\n" + updatedCSV);
};

// Routes for cart operations
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const carts = readCartFromCSV(userId);
        res.json(carts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error });
    }
});

router.post("/add", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        const carts = readCartFromCSV(userId);
        const existingItem = carts.find(cart => cart.productId === productId);

        if (existingItem) {
            // If the item already exists, update the quantity
            existingItem.quantity += quantity;
        } else {
            // Add new item to the cart
            carts.push({ userId, productId, quantity });
        }

        writeCartToCSV(carts);

        res.status(201).json({ message: "Item added to cart" });
    } catch (error) {
        res.status(500).json({ message: "Error adding item to cart", error });
    }
});

router.put("/update", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        const carts = readCartFromCSV(userId);
        const cartItemIndex = carts.findIndex(cart => cart.productId === productId);

        if (cartItemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Update quantity of the item
        carts[cartItemIndex].quantity = quantity;

        writeCartToCSV(carts);

        res.json({ message: "Cart item updated" });
    } catch (error) {
        res.status(500).json({ message: "Error updating cart item", error });
    }
});

router.delete("/clear", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        // Read the current carts and filter out the user's cart
        const carts = readCartFromCSV(userId);

        // Clear the user's cart
        const updatedCarts = carts.filter(cart => cart.userId !== userId);

        writeCartToCSV(updatedCarts);

        res.json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: "Error clearing cart", error });
    }
});

router.delete("/:productId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const carts = readCartFromCSV(userId);
        const cartItemIndex = carts.findIndex(cart => cart.productId === productId);

        if (cartItemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Remove the item from the cart
        carts.splice(cartItemIndex, 1);

        writeCartToCSV(carts);

        res.json({ message: "Item removed from cart" });
    } catch (error) {
        res.status(500).json({ message: "Error removing item from cart", error });
    }
});

export default router;

