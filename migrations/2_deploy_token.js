const ethers = require('ethers');

const Pair = artifacts.require('Pair.sol');
const Router = artifacts.require('Router.sol');
const Factory = artifacts.require('Factory.sol');

const SOAR = artifacts.require('SOAR.sol');
const WBNB = artifacts.require('WBNB.sol');

module.exports = async function done(deployer, network, accounts) {
  try {
    let [_admin, _feeRecipient, receiver1, receiver2] = await web3.eth.getAccounts();                                                     // TODO: Replace me

    /* SOAR Token */
    await deployer.deploy(SOAR);
    const soarToken = await SOAR.deployed();
    console.log('***************************SOAR ContractAddress = ', soarToken.address);

    const factory = await Factory.at('0x6725F303b657a9451d8BA641348b6761A6CC7a17');
    const router = await Router.at('0xD99D1c33F9fC3444f8101754aBC46c52416550D1');
    const wbnbToken = await WBNB.new();

    const pairAddress = await factory.createPair.call(wbnbToken.address, soarToken.address);
    await factory.createPair(wbnbToken.address, soarToken.address);

    // Approve 10000 WBNB Token to Router Address
    await wbnbToken.approve(router.address, 10000);

    // SOAR Token set 9% Fee Percentage and Approve 10000 SOAR to Router Address
    const feePercent = 9;
    let feeParts = await soarToken.feeParts();
    let rate = feePercent * feeParts / 100;
    await soarToken.setFeeRate(rate)
    await soarToken.increaseSupply(_admin, ethers.utils.parseUnits('1000000000000000000', 'ether'));
    await soarToken.approve(router.address, 10000);

    // Add Liquidity to Pair
    await router.addLiquidity(
      wbnbToken.address,
      soarToken.address,
      10000,
      10000,
      10000,
      10000,
      _admin,
      Math.floor(Date.now() / 1000) + 60 * 10
    );
    const pair = await Pair.at(pairAddress);
    const balance = await pair.balanceOf(_admin);
    console.log(`******LP Token Balance: ${balance.toString()}`);

    // Update Fee Recepient
    // await soarToken.setFeeRecipient(_feeRecipient);
    console.log(`*****Admin Address = `, await soarToken.owner());
    // console.log(`*****Fee Recipient = `, await soarToken.feeRecipient());

    // console.log(`**************swapping started`)

    /***************************** **         Swap Tokens with BNB                  *********************************** */
    const addresses = {
      // WBNB: '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F',
      WBNB: wbnbToken.address,
      factory: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
      router: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
      recipient: _admin
    }

    const mnemonic = process['env']['MNEMONIC'];
    const provider = new ethers.providers.WebSocketProvider('wss://apis.ankr.com/wss/075566d0d8f542bea5745e832d630654/e1cac4a93b36fb3626d00ed5bda8aa8e/binance/full/test');
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    const account = wallet.connect(provider);

    const swapRouter = new ethers.Contract(
      addresses.router,
      [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
      ], account
    );

    const mygasPrice = ethers.utils.parseUnits('15', 'gwei');
    const valueToapprove = ethers.utils.parseUnits('1', 'ether');
    await soarToken.approve(swapRouter.address, valueToapprove);

    // Convert SOAR to BNB
    let tokenIn, tokenOut;
    tokenIn = soarToken.address;
    tokenOut = wbnbToken.address;

    const amountIn = ethers.utils.parseUnits('0.01', 'ether');
    const amounts = await swapRouter.getAmountsOut(amountIn, [tokenIn, tokenOut]);

    const amountOutMin = amounts[1].sub(amounts[1].mul(25).div(100));
    console.log(`Buying new token ================= 
      \ntokenIn: ${amountIn} ${tokenIn} (SOAR) 
      \ntokenOut: ${amountOutMin} ${tokenOut} (WBNB)`);

    const txSwap = await swapRouter.swapExactTokensForTokens(
      amountIn, amountOutMin, [tokenIn, tokenOut], addresses.recipient,
      Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
      { gasPrice: mygasPrice, gasLimit: 262445 }
    );
    const receiptSwap = await txSwap.wait();
    console.log('Transaction receipt = ', receiptSwap);
    
    // Receiver 1: Convert Fee into WBNB
    // const feeRecepientWallet = new ethers.Wallet(process['env']['FEE_RECEPIENT_PRIVATE_KEY'], provider);
    // const feeRecepientaccount = feeRecepientWallet.connect(provider);
    // const receiverRouter = new ethers.Contract(
    //   addresses.router, [
    //     'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    //     'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
    //   ], feeRecepientaccount
    // );

    // const feeCollected = (await soarToken.balanceOf(_feeRecipient)).toString();
    // await soarToken.approve(receiverRouter.address, feeCollected, {from: _feeRecipient});
    // console.log('********Fee Recepient SOAR Balance = ', feeCollected);

    // const amountInFirst = feeCollected / 2;
    // const amountsFirst = await receiverRouter.getAmountsOut(amountInFirst, [tokenIn, tokenOut]);
    // const amountOutMinFirst = amountsFirst[1].sub(amountsFirst[1].mul(25).div(100));
    // console.log(`Sending BNB fee to First Collector ================= 
    //   \ntokenIn: ${amountInFirst} ${tokenIn} (SOAR) 
    //   \ntokenOut: ${amountOutMinFirst} ${tokenOut} (WBNB)`);

    // const txSwapFirst = await receiverRouter.swapExactTokensForTokens(
    //   amountInFirst, amountOutMinFirst, [tokenIn, tokenOut], receiver1,
    //   Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    //   { gasPrice: mygasPrice, gasLimit: 262445 }
    // );
    // const receiptSwapFirst = await txSwapFirst.wait();
    // console.log('Transaction receipt First Recepient = ', receiptSwapFirst);

    // const amountIn = ethers.utils.parseUnits('0.01', 'ether');
    // const amounts = await swapRouter.getAmountsOut(amountIn, [tokenIn, tokenOut]);

    // const amountOutMin = amounts[1].sub(amounts[1].mul(25).div(100));
    // console.log(`Buying new token ================= 
    //   \ntokenIn: ${amountIn} ${tokenIn} (SOAR) 
    //   \ntokenOut: ${amountOutMin} ${tokenOut} (WBNB)`);

    // const txSwap = await swapRouter.swapExactTokensForTokens(
    //   amountIn, amountOutMin, [tokenIn, tokenOut], addresses.recipient,
    //   Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    //   { gasPrice: mygasPrice, gasLimit: 262445 }
    // );
    // const receiptSwap = await txSwap.wait();
    // console.log('Transaction receipt = ', receiptSwap);
    
  } catch (error) {
    console.log(`***************error`, error)
  }
};

