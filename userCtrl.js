
const User = require("./userModel");

const createUser = async (req, res, next) => {
    try {
        const { email } = req.body;
        const findUser = await User.findOne({ email });
        
        if (!findUser) {
            // Create new User
            const newUser = await User.create(req.body);
            res.json({
                status: "success",
                user: {
                    _id: newUser._id,
                    firstname: newUser.firstname,
                    lastname: newUser.lastname,
                    email: newUser.email,
                    mobile: newUser.mobile
                }
            });
        } else {
            throw new Error("User Already Exists");
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { createUser };
