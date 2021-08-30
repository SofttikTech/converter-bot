/**
 * Populate DB with sample data on server start
 * to disable, and set `seedDB: false`
 */

'use strict';

const User = require('../api/user/user.model');
const History = require('../api/blockchain/history.model');

const randomNumber = Math.floor(Math.random() * 10000000000);
const randomNumberForSupplier = Math.floor(Math.random() * 10000000000);
const randomNumberForFeeController = Math.floor(Math.random() * 10000000000);
const randomNumberForAssetProtector = Math.floor(Math.random() * 10000000000);

/*  Create Admin  */
User.findOne({ role: 'admin' }).exec(async (error, adminFound) => {
    if (!adminFound) {
        let adminObj = new User({
            "role": "admin",
            "nonce": randomNumber,
            "publicAddress": process.env.ADMIN_PUBLIC_ADDRESS
        });
        await adminObj.save()
        console.log('Admin Created');
    };
});

/*  Create SupplyController  */
// User.findOne({ role: 'supplyController' }).exec(async (error, adminFound) => {
//     if (!adminFound) {
//         let adminObj = new User({
//             "role": "supplyController",
//             "nonce": randomNumberForSupplier,
//             "publicAddress": process.env.ADMIN_PUBLIC_ADDRESS
//         });
//         await adminObj.save()
//         console.log('Supply Controller Created');
//     };
// });


/*  Create FeeController  */
// User.findOne({ role: 'feeController' }).exec(async (error, adminFound) => {
//     if (!adminFound) {
//         let adminObj = new User({
//             "role": "feeController",
//             "nonce": randomNumberForFeeController,
//             "publicAddress": process.env.ADMIN_PUBLIC_ADDRESS
//         });
//         await adminObj.save()
//         console.log('Fee Controller Created');
//     };
// });


/*  Create assetProtector  */
// User.findOne({ role: 'assetProtector' }).exec(async (error, adminFound) => {
//     if (!adminFound) {
//         let adminObj = new User({
//             "role": "assetProtector",
//             "nonce": randomNumberForAssetProtector,
//             "publicAddress": process.env.ADMIN_PUBLIC_ADDRESS
//         });
//         await adminObj.save()
//         console.log('Asset Protector Created');
//     };
// });


/********************************Roles History ******************************** */
/** Create SupplyControllerHistory */

History.findOne({ role: 'supplyController' }).exec(async (error, adminFound) => {
    if (!adminFound) {
        let adminObj = new History({
            "role": "supplyController",
            "publicAddress": process.env.ADMIN_PUBLIC_ADDRESS
        });

        await adminObj.save()
        console.log('Supply Controller History Created');
    };
});


/** Create Owner History */
History.findOne({ role: 'admin' }).exec(async (error, adminFound) => {
    if (!adminFound) {
        let adminObj = new History({
            "role": "admin",
            "publicAddress": process.env.ADMIN_PUBLIC_ADDRESS
        });

        await adminObj.save()
        console.log('Owner History Created');
    };
});

/** Create FeeController History */
History.findOne({ role: 'feeController' }).exec(async (error, adminFound) => {
    if (!adminFound) {
        let adminObj = new History({
            "role": "feeController",
            "publicAddress": process.env.ADMIN_PUBLIC_ADDRESS
        });

        await adminObj.save()
        console.log('FeeController History Created');
    };
});


/** Create AssetProtector History */
History.findOne({ role: 'assetProtector' }).exec(async (error, adminFound) => {
    if (!adminFound) {
        let adminObj = new History({
            "role": "assetProtector",
            "publicAddress": process.env.ADMIN_PUBLIC_ADDRESS
        });

        await adminObj.save()
        console.log('AssetProtector History Created');
    };
});