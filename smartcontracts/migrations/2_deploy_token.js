const ethers = require('ethers');

const Factory = artifacts.require('./Factory.sol');
const Router = artifacts.require('./Router.sol');
const Pair = artifacts.require('./Pair.sol');
const Token1 = artifacts.require('./Token1.sol');
// const Token2 = artifacts.require('./Token2.sol');

const SOAR = artifacts.require('./SOAR.sol');

module.exports = async function done(deployer, network, accounts) {
  try {

    console.log(`*********************1`)
    /* SOAR */
    const _decimals = 18;
    const _name = 'SOAR';
    const _symbol = 'SR';
    let _admin = (await web3.eth.getAccounts())[0];                                                     // TODO: Replace me

    await deployer.deploy(SOAR);
    // await deployer.deploy(SOAR);

    const token2 = await SOAR.deployed();

    console.log('***************************SOAR ContractAddress = ', token2.address);

    const [admin, _] = await web3.eth.getAccounts();
    const factory = await Factory.at('0x6725F303b657a9451d8BA641348b6761A6CC7a17');
    const router = await Router.at('0xD99D1c33F9fC3444f8101754aBC46c52416550D1');
    const token1 = await Token1.new();
    // const token2 = await Token2.new({ gas: 5000000 });

    const pairAddress = await factory.createPair.call(token1.address, token2.address);
    const tx = await factory.createPair(token1.address, token2.address);
    await token1.approve(router.address, 10000);
    await token2.unpause();

    // Set 9% Fee Percentage
    const feePercent = 9;
    let feeParts = await token2.feeParts();
    let rate = feePercent * feeParts / 100; // Fee Rate
    await token2.setFeeRate(rate)


    await token2.increaseSupply(_admin, 1000000000);
    await token2.approve(router.address, 10000);
    await router.addLiquidity(
      token1.address,
      token2.address,
      10000,
      10000,
      10000,
      10000,
      admin,
      Math.floor(Date.now() / 1000) + 60 * 10
    );
    const pair = await Pair.at(pairAddress);
    const balance = await pair.balanceOf(admin);
    console.log(`balance LP: ${balance.toString()}`);

    // Check if the token has tax tokens
    let balanceOf = await token2.balanceOf(_admin);
    console.log(`***** balanceOf = `, web3.utils.BN(balanceOf).toString());


    console.log(`**************swapping started`)

    /***************************** **         Swap Tokens with BNB                  *********************************** */
    const addresses = {
      WBNB: '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F',
      //   factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
      //   router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      recipient: _admin
    }

    const wbnb = new ethers.Contract(
      addresses.WBNB,
      [
        'function approve(address spender, uint amount) public returns(bool)',
      ],
      _admin
    );



    // const init = async () => {
    //   const tx = await wbnb.approve(
    //     router.address,
    //     'replace by amount covering several trades'
    //   );
    //   const receipt = await tx.wait();
    //   console.log('Transaction receipt');
    //   console.log(receipt);
    // }

    // factory.on('PairCreated', async (token0, token1, pairAddress) => {
    //   console.log(`
    //     New pair detected
    //     =================
    //     token0: ${token0}
    //     token1: ${token1}
    //     pairAddress: ${pairAddress}
    //   `);

    //The quote currency needs to be WBNB (we will pay with WBNB)
    let tokenIn, tokenOut;
    if (token0 === addresses.WBNB) {
      tokenIn = token0;
      tokenOut = token1;
    }

    console.log(`******* token1 addresses.WBNB`)
    console.log(token1)
    console.log(`********** addresses.WBNB`, addresses.WBNB)
    if (token1 == addresses.WBNB) {
      tokenIn = token1;
      tokenOut = token0;
    }

    // The quote currency is not WBNB
    if (typeof tokenIn === 'undefined') {
      console.log(`**** undefined`)
      return;
    }

    console.log(`******************* 2`)
    //We buy for 0.1 BNB of the new token
    //ethers was originally created for Ethereum, both also work for BSC
    //'ether' === 'bnb' on BSC
    const amountIn = ethers.utils.parseUnits('0.1', 'ether');
    const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
    //Our execution price will be a bit different, we need some flexbility
    const amountOutMin = amounts[1].sub(amounts[1].div(10));
    console.log(`
        Buying new token
        =================
        tokenIn: ${amountIn.toString()} ${tokenIn} (WBNB)
        tokenOut: ${amounOutMin.toString()} ${tokenOut}
      `);
    const txx = await router.swapExactETHForTokens(
      amountIn,
      amountOutMin,
      [tokenIn, tokenOut],
      addresses.recipient,
      Date.now() + 1000 * 60 * 10 //10 minutes
    );
    console.log(`******************* 2`)

    const receipt = await txx.wait();
    console.log('Transaction receipt');
    console.log(receipt);
    // });

    // init();

  } catch (error) {
    console.log(`***************error`, error)
  }

};

