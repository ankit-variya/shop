const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{
        type: String,
        required: 'please enter item name'
    },
    price: {
        type: Number,
        required: 'please enter item price'
    },
    category: {
        type: String,
        required: 'please enter item category'
    },
    productImage: {
        type: String,
        required: 'please upload item image'
    }
});

module.exports = mongoose.model('product', productSchema);