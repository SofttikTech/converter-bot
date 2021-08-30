'use strict';

const express = require('express');
const auth = require('../../auth/auth.service');
const controller = require('./user.controller');

const router = express.Router();
router.get('/testApi', controller.testapi); // Test API

/**************************    Admin Panel ************************ */
/**************************       Login     ************************ */
router.get('/getNonce/:publicAddress', controller.getNonce);
router.post('/loginWithMetaMask', controller.loginWithMetaMask);


module.exports = router;
