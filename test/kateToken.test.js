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


contract("KateToken", (accounts) => {

    const deploy = async (accounts) => {
        if (Array.isArray(accounts)) 
            accounts = await verboseAccounts(accounts);     
        const { kateToken } = await deployMock(accounts);
        // console.log("kateToken", kateToken.methods)
        return kateToken;
    }
        
    describe("Construction", () => {

        it("should match name/symbol/totalSupply/decimals/owner succesfully", async () => {
           
            const kateToken = await deploy(accounts);
            
            console.log('methods', kateToken.methods)
    
            assert.equal(await kateToken.name(), "KateToken");
            assert.equal(await kateToken.symbol(), "KTN");
            assertBn(await kateToken.decimals(), 18);
            assert.equal(await kateToken.owner(), accounts[0]);

            console.log('name', await kateToken.name());
            console.log('symbol', await kateToken.symbol());
            log(await kateToken.decimals());
            console.log('owner', await kateToken.owner());
            console.log('totalSupply', fromWei(await kateToken.totalSupply()));
    
            // assertBn(fromWei(await kateToken.totalSupply()), 1000000);
        })

        it("should give the owner 1M tokens", async () => {

            const kateToken = await deploy(accounts);
           
            let balance = fromWei(await kateToken.balanceOf(accounts[0]));
            console.log('owner balance', balance);

            assert.equal(balance, 1000000, 'Balances not equal, exact 1M tokens have not been trasfered to owner');
        });

        it("no other than owner's account should have any balance", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            console.log('accountsArrray: ', accountsArray);
            console.log('accountsArrray.length: ', accountsArray.length);

            for(let i=1; i<accountsArray.length; i++) {

                console.log(`${i}, ${accountsArray[i][0]}, ${accountsArray[i][1]} `);
                let balance = fromWei(await kateToken.balanceOf(accountsArray[i][1]));
                console.log(`${accountsArray[i][0]}: ${accountsArray[i][1]} balance`, balance);

                assert.equal(balance, 0, `Balance of account ${accountsArray[i][0]}:${accountsArray[i][1]} not zero`);
            };
        });

        it("no account should have any allowance at KateToken Contract", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            // console.log('accountsArrray: ', accountsArray);
            // console.log('accountsArrray.length: ', accountsArray.length);

            for(let i=0; i<accountsArray.length; i++) {
                let allowance = fromWei(await kateToken.allowance(accountsArray[i][1], kateToken.address));
                console.log(`${accountsArray[i][0]}: ${accountsArray[i][1]} allowance:`, allowance);

                assert.equal(allowance, 0, `Allowance of account ${accountsArray[i][1]} not zero`)
            };
        });

        it("no account should have any allowance at any other account", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            // console.log('accountsArrray: ', accountsArray);
            // console.log('accountsArrray.length: ', accountsArray.length);

            for(let i=0; i<accountsArray.length; i++) {
                for (let j=0; j<accountsArray.length; j++) {
                  
                  let allowance = fromWei(await kateToken.allowance(accountsArray[i][1], accountsArray[j][1]));     
          
                //   console.log(`${accountsArray[i][1]} allowance to ${accountsArray[j][1]}`, allowance);
                  assert.equal(allowance, 0, `Allowance of account ${accountsArray[i][1]} not zero`);
                };
            };
        });

        it("the contract should be unpaused right after construction", async () => {

            const kateToken = await deploy(accounts);

            assert.equal(await kateToken.paused(), false, `the contract was paused at the construction`);
        });

        it("every address should be unfrozen right after construction/every address should be able to check that", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            for(let i=0; i<accountsArray.length; i++) {

                assert.equal(await kateToken.isFrozen(accountsArray[i][1], {from: accountsArray[i][1]}), false, `the address was frozen at the construction`);
            }
        });
    });

    describe("Transfers", () => {

        it("should transfer 1K tokens between accounts, from owner to any other account", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            let tokenTransfered = 0;
            let ownerBalanceBefore = fromWei(await kateToken.balanceOf(accounts[0]));
            console.log(`Owner's balance BEFORE the transfers is:`, ownerBalanceBefore);

            for(let i=1; i<accountsArray.length; i++) {
                let amount = toWei('1000');
                console.log('amount', typeof(amount), amount);
          
                await kateToken.transfer(accountsArray[i][1], amount, {from: accountsArray[0][1]})
          
                let accountBalance = fromWei(await kateToken.balanceOf(accountsArray[i][1]));
                console.log(`${accountsArray[i][1]}:`, typeof(accountBalance), accountBalance);
          
                // console.log('accountBalance', typeof(accountBalance), accountBalance)
                // convert tokenTransfered from string to number in order to make calculations
                tokenTransfered += parseInt(accountBalance);
                console.log('tokenTransfered until now:', tokenTransfered);
          
                assert.equal(accountBalance, 1000, `${accountsArray[i][1]} balance is not 1k, as expected`);
            };

            let ownerBalanceAfter = fromWei(await kateToken.balanceOf(accounts[0]));
            console.log(`Owner's balance AFTER the transfers is:`, ownerBalanceAfter);

            const ownerBalanceExpected = ownerBalanceBefore - tokenTransfered;

            assert.equal(ownerBalanceExpected, ownerBalanceAfter, `owner's balance is not the tokens before minus the tokens trasfered, as expected`);
        });

        it("should NOT be able to transfer TO address(0)", async () => {

            const kateToken = await deploy(accounts);
            await assertErrors(kateToken.transfer(UNSET_ADDRESS, toWei('1000'), { from: accounts[0] }), 
            'ERC20: transfer to the zero address');      
        });

        // it("should NOT be able to transfer FROM address(0)", async () => {

        //     // καθυστερεί πολύ, δεν εκτελείται η transfer, δε παίρνω error.

        //     const kateToken = await deploy(accounts);
        //     await assertErrors(kateToken.transfer(accounts[0], toWei('1000'), { from: UNSET_ADDRESS }), 
        //     'ERC20: transfer from the zero address'); 
        // });

        it("account should NOT be able to transfer more tokens than it has", async () => {

            const kateToken = await deploy(accounts);

            // make a trasfer from owner to account[1] to have some funds
            let ownerBalanceBefore = fromWei(await kateToken.balanceOf(accounts[0]));
            console.log(`Owner's balance BEFORE the transfer is:`, ownerBalanceBefore);

            await kateToken.transfer(accounts[1], toWei('1000'), {from: accounts[0]})
            let accountBalance = fromWei(await kateToken.balanceOf(accounts[1]));
            console.log(`${accounts[1]} balance is`, accountBalance);

            let ownerBalanceAfter = fromWei(await kateToken.balanceOf(accounts[0]));
            console.log(`Owner's balance AFTER the transfers is:`, ownerBalanceAfter);

            // make a trasfer from account[1] to account[2] with more funds than is has
            await assertErrors(kateToken.transfer(accounts[2], toWei('2000'), { from: accounts[1] }), 'ERC20: transfer amount exceeds balance');

            // check the owner's balance after the transfer
            assert.equal(ownerBalanceAfter, ownerBalanceBefore-1000, `owner's balance is not the tokens before minus the tokens trasfered, as expected`);
        });
    });

    describe("Approvals/Allowance", () => {

        it("all accounts should be able to approve allowance to account0", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            // transfer 1000 tokens TO each account FROM owner
            for(let i=1; i<5; i++) { //δε φτάνει το gasLimit/tx gia για iteration όλων των accounts 
                await kateToken.transfer(accountsArray[i][1], toWei('1000'), {from: accountsArray[0][1]});

                // approve 50 tokens FROM each account TO owner
                let approvalToOwner = await kateToken.approve(accounts[0], toWei('50'), {from: accountsArray[i][1]});
                let allowanceToOwner = fromWei(await kateToken.allowance(accountsArray[i][1], accountsArray[0][1]))
                
                console.log(`status:`, approvalToOwner.receipt.status);
                console.log(`account ${i} balance:`, fromWei(await kateToken.balanceOf(accountsArray[i][1])));
                console.log(`OWNER balance:`, fromWei(await kateToken.balanceOf(accountsArray[0][1])));
                console.log(`account ${i} allowance to owner:`, allowanceToOwner);

                assert.equal(approvalToOwner.receipt.status, true, `approval did not succeed`);
                assert.equal(allowanceToOwner, 50, `allowance different than expected 50 tokens`);
            };
        });

        // it("should NOT be able to approve any allowance FROM address(0)", async () => {

        //     // καθυστερεί επίσης πολύ. Δεν εκτελείται η approve, no error msg
        //     const kateToken = await deploy(accounts);

        //     await assertErrors(kateToken.approve(accounts[0], toWei('1000'), { from: UNSET_ADDRESS }), 
        //     'ERC20: approve from the zero address');  
        // })

        it("should NOT be able to approve any allowance TO address(0)", async () => {

            const kateToken = await deploy(accounts);
            await assertErrors(kateToken.approve(UNSET_ADDRESS, toWei('1000'), { from: accounts[0] }), 'ERC20: approve to the zero address');     
        });

        it("account1 should NOT be able to approve more allowance than available balance to account2", async () => {

            const kateToken = await deploy(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accounts[1], toWei('1000'), {from: accounts[0]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accounts[1])));
            
            // approve 2000 tokens FROM account1 TO account2
            await assertErrors(kateToken.approve(accounts[2], toWei('2000'), {from: accounts[1]}), "allowance amount exceeds owner_'s balance"); 

            let allowanceToAccount = fromWei(await kateToken.allowance(accounts[2], accounts[1]));

            console.log(`account 1 balance:`, fromWei(await kateToken.balanceOf(accounts[1])));
            console.log(`account 2 balance:`, fromWei(await kateToken.balanceOf(accounts[2])));
            console.log(`account 2 allowance to account 1:`, allowanceToAccount);

            assert.equal(allowanceToAccount, 0, `allowance different than zero, as expected`);
        });

        it("account2 should be able to trasferFROM account1 as much as available allowance", async () => {

            const kateToken = await deploy(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accounts[1], toWei('1000'), {from: accounts[0]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accounts[1])));

            // approve 50 tokens FROM account1 TO account2
            let approvalToAccount = await kateToken.approve(accounts[2], toWei('50'), {from: accounts[1]});

            let allowanceToAccountBEFORE = fromWei(await kateToken.allowance(accounts[1], accounts[2]));
            let balanceOfAccount_1_BEFORE = fromWei(await kateToken.balanceOf(accounts[1]));
            let balanceOfAccount_2_BEFORE = fromWei(await kateToken.balanceOf(accounts[2]));
            let balanceOfAccount_3_BEFORE = fromWei(await kateToken.balanceOf(accounts[3]));
            
            console.log(`status:`, approvalToAccount.receipt.status);
            console.log(`account 1 balance BEFORE:`, balanceOfAccount_1_BEFORE);
            console.log(`account 2 balance BEFORE:`, balanceOfAccount_2_BEFORE);
            console.log(`account 3 balance BEFORE:`, balanceOfAccount_3_BEFORE);
            console.log(`account 2 allowance to account 1 BEFORE:`, allowanceToAccountBEFORE);        

            // attempt to transfer 50 tokens FROM account1 to account3, exact as approved allowance 
            let transferFromProccess = await kateToken.transferFrom(accounts[1], accounts[3], toWei('50'), {from: accounts[2]});
            console.log('transferFromProccess:', transferFromProccess.receipt.status)

            // get allowance/balanceOf accounts converted from string to number so as to make calcs in asserts
            let allowanceToAccountAFTER = parseInt(fromWei(await kateToken.allowance(accounts[1], accounts[2])));
            let balanceOfAccount_1_AFTER = parseInt(fromWei(await kateToken.balanceOf(accounts[1])));
            let balanceOfAccount_2_AFTER = parseInt(fromWei(await kateToken.balanceOf(accounts[2])));
            let balanceOfAccount_3_AFTER = parseInt(fromWei(await kateToken.balanceOf(accounts[3])));

            console.log(`account 1 balance AFTER:`, balanceOfAccount_1_AFTER, typeof(balanceOfAccount_1_AFTER));
            console.log(`account 2 balance AFTER:`, balanceOfAccount_2_AFTER, typeof(balanceOfAccount_2_AFTER));
            console.log(`account 3 balance AFTER:`, balanceOfAccount_3_AFTER, typeof(balanceOfAccount_3_AFTER));
            console.log(`account 2 allowance to account 1 AFTER:`, allowanceToAccountAFTER);

            assert.equal(transferFromProccess.receipt.status, true, `transferFrom did not succeed`);
            assert.equal(balanceOfAccount_1_BEFORE, balanceOfAccount_1_AFTER+50, `balance of account1 is not decreased by 50 tokens transfered`);
            assert.equal(balanceOfAccount_3_BEFORE, balanceOfAccount_3_AFTER-50, `balance of account3 is not incerased by 50 tokens transfered`);
            assert.equal(allowanceToAccountBEFORE, allowanceToAccountAFTER+50, `allowance of account2 is not less by 50 tokens transfered, should be zero`);
        });

        it("account2 should NOT be able to trasfer FROM account1 more allowance than available", async () => {

            const kateToken = await deploy(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accounts[1], toWei('1000'), {from: accounts[0]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accounts[1])));

            // approve 50 tokens FROM account1 TO account2
            let approvalToAccount = await kateToken.approve(accounts[2], toWei('50'), {from: accounts[1]});
            let allowanceToAccount = fromWei(await kateToken.allowance(accounts[1], accounts[2]))
            
            console.log(`status:`, approvalToAccount.receipt.status);
            console.log(`account 1 balance:`, fromWei(await kateToken.balanceOf(accounts[1])));
            console.log(`account 2 balance:`, fromWei(await kateToken.balanceOf(accounts[2])));
            console.log(`account 2 allowance to account 1:`, allowanceToAccount);

            // attempt to transfer 100 tokens FROM account1 to account3, more amount than approved allowance 
            await assertErrors(kateToken.transferFrom(accounts[1], accounts[3], toWei('100')), 'ERC20: transfer amount exceeds allowance'); 
        });

        it("account1 should be able to increase allowance to account2", async () => {

            const kateToken = await deploy(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accounts[1], toWei('1000'), {from: accounts[0]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accounts[1])));

            // approve 50 tokens FROM account1 TO account2
            await kateToken.approve(accounts[2], toWei('50'), {from: accounts[1]});

            let allowanceToAccountBEFORE = fromWei(await kateToken.allowance(accounts[1], accounts[2]));        
            console.log(`account 2 allowance to account 1 BEFORE:`, allowanceToAccountBEFORE);        

            // attempt to increase allowance to account2 by 50 tokens
            let increaseAllowanceProccess = await kateToken.increaseAllowance(accounts[2], toWei('50'), {from: accounts[1]});
            console.log('increaseAllowanceProccess', increaseAllowanceProccess.receipt.status);

            // get allowance of account2 converted from string to number so as to make calcs in asserts
            let allowanceToAccountAFTER = parseInt(fromWei(await kateToken.allowance(accounts[1], accounts[2])));        
            console.log(`account 2 allowance to account 1 AFTER:`, allowanceToAccountAFTER);

            assert.equal(increaseAllowanceProccess.receipt.status, true, `proccess to increase allowance did not succeed`);
            assert.equal(allowanceToAccountBEFORE, allowanceToAccountAFTER-50, `allowance of account2 is not increased by 50 tokens approved`);
        });

        it("account1 should be able to decrease allowance to account2", async () => {

            const kateToken = await deploy(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accounts[1], toWei('1000'), {from: accounts[0]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accounts[1])));

            // approve 50 tokens FROM account1 TO account2
            await kateToken.approve(accounts[2], toWei('50'), {from: accounts[1]});

            let allowanceToAccountBEFORE = fromWei(await kateToken.allowance(accounts[1], accounts[2]));        
            console.log(`account 2 allowance to account 1 BEFORE:`, allowanceToAccountBEFORE);        

            // attempt to decrease allowance to account2 by 50 tokens
            let decreaseAllowanceProccess = await kateToken.decreaseAllowance(accounts[2], toWei('50'), {from: accounts[1]});
            console.log('decreaseAllowanceProccess', decreaseAllowanceProccess.receipt.status);

            // get allowance of account2 converted from string to number so as to make calcs in asserts
            let allowanceToAccountAFTER = parseInt(fromWei(await kateToken.allowance(accounts[1], accounts[2])));        
            console.log(`account 2 allowance to account 1 AFTER:`, allowanceToAccountAFTER);

            assert.equal(decreaseAllowanceProccess.receipt.status, true, `proccess to increase allowance did not succeed`);
            assert.equal(allowanceToAccountBEFORE, allowanceToAccountAFTER+50, `allowance of account2 is not decreased by 50 tokens approved, should be zero`);
        });

        it("account1 should NOT be able to decrease allowance more than already availabe to account2", async () => {

            const kateToken = await deploy(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accounts[1], toWei('1000'), {from: accounts[0]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accounts[1])));

            // approve 50 tokens FROM account1 TO account2
            await kateToken.approve(accounts[2], toWei('50'), {from: accounts[1]});

            // attempt to decrease allowance by 100 tokens FROM account1 to account2, more amount than already approved 
            await assertErrors(kateToken.decreaseAllowance(accounts[2], toWei('100'), {from: accounts[1]}), 'ERC20: decreased allowance below zero'); 
        });
    });

    describe("Mint/Burn and onlyOwner modifier", () => {

        it("Owner should be able to mint a token amount", async () => {
            
            const kateToken = await deploy(accounts);

            let ownerBalanceBEFORE = fromWei(await kateToken.balanceOf(accounts[0]));
            let totalSupplyBEFORE = fromWei(await kateToken.totalSupply());

            await kateToken._mint(toWei('1000'), {from: accounts[0]});

            let ownerBalanceAFTER= parseInt(fromWei(await kateToken.balanceOf(accounts[0])));
            let totalSupplyAFTER = parseInt(fromWei(await kateToken.totalSupply()));

            console.log('ownerBalanceBefore', ownerBalanceBEFORE);
            console.log('ownerBalanceAfter', ownerBalanceAFTER);
            console.log('totalSupplyBEFORE', totalSupplyBEFORE);
            console.log('totalSupplyAfter', totalSupplyAFTER);

            assert.equal(ownerBalanceBEFORE, ownerBalanceAFTER-1000, `owner's balance did not increased by minted amount`);
            assert.equal(totalSupplyBEFORE, totalSupplyAFTER-1000, `totalSupply did not increased by minted amount`);     
        })

        it("Owner should be able to burn a token amount", async () => {
            
            const kateToken = await deploy(accounts);

            let ownerBalanceBEFORE = fromWei(await kateToken.balanceOf(accounts[0]));
            let totalSupplyBEFORE = fromWei(await kateToken.totalSupply());

            await kateToken._burn(toWei('1000'), {from: accounts[0]});

            let ownerBalanceAFTER = parseInt(fromWei(await kateToken.balanceOf(accounts[0])));
            let totalSupplyAFTER = parseInt(fromWei(await kateToken.totalSupply()));

            console.log('ownerBalanceBefore', ownerBalanceBEFORE);
            console.log('ownerBalanceAfter', ownerBalanceAFTER);
            console.log('totalSupplyBEFORE', totalSupplyBEFORE);
            console.log('totalSupplyAfter', totalSupplyAFTER);

            assert.equal(ownerBalanceBEFORE, ownerBalanceAFTER+1000, `owner's balance did not decreased by burned amount`);
            assert.equal(totalSupplyBEFORE, totalSupplyAFTER+1000, `totalSupply did not decreased by burned amount`); 
        });

        it("Owner should NOT be able to burn a token amount larger that its available balance", async () => {
            
            const kateToken = await deploy(accounts);

            // Make a transfer to account1 by 500.000 tokens
            let ownerBalance_0 = fromWei(await kateToken.balanceOf(accounts[0]));
            let totalSupply_0 = fromWei(await kateToken.totalSupply());
            await kateToken.transfer(accounts[1], toWei('500000'), {from: accounts[0]});

            let ownerBalance_1 = fromWei(await kateToken.balanceOf(accounts[0]));
            let totalSupply_1 = fromWei(await kateToken.totalSupply());

            // Burn from owner an amount more than owner's balance, less than totalSupply
            await assertErrors(kateToken._burn(toWei('600000'), {from: accounts[0]}), 'ERC20: burn amount exceeds balance'); 

            let ownerBalance_2 = parseInt(fromWei(await kateToken.balanceOf(accounts[0])));
            let totalSupply_2 = parseInt(fromWei(await kateToken.totalSupply()));

            console.log('ownerBalance_0', ownerBalance_0);
            console.log('ownerBalance_1', ownerBalance_1);
            console.log('ownerBalance_2', ownerBalance_2);
            console.log('totalSupply_0', totalSupply_0);
            console.log('totalSupply_1', totalSupply_1);
            console.log('totalSupply_2', totalSupply_2);
        });

        it("No other account than owner should be able to mint a token amount", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            
            // check for every account exept owner's that can not mint tokens 
            for(let i=1; i<accountsArray.length; i++) {
                await assertErrors(kateToken._mint(toWei('1000'), {from: accountsArray[i][1]}), 'Ownable: caller is not the owner'); 
            };
        });

        it("No other account than owner should be able to burn a token amount", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            
            // check for every account exept owner's that can not burn tokens 
            for(let i=1; i<accountsArray.length; i++) {
                await assertErrors(kateToken._burn(toWei('1000'), {from: accountsArray[i][1]}), 'Ownable: caller is not the owner'); 
            };
        });
    });

    describe("Pausable/Freezable", () => {

        it("when contract is unpaused OWNER should be able to pause it", async () => {

            const kateToken = await deploy(accounts);

            // pause the contract
            let pauseIT = await kateToken.mockPause({from: accounts[0]});

            assert.equal(pauseIT.receipt.status, true, `the contract was NOT paused while unpaused by OWNER`);
        });

        it("when contract is paused OWNER should be able to unpause it", async () => {

            const kateToken = await deploy(accounts);

            // pause the contract
            await kateToken.mockPause({from: accounts[0]});

            // unpause the contract
            unPauseIT = await kateToken.mockUnpause({from: accounts[0]});

            assert.equal(unPauseIT.receipt.status, true, `the contract was NOT unpaused while paused by OWNER`);
        });

        it("when contract is unpaused it should NOT be able to unpause it again", async () => {

            const kateToken = await deploy(accounts);
           
            // contract is unpaused, should not be able to unpause it again
            await assertErrors(kateToken.mockUnpause(), 'Pausable: not paused');
        });

        it("when contract is paused it should NOT be able to pause it again", async () => {

            const kateToken = await deploy(accounts);

            // pause the contract
            await kateToken.mockPause();
           
            // should not be able to pause it again
            await assertErrors(kateToken.mockPause(), 'Pausable: paused');
        });

        it("No other account than owner should be able to pause the contract", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            console.log('is paused', await kateToken.paused());
            
            // check for every account exept owner's that can NOT pause the contract 
            for(let i=1; i<accountsArray.length; i++) {
                await assertErrors(kateToken.mockPause({from: accountsArray[i][1]}), 'Ownable: caller is not the owner'); 
            };
        });

        it("No other account than owner should be able to unpause the contract", async () => {
            
            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            // pause the contract
            await kateToken.mockPause();

            console.log('is paused', await kateToken.paused());
            
            // check for every account exept owner's that can NOT pause the contract 
            for(let i=1; i<accountsArray.length; i++) {
                assert.equal(unPauseIT.receipt.status, true, `the contract was NOT unpaused while paused by OWNER`);
            };
        });

        it("Owner should be able to freeze addresses", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
 
            for(let i=0; i<accountsArray.length; i++) {

                let freezeAccount = await kateToken.freeze(accountsArray[i][1], { from: accountsArray[0][1]});

                assert.equal(await kateToken.isFrozen(accountsArray[i][1], {from: accountsArray[i][1]}), true, `the address did NOT froze by executing freeze function`);

                assert.equal(freezeAccount.receipt.status, true, `the freeze proceess was not succesful`);
            };
        });

        it("Owner should be able to unfreeze addresses", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            // freeze all the addresses by Owner to unfreze them next
            for(let i=0; i<accountsArray.length; i++) {

                let freezeAccount = await kateToken.freeze(accountsArray[i][1], { from: accountsArray[0][1]});

                assert.equal(await kateToken.isFrozen(accountsArray[i][1], {from: accountsArray[i][1]}), true, `the address did NOT froze by executing freeze function`);

                assert.equal(freezeAccount.receipt.status, true, `the freeze proceess was not succesful`);
            };

            // unfreeze all the addresses by Owner
            for(let i=0; i<accountsArray.length; i++) {

                let unFreezeAccount = await kateToken.unFreeze(accountsArray[i][1], { from: accountsArray[0][1]});

                assert.equal(await kateToken.isFrozen(accountsArray[i][1], {from: accountsArray[i][1]}), false, `the address did NOT unfroze by executing unFreeze function`);

                assert.equal(unFreezeAccount.receipt.status, true, `the freeze proceess was not succesful`);
            };
        });

        it("No other account than owner should be able to freeze an address", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            // for every account than owner we try to freeze account1
            for(let i=1; i<accountsArray.length; i++) {              

                await assertErrors(kateToken.freeze(accountsArray[1][1], { from: accountsArray[i][1] }), 'Ownable: caller is not the owner');

                assert.equal(await kateToken.isFrozen(accountsArray[1][1]), false, `the address account1 did froze with msg.sender other than the owner`);
            };
        });

        it("No other account than owner should be able to unfreeze an address", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            // freeze account1 to unfreeze it next
            await kateToken.freeze(accountsArray[1][1]);
            console.log('is account1 frozen?', await kateToken.isFrozen(accountsArray[1][1]));

            // for every account than owner we try to unfreeze account1
            for(let i=1; i<accountsArray.length; i++) {              

                await assertErrors(kateToken.unFreeze(accountsArray[1][1], { from: accountsArray[i][1] }), 'Ownable: caller is not the owner');

                assert.equal(await kateToken.isFrozen(accountsArray[1][1]), true, `the address account1 did unfroze with msg.sender other than the owner`);
            };
        });

        it("an Unfrozen address should be able to call whenNotFrozen Function", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            for(let i=1; i<accountsArray.length; i++) { 
                console.log(`is account ${i} frozen?`, await kateToken.isFrozen(accountsArray[i][1]));

                assert.equal(await kateToken.toCheckWhenNotFrozenModifier(accountsArray[i][1]), true, `the unfrozen address ${accountsArray[i][0]} ${accountsArray[i][1]} did not manage to call toCheckWhenNotFrozenModifier function`);
            }
        });

        it("a Frozen address should NOT be able to call whenNotFrozen Function", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            // freeze all addreeses 
            for(let i=1; i<accountsArray.length; i++) { 
                await kateToken.freeze(accountsArray[i][1]);
                console.log(`is account ${i} frozen?`, await kateToken.isFrozen(accountsArray[i][1]));

                await assertErrors(kateToken.toCheckWhenNotFrozenModifier(accountsArray[i][1]), 'Freezable : target is frozen');
            };
        });
    });
});