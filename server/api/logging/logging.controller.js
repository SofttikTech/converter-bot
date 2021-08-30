/**
   * Using Rails-like standard naming convention for endpoints.
   * GET     /loggings              ->  index
   * POST    /loggings              ->  create
   * GET     /loggings/:id          ->  show
   * PUT     /loggings/:id          ->  update
   * DELETE  /loggings/:id          ->  destroy
*/

'use strict';

const Logging = require('./logging.model');
const util = require('../../utils/encryption.util');
const { sendResponse } = require('../../config/dto');
const responseCode = require('../../config/resCodes');

function newlog(req, uid = '') {
  if (req.user) uid = req['user']['_id'];
  let logObj = new Logging({
    userId: uid,
    accessTime: Date.now(),
    requestUrl: req['originalUrl'],
    city: req['headers']['city'] || '',
    zipCode: req['headers']['zipcode'] || '',
    callCode: req['headers']['callcode'] || '',
    internet: req['headers']['internet'] || '',
    ipAddress: req['headers']['ipaddress'] || '',
    countryName: req['headers']['countryname'] || '',
    countryCode: req['headers']['countrycode'] || '',
    accessToken: req['headers']['authorization'] || '',
    continentName: req['headers']['continentname'] || '',
    continentCode: req['headers']['continentcode'] || '',
    requestData: util.encryptdata(JSON.stringify(req['body'])),
    userAgent: req['headers']['agent'] || req['headers']['user-agent'],
  });
  if (logObj['city']) logObj.save();
}

//GET login history
exports.loginHistory = (req, res) => {
  Logging.find({ userId: req.user._id, requestUrl: '/api/users/auth' }, { ipAddress: 1, accessTime: 1, userAgent: 1 }).lean().sort({ accessTime: -1 }).exec((err, logs) => {
    if (err) return handleError(res, err);
    return sendResponse(res, responseCode.SUCCESS, 'Login history', logs);
  });
}

function handleError(res, err) {
  return sendResponse(res, responseCode.INTERNALSERVERERROR, 'Something went wrong Please contact customer support');
}

exports.newlog = newlog;