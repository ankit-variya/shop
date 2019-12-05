const mongoose = require('mongoose');

const ordertSchema = mongoose.Schema({
   
  //user: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'product'},
  quantity: { type: Number, default: 1 }

});

module.exports = mongoose.model('order', ordertSchema);