import User from "./userModel.js"; // Corrected import
import { generateToken } from "./jwtTokens.js"; // Corrected import

const createUser = async (req, res, next) => {
    try {
        const { email, password, firstname, lastname, mobile } = req.body;

        if (!email || !password || !firstname || !lastname || !mobile) {
            throw new Error("All fields are required");
        }

        const findUser = await User.findOne({ email }); // Corrected to use User model
        if (findUser) {
            throw new Error("User Already Exists");
        }

        const newUser = await User.create({ // Corrected to use User model
            email,
            password,
            firstname,
            lastname,
            mobile
        });

        res.status(201).json({
            status: "success",
            token: generateToken(newUser._id),
            user: {
                _id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                email: newUser.email,
                mobile: newUser.mobile
            }
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new Error("Email and password are required");
        }

        const findUser = await User.findOne({ email }); // Corrected to use User model
        if (!findUser) {
            throw new Error("User not found");
        }

        const isPasswordValid = await findUser.isPasswordMatched(password);
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }

        res.json({
            status: "success",
            token: generateToken(findUser._id),
            user: {
                _id: findUser._id,
                firstname: findUser.firstname,
                lastname: findUser.lastname,
                email: findUser.email,
                mobile: findUser.mobile
            }
        });
    } catch (error) {
        next(error);
    }
};

export default { createUser, loginUser };
