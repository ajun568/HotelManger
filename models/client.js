let mongoose = require('mongoose');
let ClientSchema = require('../schema/client');

let Client = mongoose.model('client', ClientSchema);

module.exports = Client;
