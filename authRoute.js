
const express = require("express");
const router = express.Router();
const { createUser } = require("./userCtrl");

router.post("/register", createUser);

router.post("/login", (req, res) => {
    try {
        res.json({
            message: "User login endpoint"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

module.exports = router;
