
const express = require("express");
const { createUser } = require("./userCtrl");
const router = express.Router();

router.post("/register", createUser);

module.exports = router;
