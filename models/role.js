const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    role: {
        type: String,
        required: true,
        uppercase: true
    }
})

module.exports = mongoose.model('role', roleSchema);