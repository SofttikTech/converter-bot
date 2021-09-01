const Factory = artifacts.require('./Factory.sol');
const Router = artifacts.require('./Router.sol');
const Pair = artifacts.require('./Pair.sol');
const Token1 = artifacts.require('./Token1.sol');
// const Token2 = artifacts.require('./Token2.sol');

const TheEllipsisExchange = artifacts.require('./TheEllipsisExchange.sol');

module.exports = async function done(deployer, network, accounts) {
  try {
    console.log(`*********************1`)
    /* The Ellipsis Exchange */
    const _decimals = 18;
    const _name = 'The Ellipsis Exchange';
    const _symbol = 'TEX';
    const _admin = (await web3.eth.getAccounts())[0];                                                     // TODO: Replace me

    await deployer.deploy(TheEllipsisExchange);
    // await deployer.deploy(TheEllipsisExchange);

    const token2 = await TheEllipsisExchange.deployed();

    console.log('***************************The Ellipsis Exchange Address = ', token2.address);

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


    // /* BEP20Token */
    // const _decimals = 18;
    // const _name = 'BEP20Token';
    // const _symbol = 'BEP20';
    // const _admin = (await web3.eth.getAccounts())[0];                                                     // TODO: Replace me

    // await deployer.deploy(BEP20Token, _name, _symbol, _decimals);
    // // await deployer.deploy(BEP20Token);

    // const deployedToken = await BEP20Token.deployed();

    // console.log('***************************BEP20Token Address = ', deployedToken.address);

  } catch (error) {
    console.log(`***************error`, error)
  }

};

