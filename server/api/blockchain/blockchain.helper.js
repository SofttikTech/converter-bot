const User = require("./../user/user.model");
const { Token, TokenAddress, TokenABI } = require("../../config/contract");
const { web3, web3Socket } = require("../../config/web3");

// exports.syncMinters = () => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let event = await Token.getPastEvents('MinterAdded', { fromBlock: 0, toBlock: 'latest' });
//             let minters = await User.find({ role: 'minter' }).select({ publicAddress: 1 }).lean();

//             let databaseMinters = [];
//             minters.forEach(({ publicAddress }) => databaseMinters.push(publicAddress));
//             let blockchainMinters = [];
//             event.forEach(({ returnValues }) => blockchainMinters.push(returnValues['account'].toLowerCase()));

//             for (let minter of blockchainMinters) {
//                 if (!databaseMinters.includes(minter)) {
//                     console.log('This address is not added = ', minter);

//                     const randomNumber = Math.floor(Math.random() * 10000000000);
//                     let newMinter = new User({
//                         publicAddress: minter,
//                         role: 'minter',
//                         nonce: randomNumber
//                     });
//                     await newMinter.save();
//                 }
//             }
//         } catch (e) { reject(e) }
//     });
// }

exports.decodeLog = (txHash, eventName) => {
    return new Promise(async (resolve, reject) => {
        try {
            let event = await Token.getPastEvents(eventName, { fromBlock: 0, toBlock: 'latest' });
            let txDetails = event.filter(({ transactionHash }) => transactionHash === txHash)[0];
            // console.log(`DECODING`)
            // let transferInputs = TokenABI.filter(({ name }) => name === eventName)[0]['inputs'];
            // let transferParams = web3.eth.abi.decodeLog(transferInputs, receipt['logs'][0]['data'], receipt['logs'][0]['topics']);
            
            resolve(txDetails)
        } catch (e) { reject(e) }
    });
}
