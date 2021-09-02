import { assert } from 'chai';
const assertRevert = require('./helpers/assertRevert');

const TheEllipsisExchange = artifacts.require("./TheEllipsisExchange.sol");


// Test that the TEX contract can reclaim TEX it has received.
// Note that the contract is not payable in Eth.
contract('CanReclaimFunds', function ([_, admin, owner, assetProtectionRole, anyone]) {
    const amount = 100;

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

        await this.token.proposeOwner(owner, { from: _ })
        await this.token.claimOwnership({ from: owner })

        await this.token.setSupplyController(owner, { from: owner })

        await this.token.unpause({ from: owner });
        await this.token.increaseSupply(owner, amount, { from: owner });

        // Send token to the contract
        await this.token.transfer(this.token.address, amount, { from: owner });
        const balance = await this.token.balanceOf(owner);
        assert.equal(0, balance.toNumber());
        const contractBalance = await this.token.balanceOf(this.token.address);
        assert.equal(amount, contractBalance);

        // freeze the contract address to mimick the current state on mainnet
        await this.token.setAssetProtectionRole(assetProtectionRole, { from: owner });
        await this.token.freeze(this.token.address, { from: assetProtectionRole });
    });

    it('should not accept Eth', async function () {
        await assertRevert(
            web3.eth.sendTransaction({ from: owner, to: this.token.address, value: amount })
        );
    });

    it('should allow owner to reclaim tokens', async function () {
        await this.token.reclaimTEX({ from: owner });

        const balance = await this.token.balanceOf(owner);
        assert.equal(amount, balance);
        const contractBalance = await this.token.balanceOf(this.token.address);
        assert.equal(0, contractBalance);
    });

    it('should allow only owner to reclaim tokens', async function () {
        await assertRevert(
            this.token.reclaimTEX({ from: anyone })
        );
    });
});
