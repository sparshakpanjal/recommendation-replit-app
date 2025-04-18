import User from "./userModel.js"; // Corrected import
import jwtTokens from "./jwtTokens.js"; // Corrected import
const { generateToken } = jwtTokens;

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

// Get all users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// Get a single user
const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Update user
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { firstname, lastname, email, mobile } = req.body;
        
        // Don't allow password updates through this endpoint for security
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                firstname,
                lastname,
                email,
                mobile
            },
            { new: true }
        );
        
        if (!updatedUser) {
            throw new Error("User not found");
        }
        
        res.json({
            status: "success",
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
            throw new Error("User not found");
        }
        
        res.json({
            status: "success",
            message: "User deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export default { 
    createUser, 
    loginUser, 
    getAllUsers, 
    getUser, 
    updateUser, 
    deleteUser 
};
