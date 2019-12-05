const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: 'please enter first_name'
    },
    lastName: {
        type: String,
        required: 'please enter last_name'
    },
    address: {
        type: String,
        required: 'please enter address'
    },
    email: {
        type: String,
        required:  'please enter email',
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    mobileNo:{
        type: String,
        required: 'please enter mobile number'
    },
    email_verified_key: {
        type: String,
        default: Math.floor((Math.random() * 100) + 54)
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required:  'please enter password'
    },
    is_active: {
        type: String,
        default: false
    },
    remember_token: {
        type: String
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    profileImage: {
        type: String,
        // required: 'please upload item image'
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
})
userSchema.pre('save', function(next){
    this.password = bcrypt.hashSync(this.password, saltRounds);
    next();
});

module.exports = mongoose.model('user', userSchema);
