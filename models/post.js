const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
var autoIncrement = require("mongodb-autoincrement");


let postSchema = new Schema({
    title: {
        type: String,
        

    },
    description: {
        type: String
    },
    
    username:{
        type: String
    },
    file:{type:String
    },
    
}, {
    collection: 'posts'
})





module.exports = mongoose.model('posts', postSchema);
