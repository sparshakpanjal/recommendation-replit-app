import mongoose from "mongoose";
import bcrypt from "bcrypt"; // Corrected import to use ES module style

const userSchema = new mongoose.Schema({
    isAdmin: {
        type: String,
        default: "user",
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user",
    },
    isBlocked: {
        type: Boolean,
        default: false, // Fixed typo 'defaul' to 'default'
    },
    cart: {
        type: Array,
        default: []
    },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    Wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
}, {
    timestamps: true, // Corrected 'timestemps' to 'timestamps'
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.isPasswordMatched = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema); // Corrected module export

