'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var FreezeSchema = new Schema({
  publicAddress: { type: String, lowercase: true },
  createdAt: { type: Date, default: Date.now },
  transactionHash: { type: String, lowercase: true },
  transactionTime: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Freeze', FreezeSchema);
