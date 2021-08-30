"use strict";

const express = require("express");
const Helper = require('./blockchain.helper');
const auth = require("../../auth/auth.service");
const controller = require("./blockchain.controller");

// Helper.syncMinters();
const router = express.Router();

/*********************** FOR ADMIN PANEL **********************/
/**************************** Minting *************************/

router.get("/mint", auth.anyAdmin(), controller.mintGet);
router.post("/mint", controller.mintPost);

router.get("/supplyHistory", auth.anyAdmin(), controller.supplyHistory);

router.post("/addMinter", auth.anyAdmin(), controller.addMinter);
router.get('/getMinters', auth.anyAdmin(), controller.getMinters);

/** ********************* Burning **********************/
router.get("/burn", auth.anyAdmin(), controller.burnGet);
router.post("/burn", auth.anyAdmin(), controller.burnPost);


/********************* Change Ownership    ************************ */
router.post('/proposeOwner', auth.anyAdmin(), controller.proposeOwner);
router.post('/claimOwnership', controller.claimOwnership);


/********************** Token  Public Variables ********************************/
router.get('/TokenPublicVariables', controller.TokenPublicVariables);


/***************************** History Of Ownership ******************************************/
router.get('/historyOfOwnerShip', auth.anyAdmin(), controller.historyOfOwnerShip);


/******************************* Set Supply Controller ****************************************************** */
router.post('/setNewSupplyController', auth.anyAdmin(), controller.setNewSupplyController);



/******************************* Set Supply Controller ****************************************************** */
router.post('/setNewFeeController', auth.anyAdmin(), controller.setNewFeeController);


/******************************* Set Asset Protector Controller ****************************************************** */
router.post('/setNewAssetProtector', auth.anyAdmin(), controller.setNewAssetProtector);
router.post('/freezeAddress', auth.anyAdmin(), controller.freezeAddress);
router.post('/unFreezeAddress', auth.anyAdmin(), controller.unFreezeAddress);
router.get('/getFreezedAddresses', auth.anyAdmin(), controller.getFreezedAddresses);



router.get('/syncRoles', controller.syncRoles);



router.get('/createLiquidityPool', controller.createLiquidityPool);



module.exports = router;