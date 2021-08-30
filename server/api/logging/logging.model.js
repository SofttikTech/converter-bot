'use strict';

const mongoose = require('mongoose'), Schema = mongoose.Schema;

const LoggingSchema = new Schema({
  city: String,
  zipCode: String,
  callCode: String,
  internet: String,
  userAgent: String,
  ipAddress: String,
  requestUrl: String,
  accessToken: String,
  requestData: String,
  countryName: String,
  countryCode: String,
  continentName: String,
  continentCode: String,
  accessTime: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Logging', LoggingSchema);