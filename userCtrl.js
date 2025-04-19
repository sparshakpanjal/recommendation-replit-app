import User from "./userModel.js"; // Corrected import
import jwtTokens from "./jwtTokens.js"; // Corrected import
import expressAsyncHandler from "express-async-handler";
const { generateToken } = jwtTokens;
const validateMongoDbId = require("../utils/validateMongodbId");
import { generateRefreshtokenToken } from "./config/refreshtoken.js";
import jwt from "jsonwebtoken";
import { error } from "console";


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
        const refreshToken = await
            generateRefreshtokenToken (findUser?._id);
        const updateuser = await
            User.findByIdAndUpdate(
                findUser.id,
                {
                    refreshToken: refreshToken,
                },
                { new: true}
            );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });

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
   
    const { id } = req.params;
    validateMongoDbId(id);
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

// Handle refresh token
const handleRefreshToken = asyncHandler(async(req, res) => {
    const cookie = req.cookies;
    console.log(cookie);
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({ refreshToken});
    if (!user) throw new Error("No Refresh token present in db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET,(err,decoded => {
        if (err || user,id !== decoded.id){
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(User?._id);
        res,json({ accessToken })
    }));
});


// logout functionality

const logout = asyncHandler(async(req, req) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshtoken;
    const user = await User.findOne({ refreshToken});
    if (!user) {
        res.clearCookie("refrshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204);//forbidden
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    
         });
    res.clearCookie("refrshToken", {
            httpOnly: true,
            secure: true,
    });
    return res.sendStatus(204);//forbidden
});
     

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
});

const blockUser = asyncHandler(async(req, res) => {});
 const { id } = req.params;
 try {
     const blockuser = await User.findByIdAndUpdate(
         id,
         {
             isBlocked: true,
         },
         {
             new: true,
         }
     );
     res.json({
         message: "User Blocked",
     });
 } catch (error) {
   throw new Error(error);  
 }
});
const unblockUser = expressAsyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(i );


 try {
     const unblockuser = await User.findByIdAndUpdate(
         id,
         {
             isBlocked: false,
         },
         {
             new: true,
         }
     );
     res.json({
         message: "User UnBlocked",
     });     
 } catch (error) {
   throw new Error(error);  
 }
});    
     
export default { 
    createUser, 
    loginUser, 
    getAllUsers, 
    getUser, 
    updateUser, 
    deleteUser 
    updatedUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
};
