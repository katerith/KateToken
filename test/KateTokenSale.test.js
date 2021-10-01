const {
    // Deployment Function
    deployMock,
  
    // Testing Utilities
    log,
    assertBn,
    assertEvents,
    assertErrors,
    UNSET_ADDRESS,
    TEN_UNITS,
  
    // Library Functions
    parseUnits,
    getNativeBalance,
    verboseAccounts,
    big,
    time,
    fromWei,
    toWei,
  
    // Project Specific Constants
    PROJECT_CONSTANTS,
    DEFAULT_CONFIGS,
} = require("./utils")(artifacts);
  
  
const { web3 } = require("@openzeppelin/test-helpers/src/setup");


contract("KateTokenSale", (accounts) => {

    const deployKateTokenSale = async (accounts) => {
        if (Array.isArray(accounts)) 
            accounts = await verboseAccounts(accounts);     
        const { kateTokenSale } = await deployMock(accounts);
        // console.log("kateToken", kateToken.methods)
        return kateTokenSale;
    }

    const deployKateToken = async (accounts) => {
        if (Array.isArray(accounts)) 
            accounts = await verboseAccounts(accounts);     
        const { kateToken } = await deployMock(accounts);
        // console.log("kateToken", kateToken.methods)
        return kateToken;
    }

    const tokensPerEth = 1000; // token price for 1 ETH
    const buyer = accounts[1];
    const owner = accounts[0];

    describe("Construction", () => {

        it("should pass addresses and match owner/kateTokens per ether succesfully", async () => {

            const kateTokenSale = await deployKateTokenSale(accounts);
            console.log('methods', kateTokenSale.methods);

            console.log('kateTokenSale.address', kateTokenSale.address);
            console.log('OWNER', await kateTokenSale.owner());
            console.log('accounts[0]', accounts[0]);

            let KateTokenAddress = await kateTokenSale.kateToken();
            console.log('address', KateTokenAddress)

            assert.equal(await kateTokenSale.owner(), accounts[0]);
            assert.notEqual(kateTokenSale.address, 0x0, 'KateToken Contract was not deployed succesfully, its addresss is address(0)')
            assert.notEqual(KateTokenAddress, 0x0, 'KateTokenSale Contract address was not passed succesfully, its addresss is address(0)')
            assert.equal(await kateTokenSale.tokensPerEth(), 1000, 'price different than expected, 1000000000000000 in Wei, 0.001 ether')
        });

        it("should fail if msg.value is zero", async () => {

            const kateTokenSale = await deployKateTokenSale(accounts);
        
            await assertErrors(kateTokenSale.buyTokens({ from: buyer, value: 0 }), 'KateTokenSale: msg.value not enough to buy Tokens');
        });

        it("should fail if account is buying more tokens than available in the owner's balance", async () => {

            const kateToken = await deployKateToken(accounts);
            const kateTokenSale = await deployKateTokenSale(accounts);
            let numberOfTokens = '101';
            value = (numberOfTokens/tokensPerEth).toString();
            console.log(value, typeof(value));

            console.log('owner 1', fromWei(await kateToken.balanceOf(owner)));
            console.log('buyer 1', fromWei(await kateToken.balanceOf(buyer)));

            // transfer to kateTokenSale contract 100 tokens from owner
            await kateToken.transfer(kateTokenSale.address, toWei('100', {from: owner}))

            console.log('owner 2', fromWei(await kateToken.balanceOf(owner)));
            console.log('buyer 2', fromWei(await kateToken.balanceOf(buyer)));

            await assertErrors(kateTokenSale.buyTokens({ from: buyer, value: toWei(value) }), 'KateTokenSale: not enough tokens to buy');
        })

        // problem
        it("selling tokens with success/emit Sell event/track tokensSoldand buyer-owner balances", async () => {

            const kateToken = await deployKateToken(accounts);
            const kateTokenSale = await deployKateTokenSale(accounts);

            log(await kateTokenSale.kateTokensSold());
            log(await kateToken.balanceOf(owner));
            log(await kateToken.balanceOf(kateTokenSale.address));
            log(await kateToken.balanceOf(buyer));

            // transfer to the kateTokenSale contract 900.000/1.000.000 tokens from owner
            let contractTransfer = await kateToken.transfer(kateTokenSale.address, toWei('900000'), {from: owner});

            console.log('transfer', contractTransfer);

            log(await kateTokenSale.kateTokensSold());
            log(await kateToken.balanceOf(owner));
            log(await kateToken.balanceOf(kateTokenSale.address));
            log(await kateToken.balanceOf(buyer));
            console.log('buyer eth', fromWei(await web3.eth.getBalance(buyer)))
            
            let tokensBought = await kateTokenSale.buyTokens({ from: buyer, value: toWei('1') })

            // log(await kateTokenSale.kateTokensSold());
            // log(await kateToken.balanceOf(owner));
            // log(await kateToken.balanceOf(kateTokenSale.address));
            // log(await kateToken.balanceOf(buyer));

            // console.log('tokensBought', tokensBought)
            
            // sell event
            // assertEvents(tokensBought.logs, kateTokenSale.Sell);
            // assert.equal(tokensBought.logs.length, 1, "event not unique");
            // assert.equal(tokensBought.logs[0].args._buyer, buyer, "buyer was not the expected");
            // assert.equal(tokensBought.logs[0].args._amount, numberOfTokens, "number of tokens bought are not 10");
        });

        // problem
        it("should transfer to the buyer the amount of tokens bought", async () => {

            const kateToken = await deployKateToken(accounts);
            const kateTokenSale = await deployKateTokenSale(accounts);
            let numberOfTokens = '100';
            value = (numberOfTokens/tokensPerEth).toString();
            console.log(value, typeof(value));

            console.log('owner 1', fromWei(await kateToken.balanceOf(owner)));
            console.log('contract 1', fromWei(await kateToken.balanceOf(kateTokenSale.address)));
            console.log('buyer 1', fromWei(await kateToken.balanceOf(buyer)));

            // transfer to kateTokenSale contract 500.000 tokens from owner
            await kateToken.transfer(kateTokenSale.address, toWei('500000'), {from: owner})

            console.log('owner 2', fromWei(await kateToken.balanceOf(accounts[0])));
            console.log('contract 2', await fromWei(await kateToken.balanceOf(kateTokenSale.address)));
            console.log('buyer 2', fromWei(await kateToken.balanceOf(buyer)));

            await kateTokenSale.buyTokens({ from: buyer, value: toWei(value) });

            console.log('owner 3', fromWei(await kateToken.balanceOf(accounts[0])));
            console.log('contract 3', await fromWei(await kateToken.balanceOf(kateTokenSale.address)));
            console.log('buyer 3', fromWei(await kateToken.balanceOf(buyer)));
        });
    });
});

