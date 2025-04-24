import express from "express";
import fs from "fs";
import path from "path";
import userCtrl from './userCtrl.js';
import { authMiddleware, isAdmin } from './authMiddleware.js';

// Define the path to your users' CSV file
const userFilePath = path.join(__dirname, '../path-to-users.csv');

const router = express.Router();

// Helper functions to read and write users from/to CSV
const readUsersFromCSV = () => {
    const csvData = fs.readFileSync(userFilePath, 'utf8');
    const rows = csvData.split('\n').slice(1); // Skip header row
    return rows.map(row => {
        const [id, email, password, role, status] = row.split(',');
        return { id, email, password, role, status };
    });
};

const writeUsersToCSV = (users) => {
    const updatedCSV = users
        .map(user => `${user.id},${user.email},${user.password},${user.role},${user.status}`)
        .join("\n");
    fs.writeFileSync(userFilePath, "id,email,password,role,status\n" + updatedCSV);
};

// Public Routes
router.post("/register", userCtrl.createUser);  // No changes in the register logic
router.post("/login", userCtrl.loginUser);  // No changes in the login logic

// Protected Routes
router.get("/all", authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = readUsersFromCSV();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
});

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const users = readUsersFromCSV();
        const user = users.find(user => user.id === req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
});

router.put("/:id", authMiddleware, isAdmin, async (req, res) => {
    try {
        const { email, password, role, status } = req.body;
        const users = readUsersFromCSV();
        const userIndex = users.findIndex(user => user.id === req.params.id);

        if (userIndex === -1) return res.status(404).json({ message: "User not found" });

        users[userIndex] = { id: req.params.id, email, password, role, status };
        writeUsersToCSV(users);
        res.json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
});

router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = readUsersFromCSV();
        const updatedUsers = users.filter(user => user.id !== req.params.id);

        if (updatedUsers.length === users.length) {
            return res.status(404).json({ message: "User not found" });
        }

        writeUsersToCSV(updatedUsers);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
});

router.get("/refresh", userCtrl.handleRefreshToken); // No changes for refresh token
router.get("/logout", userCtrl.logout); // No changes for logout

// Block/Unblock User Routes
router.put("/block-user/:id", authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = readUsersFromCSV();
        const userIndex = users.findIndex(user => user.id === req.params.id);

        if (userIndex === -1) return res.status(404).json({ message: "User not found" });

        users[userIndex].status = "blocked";
        writeUsersToCSV(users);

        res.json({ message: "User blocked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error blocking user", error });
    }
});

router.put("/unblock-user/:id", authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = readUsersFromCSV();
        const userIndex = users.findIndex(user => user.id === req.params.id);

        if (userIndex === -1) return res.status(404).json({ message: "User not found" });

        users[userIndex].status = "active";
        writeUsersToCSV(users);

        res.json({ message: "User unblocked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error unblocking user", error });
    }
});

export default router;

