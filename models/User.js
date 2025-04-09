const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    npk: { 
        type: String, 
        required: true, 
        unique: true,
        match: /^[A-Z]{1}\d{5}-\d{2}$/
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    verified: { 
        type: Boolean, 
        default: false 
    },
    role: {
        type: String,
        enum: ["master", "user", "admin"],
        default: "user"
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
