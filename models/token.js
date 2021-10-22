const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    email: {
        type: String,
        required: true,
        ref: "user",
    },
    username: {

        type: String
    },

    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    },
   
});

module.exports = mongoose.model("token", tokenSchema);