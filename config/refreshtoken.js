const jwt = require("jsonwebtoken");

const generateRefreshtoken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECERT,{ expiresIn: "3d"});
};

module.exports = { generateRefreshtokenToken };