'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var HistorySchema = new Schema({
  publicAddress: { type: String, lowercase: true },
  role: { type: String, default: 'user' }, // admin
  createdAt: { type: Date, default: Date.now },
  transactionHash: { type: String, lowercase: true },
  transactionTime: { type: Date, default: Date.now }
  //   updatedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('History', HistorySchema);
