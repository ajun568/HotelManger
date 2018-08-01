let mongoose = require('mongoose');
let OrderSchema = require('../schema/order');

let Order = mongoose.model('order', OrderSchema);

module.exports = Order;
