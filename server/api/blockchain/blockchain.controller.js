"use strict";

// const moment = require('moment');
const User = require("./../user/user.model");
const MintBurn = require("./mintBurn.model");
const History = require("./history.model");
const Helper = require("./blockchain.helper");
const Freeze = require("./freeze.model");
const { SUCCESS, BADREQUEST } = require("../../config/resCodes");
const { sendResponse, errReturned } = require("../../config/dto");

const { web3, web3Socket } = require("../../config/web3");
const { Token, TokenAddress, TokenABI } = require("../../config/contract");


const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
const config = require('../../config/environment');


const InputDataDecoder = require('ethereum-input-data-decoder');



/** ************************************** MINTING  ************************************** */

/**
 * Mint POST
 */
exports.mintPost = async (req, res) => {
    try {
        let { transactionHash } = req["body"];

        if (!transactionHash)
            return sendResponse(res, BADREQUEST, "Invalid Transaction hash");

        if (await MintBurn.findOne({ transactionHash }).exec())
            return sendResponse(res, BADREQUEST, 'This transaction is already added');

        // let receipt = await web3.eth.getTransactionReceipt(transactionHash);
        // if (!receipt) return sendResponse(res, BADREQUEST, 'Unable to find Transaction');

        // if (TokenAddress.toLowerCase() != receipt['to'].toLowerCase())
        //     return errReturned(res, 'Sent on invalid Token Address');

        // let transferInputs = TokenABI.filter(({ name }) => name === 'Transfer')[0]['inputs'];
        // let transferParams = web3.eth.abi.decodeLog(transferInputs, receipt['logs'][0]['data'], receipt['logs'][0]['topics']);

        // let block = await web3.eth.getBlock(receipt['blockNumber'])



        const result = await Helper.decodeLog(transactionHash, 'Transfer')

        if (TokenAddress.toLowerCase() != result['address'].toLowerCase()) return errReturned(res, 'Sent on invalid Token Address');

        let publicAddress = result['returnValues']['to']

        let block = await web3.eth.getBlock(result['blockNumber'])

        // return sendResponse(res, BADREQUEST, 'This tran', result);


        let newMint = new MintBurn({
            type: 'mint',
            transactionHash,
            publicAddress,
            transactionTime: block['timestamp'] * 1000,
            amountOfTokens: web3.utils.fromWei(result['returnValues']['value'], 'ether'),
        });
        await newMint.save();

        return sendResponse(res, SUCCESS, "Tokens minted successfully");
    } catch (error) {
        errReturned(res, error);
    }
};

/**
 * 
 * Supply History
 * 
 */
exports.supplyHistory = async (req, res) => {
    try {
        let mintHistory = await MintBurn.find({}).sort({ transactionTime: -1 });
        return sendResponse(res, SUCCESS, "Supply History", mintHistory);
    } catch (error) { errReturned(res, error) }
}


/**
 * Add Minter
 */
exports.addMinter = async (req, res) => {
    try {
        let { transactionHash, minterAddress } = req["body"];

        if (!transactionHash) return sendResponse(res, BADREQUEST, "Please send Transaction hash");
        if (!minterAddress) return sendResponse(res, BADREQUEST, "PLease send the minter address");

        let receipt = await web3.eth.getTransactionReceipt(transactionHash);
        if (!receipt) return sendResponse(res, BADREQUEST, 'Unable to find Transaction');

        if (TokenAddress.toLowerCase() != receipt['to'].toLowerCase()) return errReturned(res, 'Sent on invalid Token Address');

        const isMinter = await Token.methods.isMinter(minterAddress).call()
        if (!isMinter) return sendResponse(res, BADREQUEST, `${minterAddress} is not added as a Minter`)
        let alreadyAddedUser = await User.findOne({ publicAddress: minterAddress })
        if (alreadyAddedUser) return sendResponse(res, BADREQUEST, "This User is already an admin")

        const randomNumber = Math.floor(Math.random() * 10000000000);

        let newMinter = new User({
            publicAddress: minterAddress,
            role: 'minter',
            nonce: randomNumber
        });
        await newMinter.save();
        return sendResponse(res, SUCCESS, 'Minter is added Successfully', newMinter);
    } catch (error) { errReturned(res, error); }
}

/**
 * Get Minters
 */
exports.getMinters = async (req, res) => {
    try {

        let minters = await User.find({ role: 'minter' }).select('publicAddress');
        return sendResponse(res, SUCCESS, "Minters found", minters)
    } catch (error) { errReturned(res, error) }
}

/**
 * Mint GET
 */
exports.mintGet = async (req, res) => {
    try {
        let mintHistory = await MintBurn.find({ type: 'mint' }).sort({ transactionTime: -1 });
        return sendResponse(res, SUCCESS, "Mint History", mintHistory);
    } catch (error) { errReturned(res, error) }
}

/************************** BURNING **************************/

/**
 * Burn POST
 */
exports.burnPost = async (req, res) => {
    try {
        let { transactionHash } = req["body"];

        if (!transactionHash)
            return sendResponse(res, BADREQUEST, "Invalid Transaction hash");

        if (await MintBurn.findOne({ transactionHash }).exec())
            return sendResponse(res, BADREQUEST, 'This transaction is already added');

        // let receipt = await web3.eth.getTransactionReceipt(transactionHash);
        // if (!receipt) return sendResponse(res, BADREQUEST, 'Unable to find Transaction');

        // if (TokenAddress.toLowerCase() != receipt['to'].toLowerCase())
        //     return errReturned(res, 'Sent on invalid Token Address');

        // let transferInputs = TokenABI.filter(({ name }) => name === 'Transfer')[0]['inputs'];
        // let transferParams = web3.eth.abi.decodeLog(transferInputs, receipt['logs'][0]['data'], receipt['logs'][0]['topics']);

        // let block = await web3.eth.getBlock(receipt['blockNumber'])


        const result = await Helper.decodeLog(transactionHash, 'Transfer')

        if (TokenAddress.toLowerCase() != result['address'].toLowerCase()) return errReturned(res, 'Sent on invalid Token Address');

        let publicAddress = result['returnValues']['to']

        let block = await web3.eth.getBlock(result['blockNumber'])



        let newBurn = new MintBurn({
            type: 'burn',
            transactionHash,
            publicAddress,
            transactionTime: block['timestamp'] * 1000,
            amountOfTokens: web3.utils.fromWei(result['returnValues']['value'], 'ether'),

        });

        await newBurn.save();
        return sendResponse(res, SUCCESS, "Tokens burnt successfully");
    } catch (error) { errReturned(res, error) }
};

/**
 * Burn GET
 */
exports.burnGet = async (req, res) => {
    try {
        let burnHistory = await MintBurn.find({ type: 'burn' }).sort({ transactionTime: -1 });
        return sendResponse(res, SUCCESS, "Burn History", burnHistory);
    } catch (error) { errReturned(res, error) }
}




/**
 * Propose Owner
 */
exports.proposeOwner = async (req, res) => {
    try {

        let { user } = req;
        let { transactionHash } = req['body']
        if (req.headers.hasOwnProperty('authorization')) {

            let decoded = jwtDecode(req['headers']['authorization']);
            if (decoded['role'] === 'admin') {

                // let receipt = await web3.eth.getTransactionReceipt(transactionHash);
                // if (!receipt) return sendResponse(res, BADREQUEST, 'Unable to find Transaction');

                // if (TokenAddress.toLowerCase() != receipt['to'].toLowerCase())
                //     return errReturned(res, 'Sent on invalid Token Address');

                // let transferInputs = TokenABI.filter(({ name }) => name === 'OwnershipTransferProposed')[0]['inputs'];
                // let transferParams = web3.eth.abi.decodeLog(transferInputs, receipt['logs'][0]['data'], receipt['logs'][0]['topics']);

                const result = await Helper.decodeLog(transactionHash, 'OwnershipTransferProposed')

                if (TokenAddress.toLowerCase() != result['address'].toLowerCase()) return errReturned(res, 'Sent on invalid Token Address');

                let publicAddress = result['returnValues']['proposedOwner']

                // let block = await web3.eth.getBlock(result['blockNumber'])

                return sendResponse(res, SUCCESS, "New Owner is proposed Successfully", { currentOwner: result['returnValues']['currentOwner'], proposedOwner: result['returnValues']['proposedOwner'] })

            }
            else return sendResponse(res, BADREQUEST, "Only Admin can propose a new owner")
        }
    } catch (error) { errReturned(res, error) }
}


/**
 * Claim ownership by proposedowner
 */
exports.claimOwnership = async (req, res) => {
    try {

        let { transactionHash } = req['body'];

        let receipt = await web3.eth.getTransactionReceipt(transactionHash);
        if (!receipt) return sendResponse(res, BADREQUEST, 'Unable to find Transaction');

        if (TokenAddress.toLowerCase() != receipt['to'].toLowerCase())
            return errReturned(res, 'Sent on invalid Token Address');
        const nonce = Math.floor(Math.random() * 10000000000);

        // let transferInputs = TokenABI.filter(({ name }) => name === 'OwnershipTransferred')[0]['inputs'];
        // let transferParams = web3.eth.abi.decodeLog(transferInputs, receipt['logs'][0]['data'], receipt['logs'][0]['topics']);

        // const publicAddress = await Token.methods.owner().call()
        const result = await Helper.decodeLog(transactionHash, 'OwnershipTransferred')

        if (TokenAddress.toLowerCase() != result['address'].toLowerCase()) return errReturned(res, 'Sent on invalid Token Address');

        let publicAddress = result['returnValues']['newOwner']

        // let block = await web3.eth.getBlock(result['blockNumber'])


        let history = new History({
            publicAddress,
            nonce,
            role: 'admin',
            transactionHash
        });
        await history.save();
        await User.updateOne({ role: 'admin' }, { $set: { publicAddress, updatedAt: Date.now() } }).exec();

        return sendResponse(res, SUCCESS, "Ownership Claimed Successfully", publicAddress);

    } catch (error) { errReturned(res, error) }
}

exports.historyOfOwnerShip = async (req, res) => {
    try {
        let historyOfOwners = await History.find({ role: 'admin' }).sort({ createdAt: -1 })
        return sendResponse(res, SUCCESS, "History Of Ownership", historyOfOwners)
    } catch (error) { errReturned(res, error) }
}

/**
 * Set New Supply Controller
 */
exports.setNewSupplyController = async (req, res) => {
    try {
        let { transactionHash } = req['body'];
        if (!transactionHash) return sendResponse(res, BADREQUEST, "Please send transaction Hash")

        const result = await Helper.decodeLog(transactionHash, 'SupplyControllerSet')

        if (TokenAddress.toLowerCase() != result['address'].toLowerCase()) return errReturned(res, 'Sent on invalid Token Address');

        let publicAddress = result['returnValues']['newSupplyController']

        let block = await web3.eth.getBlock(result['blockNumber'])

        let newSupplyController = new History({
            publicAddress: publicAddress,
            role: 'supplyController',
            transactionHash,
            transactionTime: block['timestamp'] * 1000,
        });

        await newSupplyController.save();
        if (!await User.findOne({ role: 'supplyController' })) {
            const nonce = Math.floor(Math.random() * 10000000000);

            let newSupplyControllerUser = new User({
                publicAddress,
                role: 'supplyController',
                transactionHash,
                nonce,
                transactionTime: block['timestamp'] * 1000,
            });
            await newSupplyControllerUser.save();
            return sendResponse(res, SUCCESS, "Supply Controller Set Successfully", publicAddress);
        }
        await User.updateOne({ role: 'supplyController' }, { $set: { publicAddress, updatedAt: Date.now() } }).exec();
        return sendResponse(res, SUCCESS, "Supply Controller Updated Successfully", publicAddress);

    } catch (error) { errReturned(res, error) }
}


/**
 * Set New Supply Controller
 */
exports.setNewFeeController = async (req, res) => {
    try {
        let { transactionHash } = req['body'];
        if (!transactionHash) return sendResponse(res, BADREQUEST, "Please send transaction Hash")

        const result = await Helper.decodeLog(transactionHash, 'FeeControllerSet')

        if (TokenAddress.toLowerCase() != result['address'].toLowerCase()) return errReturned(res, 'Sent on invalid Token Address');

        let publicAddress = result['returnValues']['newFeeController']

        let block = await web3.eth.getBlock(result['blockNumber'])

        let newFeeController = new History({
            publicAddress,
            role: 'feeController',
            transactionHash,
            transactionTime: block['timestamp'] * 1000,
        });

        await newFeeController.save();
        // await User.updateOne({ role: 'feeController' }, { $set: { publicAddress, updatedAt: Date.now() } }).exec();

        if (!await User.findOne({ role: 'feeController' })) {
            const nonce = Math.floor(Math.random() * 10000000000);

            let newFeeControllerUser = new User({
                publicAddress,
                role: 'feeController',
                transactionHash,
                nonce,
                transactionTime: block['timestamp'] * 1000,
            });
            await newFeeControllerUser.save();
            return sendResponse(res, SUCCESS, "Fee Controller Set Successfully", publicAddress);
        }

        await User.updateOne({ role: 'feeController' }, { $set: { publicAddress, updatedAt: Date.now() } }).exec();
        return sendResponse(res, SUCCESS, "Fee Controller Updated Successfully", publicAddress);


    } catch (error) { errReturned(res, error) }
}


/**
 * Set AP Controller
 */
exports.setNewAssetProtector = async (req, res) => {
    try {
        let { transactionHash } = req['body'];
        if (!transactionHash) return sendResponse(res, BADREQUEST, "Please send transaction Hash")

        const result = await Helper.decodeLog(transactionHash, 'AssetProtectionRoleSet')

        if (TokenAddress.toLowerCase() != result['address'].toLowerCase()) return errReturned(res, 'Sent on invalid Token Address');

        let publicAddress = result['returnValues']['newAssetProtectionRole']

        let block = await web3.eth.getBlock(result['blockNumber'])

        let newFeeController = new History({
            publicAddress,
            role: 'assetProtector',
            transactionHash,
            transactionTime: block['timestamp'] * 1000,
        });

        await newFeeController.save();

        if (!await User.findOne({ role: 'assetProtector' })) {
            const nonce = Math.floor(Math.random() * 10000000000);

            let newAssetControllerUser = new User({
                publicAddress,
                role: 'assetProtector',
                transactionHash,
                nonce,
                transactionTime: block['timestamp'] * 1000,
            });
            await newAssetControllerUser.save();
            return sendResponse(res, SUCCESS, "Asset Controller Set Successfully", publicAddress);
        }
        await User.updateOne({ role: 'assetProtector' }, { $set: { publicAddress, updatedAt: Date.now() } }).exec();
        return sendResponse(res, SUCCESS, "Asset Controller Updated Successfully", publicAddress);




        await User.updateOne({ role: 'assetProtector' }, { $set: { publicAddress, updatedAt: Date.now() } }).exec();

        return sendResponse(res, SUCCESS, "Asset Protector Set Successfully", publicAddress);


    } catch (error) { errReturned(res, error) }
}

/**
 * Set Freeze Addressses
 */
exports.freezeAddress = async (req, res) => {
    try {
        let { transactionHash } = req['body'];
        if (!transactionHash) return sendResponse(res, BADREQUEST, "Please send transaction Hash")

        // let receipt = await web3.eth.getTransactionReceipt(transactionHash);
        // if (!receipt) return sendResponse(res, BADREQUEST, 'Unable to find Transaction');

        // if (TokenAddress.toLowerCase() != receipt['to'].toLowerCase())
        //     return errReturned(res, 'Sent on invalid Token Address');

        // let event = await Token.getPastEvents('AddressFrozen', { fromBlock: 0, toBlock: 'latest' });
        // let block = await web3.eth.getBlock(receipt['blockNumber'])

        // let current = event[event.length - 1]
        // console.log(current);
        // const publicAddress = current['returnValues']['addr']



        const result = await Helper.decodeLog(transactionHash, 'AddressFrozen')

        if (TokenAddress.toLowerCase() != result['address'].toLowerCase()) return errReturned(res, 'Sent on invalid Token Address');

        let publicAddress = result['returnValues']['addr']
        // return sendResponse(res, BADREQUEST, "SSS", result['returnValues'])

        let block = await web3.eth.getBlock(result['blockNumber'])

        const alreadyAddedAddress = await Freeze.findOne({ publicAddress })
        if (!alreadyAddedAddress) {
            let newFreezeAddress = new Freeze({
                publicAddress,
                transactionHash,
                transactionTime: block['timestamp'] * 1000,
            });

            await newFreezeAddress.save();
            return sendResponse(res, SUCCESS, "Address Freezed Successfully", publicAddress);
        }
        else { return sendResponse(res, SUCCESS, " Address is already Frozen", publicAddress) }        // await User.updateOne({ role: 'assetProtector' }, { $set: { publicAddress, updatedAt: Date.now() } }).exec();

    } catch (error) { errReturned(res, error) }
}

/**
 *  UnFreeze Address
 */
exports.unFreezeAddress = async (req, res) => {
    try {
        let { transactionHash } = req['body'];
        if (!transactionHash) return sendResponse(res, BADREQUEST, "Please send transaction Hash")

        // let receipt = await web3.eth.getTransactionReceipt(transactionHash);
        // if (!receipt) return sendResponse(res, BADREQUEST, 'Unable to find Transaction');

        // if (TokenAddress.toLowerCase() != receipt['to'].toLowerCase())
        //     return errReturned(res, 'Sent on invalid Token Address');

        // let transferInputs = TokenABI.filter(({ name }) => name === 'AddressUnfrozen')[0]['inputs'];
        // let transferParams = web3.eth.abi.decodeLog(transferInputs, receipt['logs'][0]['data'], receipt['logs'][0]['topics']);

        // const publicAddress = transferParams['addr']

        const result = await Helper.decodeLog(transactionHash, 'AddressUnfrozen')

        if (TokenAddress.toLowerCase() != result['address'].toLowerCase()) return errReturned(res, 'Sent on invalid Token Address');

        let publicAddress = result['returnValues']['addr']


        const alreadyAddedAddress = await Freeze.findOne({ publicAddress })
        if (!alreadyAddedAddress) return sendResponse(res, BADREQUEST, "Address was not already frozen")
        await Freeze.deleteOne({ publicAddress: publicAddress })

        return sendResponse(res, SUCCESS, "Address UnFreezed Successfully", publicAddress);

    } catch (error) { errReturned(res, error) }
}


/**
 * Set Unfreeze Address Controller
 */
exports.getFreezedAddresses = async (req, res) => {
    try {
        let freezedAddresses = await Freeze.find({})

        return sendResponse(res, SUCCESS, "Freezed Addresses", freezedAddresses);


    } catch (error) { errReturned(res, error) }
}


/**
 * Token Public Variables
 */
exports.TokenPublicVariables = async (req, res) => {

    try {
        let response = await Promise.all([
            await Token.methods.owner().call(),
            await Token.methods.name().call(),
            await Token.methods.symbol().call(),
            await Token.methods.decimals().call(),
            await Token.methods.proposedOwner().call(),
            await Token.methods.paused().call(),
            await Token.methods.assetProtectionRole().call(),
            await Token.methods.supplyController().call(),
            await Token.methods.feeDecimals().call(),
            await Token.methods.feeParts().call(),
            await Token.methods.feeRate().call(),
            await Token.methods.feeController().call(),
            await Token.methods.feeRecipient().call(),
            await Token.methods.totalSupply().call(),
        ]);


        const owner = response[0];
        const name = response[1];
        const symbol = response[2];
        const decimals = response[3];
        const proposedOwner = response[4];
        const paused = response[5];
        const assetProtector = response[6];
        const supplyController = response[7];
        const feeDecimals = response[8];
        const feeParts = response[9];
        const feeRate = response[10];
        const feeController = response[11];
        const totalSupply = response[12];

        let tokenPublicFunctions = { owner, name, symbol, decimals, proposedOwner, paused, assetProtector, supplyController, feeDecimals, feeParts, feeRate, feeController, totalSupply }
        return sendResponse(res, SUCCESS, "Token Public Variables", tokenPublicFunctions)
    } catch (error) { errReturned(res, error) }
}



/**
 * Sync Roles
 */
exports.syncRoles = async (req, res) => {
    try {
        let response = await Promise.all([

            await Token.methods.owner().call(),
            await Token.methods.assetProtectionRole().call(),
            await Token.methods.supplyController().call(),
            await Token.methods.feeController().call(),
        ]);

        console.log(await Token.methods.assetProtectionRole().call())

        let result = await Promise.all([

            await User.updateOne({ role: 'admin' }, { $set: { publicAddress: response[0], updatedAt: Date.now() } }).exec(),
            await User.updateOne({ role: 'assetProtector' }, { $set: { publicAddress: response[1], updatedAt: Date.now() } }).exec(),
            await User.updateOne({ role: 'supplyController' }, { $set: { publicAddress: response[2], updatedAt: Date.now() } }).exec(),
            await User.updateOne({ role: 'feeController' }, { $set: { publicAddress: response[3], updatedAt: Date.now() } }).exec()
        ]);

        return sendResponse(res, SUCCESS, "SYNCED FROM BLOCKCHAIN")
    } catch (error) {
        errReturned(res, error)
    }
}

/**
 * Create Liquidity Pool
 */
exports.createLiquidityPool = async (req, res) => {
    try {

        
        
        return sendResponse(res, BADREQUEST, "I am a BadRequest", TokenAddress)

    } catch (error) { errReturned(res, error) }
}