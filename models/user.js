const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let userSchema = new Schema({
    username: {
       type: String,
       unique: true

    },
    email: {
        type: String,
        unique: true
    },
    password: {
        
    },
    admin:{

        type: Boolean
    }
}, {
    collection: 'users'
})

userSchema.plugin(uniqueValidator, { message: 'Email already in use.' });




module.exports = mongoose.model('users', userSchema)
