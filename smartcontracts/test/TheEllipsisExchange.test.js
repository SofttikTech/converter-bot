import { assert } from 'chai';
import { ether, wei, BN } from './helpers/ether';
import EVMRevert from './helpers/EVMRevert';
import { latestTime } from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

const BigNumber = web3.utils.BN;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .should();

const TheEllipsisExchange = artifacts.require("./TheEllipsisExchange.sol");

contract('TheEllipsisExchange', function ([owner, investor1, investor2, feeController, investor3, investor4]) {

    beforeEach(async function () {
        // Token config
        this.decimals = 18;
        this.symbol = "TEX";
        this.name = "TheEllipsisExchange";

        // Deploy Token
        this.token = await TheEllipsisExchange.new(
            this.name,
            this.symbol,
            this.decimals,
        );

    });

    describe('Token Parameters', function () {
        it('checks the symbol', async function () {
            const symbol = await this.token.symbol();
            symbol.toString().should.be.equal(this.symbol.toString());
        });

        it('checks the name', async function () {
            const name = await this.token.name();
            name.toString().should.be.equal(this.name.toString());
        });

        it('checks the decimals', async function () {
            const decimals = await this.token.decimals();
            decimals.toString().should.be.equal(this.decimals.toString());
        });
    });

    describe('Checks the Increase and Decrease Supply', function () {

        it('owner should be the supplyController', async function () {
            const supplyController = await this.token.getSupplyController();
            supplyController.should.be.equal(owner);
        });

        it('increase and decrease Supply', async function () {
            let totalSupplybeforeIncrease = await this.token.totalSupply();
            await this.token.increaseSupply(owner, ether("10"));
            const totalSupplyAfterIncrease = await this.token.totalSupply();
            assert.isTrue(totalSupplyAfterIncrease > totalSupplybeforeIncrease)
            totalSupplyAfterIncrease.toString().should.be.equal(ether("10").toString())

            /*********** Check balance of the owner and decrease supply ************/
            const balanceOfowner = await this.token.balanceOf(owner);
            totalSupplyAfterIncrease.toString().should.be.equal(balanceOfowner.toString())

            await this.token.decreaseSupply(ether("5"));
            const totalSupplyAfterDecrease = await this.token.totalSupply();
            totalSupplyAfterDecrease.toString().should.be.equal(ether("5").toString())


        });

    });

    // FEE CONTROLLER FUNCTIONALITY

    describe('Checks that the fee is deducted successfully and added in the feeController', function () {

        it('should check that the fee controller is owner', async function () {
            const oldFeeController = await this.token.feeController()
            await this.token.setFeeRecipient(feeController)
            await this.token.setFeeController(feeController)
            const newFeeController = await this.token.feeController()
            oldFeeController.should.not.be.equal(newFeeController)
        });

        it('Set Fee Rate and track the fee', async function () {

            const oldFeeRate = await this.token.feeRate()

            /************** Setting a new Fee Rate & and checks the value for  ************************** */
            const newFeeController = await this.token.feeController()

            await this.token.setFeeRate(wei("200000000000000000000000"))
            const newFeeRate = await this.token.feeRate();

            let getFeeFor = await this.token.getFeeFor(ether("100"))

            /**********************     unpause and  transfer Function and Check the fee is transferred to the fee controller or not       *********************** */
            await this.token.increaseSupply(owner, ether("100"));
            // Transfer 10 tokens to investor 1
            await this.token.unpause()

            // Change the FeeController & FeeReceipt
            await this.token.setFeeRecipient(feeController)
            await this.token.setFeeController(feeController)

            // check fee controller address and balance
            await this.token.transfer(investor1, ether("10"))
            const balanceAfterTransferInvestor1 = await this.token.balanceOf(investor1);
            const balanceAfterTransferOwner = await this.token.balanceOf(owner);
            const balanceAfterTransferFeeController = await this.token.balanceOf(feeController);
            balanceAfterTransferInvestor1.toString().should.be.equal(ether("8").toString())
            balanceAfterTransferOwner.toString().should.be.equal(ether("90").toString())
            balanceAfterTransferFeeController.toString().should.be.equal(ether("2").toString())
        });

    });

    // ASSET PROTECTION FUNCTIONALITY
    describe('Checks the asset protection', async function () {

        it('checks and track the asset protection role', async function () {
            this.amount = ether("50");

            await this.token.increaseSupply(owner, ether("100"));
            this.totalSupply = await this.token.totalSupply();
            // console.log(BN(wei(this.totalSupply)))

            // unpause & transfer
            await this.token.unpause()
            await this.token.transfer(investor2, this.amount)

            await this.token.setAssetProtectionRole(investor2)
            let assetProtectionRole = await this.token.assetProtectionRole();
            assetProtectionRole.should.be.equal(investor2)

            const balanceOfInvestor2 = await this.token.balanceOf(assetProtectionRole);
            // console.log(BN(wei(balanceOfInvestor2)))

        });
    });

    describe('Checks the minting on other addresses', async function () {
        it.only('checks the total supply and balance of investors', async function () {
            const supplyController = await this.token.getSupplyController();
            supplyController.should.be.equal(owner);

            const beforeTotalSupply = await this.token.totalSupply();
            const balanceBeforeMinting = await this.token.balanceOf(investor1);

            const { logs } = await this.token.increaseSupply(investor1, ether("10"));

            const afterTotalSupply = await this.token.totalSupply();
            const balanceAfterMinting = await this.token.balanceOf(investor1);

            let event = await this.token.getPastEvents('Transfer', { fromBlock: 0, toBlock: 'latest' });

            console.log(event)
        });
    });
});