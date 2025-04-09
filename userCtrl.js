
const User = require("./userModel");

const createUser = async (req, res) => {
    try {
        const { email } = req.body;
        const findUser = await User.findOne({ email });
        
        if (!findUser) {
            // Create new User
            const newUser = await User.create(req.body);
            res.json({
                success: true,
                user: newUser
            });
        } else {
            res.json({
                msg: "User Already Exists",
                success: false,
            });
        }
    } catch (error) {
        res.status(500).json({
            msg: "Internal Server Error",
            success: false,
            error: error.message
        });
    }
};

module.exports = { createUser };
