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
        return kateToken;
    }
        
    describe("Construction", () => {

        it("should match name/symbol/totalSupply/decimals succesfully", async () => {
           
            const kateToken = await deploy(accounts);  
    
            assert.equal(await kateToken.name(), "KateToken");
            assert.equal(await kateToken.symbol(), "KTN");
            assertBn(await kateToken.decimals(), 18);
            // assert.equal(await kateToken.owner(), accounts[0]);
    
            const totalSupply = await kateToken.totalSupply().then(
                res => {return fromWei(res)}
            )
            const decimals = await kateToken.decimals().then(
                res => {return res.toString()}
            )

            console.log('name', await kateToken.name())
            console.log('symbol', await kateToken.symbol())
            console.log('decimals', decimals)
            // console.log('owner', await kateToken.owner())
            console.log('totalSupply', totalSupply)
    
            assertBn(totalSupply, 1000000);
        })

        it("should give the owner 1M tokens", async () => {

            const kateToken = await deploy(accounts);
           
            let balance = await kateToken.balanceOf(accounts[0]);
            balance = fromWei(balance);
            console.log('owner balance', balance);
            assert.equal(balance, 1000000, 'Balances not equal, exact 1M tokens have not been trasfered to owner')
        })

        it("no other than owner's account should have any balance", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            console.log('accountsArrray: ', accountsArray);
            console.log('accountsArrray.length: ', accountsArray.length);

            for(let i=1; i<accountsArray.length; i++) {
                console.log(`${i}, ${accountsArray[i][0]}, ${accountsArray[i][1]} `);
                
                let balance = await kateToken.balanceOf(accountsArray[i][1]);
                balance = fromWei(balance);
          
                console.log(`${accountsArray[i][0]}: ${accountsArray[i][1]} balance`, balance);
                assert.equal(balance, 0, `Balance of account ${accountsArray[i][0]}:${accountsArray[i][1]} not zero`)
              }
        })

        it("no account should have any allowance at KateToken Contract", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            console.log('accountsArrray: ', accountsArray);
            console.log('accountsArrray.length: ', accountsArray.length);

            for(let i=0; i<accountsArray.length; i++) {
                let allowance = await kateToken.allowance(accountsArray[i][1], kateToken.address);
                allowance = fromWei(allowance);
                console.log(`${accountsArray[i][0]}: ${accountsArray[i][1]} allowance:`, allowance);
                assert.equal(allowance, 0, `Allowance of account ${accountsArray[i][1]} not zero`)
              }
        
        })

        it("no account should have any allowance at any other account", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            console.log('accountsArrray: ', accountsArray);
            console.log('accountsArrray.length: ', accountsArray.length);


            for(let i=0; i<accountsArray.length; i++) {
                for (let j=0; j<accountsArray.length; j++) {
                  
                  let allowance = await kateToken.allowance(accountsArray[i][1], accountsArray[j][1]);
                  allowance = fromWei(allowance);     
          
                  console.log(`${accountsArray[i][1]} allowance to ${accountsArray[j][1]}`, allowance);
                  assert.equal(allowance, 0, `Allowance of account ${accountsArray[i][1]} not zero`)
                }
              }       
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })
    
    })

    describe("Transfers", () => {

        it("should transfer 1K tokens between accounts, from owner to any other account", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);

            let tokenTransfered = 0;
            let ownerBalanceBefore = await kateToken.balanceOf(accounts[0]);
            ownerBalanceBefore = fromWei(ownerBalanceBefore);
            console.log(`Owner's balance BEFORE the transfers is:`, ownerBalanceBefore);

            for(let i=1; i<accountsArray.length; i++) {
                let amount = toWei('1000');
                console.log('amount', typeof(amount), amount);
          
                await kateToken.transfer(accountsArray[i][1], amount, {from: accountsArray[0][1]})
          
                let accountBalance = await kateToken.balanceOf(accountsArray[i][1]);
                accountBalance = fromWei(accountBalance);
                console.log(`${accountsArray[i][1]}:`, typeof(accountBalance), accountBalance);
          
                // console.log('accountBalance', typeof(accountBalance), accountBalance)
                tokenTransfered += parseInt(accountBalance);
                console.log('tokenTransfered until now:', tokenTransfered);
          
                assert.equal(accountBalance, 1000, `${accountsArray[i][1]} balance is not 1k, as expected`);
            }

            let ownerBalanceAfter = await kateToken.balanceOf(accounts[0]);
            ownerBalanceAfter = fromWei(ownerBalanceAfter);
            console.log(`Owner's balance AFTER the transfers is:`, ownerBalanceAfter);

            const ownerBalanceExpected = ownerBalanceBefore - tokenTransfered;

            assert.equal(ownerBalanceExpected, ownerBalanceAfter, `owner's balance is not the tokens before minus the tokens trasfered, as expected`);
        })

        it("should NOT be able to transfer TO address(0)", async () => {

            const kateToken = await deploy(accounts);
            await assertErrors(kateToken.transfer(UNSET_ADDRESS, toWei('1000'), { from: accounts[0] }), 
            'ERC20: transfer to the zero address');      
        })

        // it("should NOT be able to transfer FROM address(0)", async () => {

        //     // καθυστερεί πολύ, δεν εκτελείται η transfer, δε παίρνω error. 
        //     // ίσως πρέπει να κάνω implement τη burn function ωστε το zeroAddress να έχει balance??

        //     const kateToken = await deploy(accounts);
        //     await assertErrors(kateToken.transfer(accounts[0], toWei('1000'), { from: UNSET_ADDRESS }), 
        //     'ERC20: transfer from the zero address'); 
        // })

        it("account should NOT be able to transfer more tokens than it has", async () => {

            const kateToken = await deploy(accounts);

            // make a trasfer from owner to account[1] to have some funds
            let ownerBalanceBefore = await kateToken.balanceOf(accounts[0]);
            ownerBalanceBefore = fromWei(ownerBalanceBefore);
            console.log(`Owner's balance BEFORE the transfer is:`, ownerBalanceBefore);

            let amount = toWei('1000');

            await kateToken.transfer(accounts[1], amount, {from: accounts[0]})
            let accountBalance = await kateToken.balanceOf(accounts[1]);
            accountBalance = fromWei(accountBalance);
            console.log(`${accounts[1]} balance is`, accountBalance);

            let ownerBalanceAfter = await kateToken.balanceOf(accounts[0]);
            ownerBalanceAfter = fromWei(ownerBalanceAfter);
            console.log(`Owner's balance AFTER the transfers is:`, ownerBalanceAfter);

            amount = parseInt(fromWei(amount));

            // make a trasfer from account[1] to account[2] with more funds than is has
            await assertErrors(kateToken.transfer(accounts[2], toWei('2000'), { from: accounts[1] }), 
            'ERC20: transfer amount exceeds balance');

            // check the owner's balance after the transfer
            assert.equal(ownerBalanceAfter, ownerBalanceBefore-amount, `owner's balance is not the tokens before minus the tokens trasfered, as expected`);
        })

        it("", async () => {
        
        })
    
    })

    describe("Approvals/Allowance", () => {

        it("all accounts should be able to aproove allowance to account0", async () => {

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
            }
        })

        // it("should NOT be able to aproove any allowance FROM address(0)", async () => {

        //     // καθυστερεί επίσης πολύ. Δεν εκτελείται η approve, no error msg
        //     const kateToken = await deploy(accounts);

        //     await assertErrors(kateToken.approve(accounts[0], toWei('1000'), { from: UNSET_ADDRESS }), 
        //     'ERC20: approve from the zero address');  
        // })

        it("should NOT be able to aproove any allowance TO address(0)", async () => {

            const kateToken = await deploy(accounts);
            await assertErrors(kateToken.approve(UNSET_ADDRESS, toWei('1000'), { from: accounts[0] }), 
            'ERC20: approve to the zero address');     
        })

        // it("account1 should NOT be able to aproove more allowance than available balance to account2", async () => {

        //     const kateToken = await deploy(accounts);
        //     const accountsArray = Object.entries(accounts);
            
        //     // transfer 1000 tokens to account1 FROM owner     
        //     await kateToken.transfer(accountsArray[1][1], toWei('1000'), {from: accountsArray[0][1]});
        //     console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accountsArray[1][1])));

        //     // approve 2000 tokens FROM account1 TO account2
        //     let approvalToAccount = await kateToken.approve(accountsArray[2][1], toWei('2000'), {from: accountsArray[1][1]});

        //     let allowanceToAccount = fromWei(await kateToken.allowance(accountsArray[2][1], accountsArray[1][1]))
            
        //     console.log(`status:`, approvalToAccount.receipt.status);
        //     console.log(`account 1 balance:`, fromWei(await kateToken.balanceOf(accountsArray[1][1])));
        //     console.log(`account 2 balance:`, fromWei(await kateToken.balanceOf(accountsArray[2][1])));
        //     console.log(`account 2 allowance to account 1:`, allowanceToAccount);

        //     assert.equal(approvalToAccount.receipt.status, false, `approval succeded while shouldn't`);
        //     assert.equal(allowanceToAccount, 0, `allowance different than zero, as expected`);

        //     // it accually is possible to approve more allowance than your available balance.
        //     // there is no require check/error msg to ERC20 to prevent this
        // })

        it("account2 should be able to trasferFROM account1 as much as available allowance", async () => {
            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accountsArray[1][1], toWei('1000'), {from: accountsArray[0][1]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accountsArray[1][1])));

            // approve 50 tokens FROM account1 TO account2
            let approvalToAccount = await kateToken.approve(accountsArray[2][1], toWei('50'), {from: accountsArray[1][1]});

            let allowanceToAccountBEFORE = fromWei(await kateToken.allowance(accountsArray[1][1], accountsArray[2][1]));
            let balanceOfAccount_1_BEFORE = fromWei(await kateToken.balanceOf(accountsArray[1][1]));
            let balanceOfAccount_2_BEFORE = fromWei(await kateToken.balanceOf(accountsArray[2][1]));
            let balanceOfAccount_3_BEFORE = fromWei(await kateToken.balanceOf(accountsArray[3][1]));
            
            console.log(`status:`, approvalToAccount.receipt.status);
            console.log(`account 1 balance BEFORE:`, balanceOfAccount_1_BEFORE);
            console.log(`account 2 balance BEFORE:`, balanceOfAccount_2_BEFORE);
            console.log(`account 3 balance BEFORE:`, balanceOfAccount_3_BEFORE);
            console.log(`account 2 allowance to account 1 BEFORE:`, allowanceToAccountBEFORE);        

            // attempt to transfer 50 tokens FROM account1 to account3, exact as approved allowance 
            let transferFromProccess = await kateToken.transferFrom(accountsArray[1][1], accountsArray[3][1], toWei('50'), {from: accountsArray[2][1]});
            console.log('transferFromProccess:', transferFromProccess.receipt.status)

            // get allowance/balanceOf accounts converted from string to number so as to make calcs in asserts
            let allowanceToAccountAFTER = parseInt(fromWei(await kateToken.allowance(accountsArray[1][1], accountsArray[2][1])));
            let balanceOfAccount_1_AFTER = parseInt(fromWei(await kateToken.balanceOf(accountsArray[1][1])));
            let balanceOfAccount_2_AFTER = parseInt(fromWei(await kateToken.balanceOf(accountsArray[2][1])));
            let balanceOfAccount_3_AFTER = parseInt(fromWei(await kateToken.balanceOf(accountsArray[3][1])));

            console.log(`account 1 balance AFTER:`, balanceOfAccount_1_AFTER, typeof(balanceOfAccount_1_AFTER));
            console.log(`account 2 balance AFTER:`, balanceOfAccount_2_AFTER, typeof(balanceOfAccount_2_AFTER));
            console.log(`account 3 balance AFTER:`, balanceOfAccount_3_AFTER, typeof(balanceOfAccount_3_AFTER));
            console.log(`account 2 allowance to account 1 AFTER:`, allowanceToAccountAFTER);

            assert.equal(transferFromProccess.receipt.status, true, `transferFrom did not succeed`);
            assert.equal(balanceOfAccount_1_BEFORE, balanceOfAccount_1_AFTER+50, `balance of account1 is not decreased by 50 tokens transfered`);
            assert.equal(balanceOfAccount_3_BEFORE, balanceOfAccount_3_AFTER-50, `balance of account3 is not incerased by 50 tokens transfered`);
            assert.equal(allowanceToAccountBEFORE, allowanceToAccountAFTER+50, `allowance of account2 is not less by 50 tokens transfered, should be zero`);
        })

        it("account2 should NOT be able to trasfer FROM account1 more allowance than available", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accountsArray[1][1], toWei('1000'), {from: accountsArray[0][1]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accountsArray[1][1])));

            // approve 50 tokens FROM account1 TO account2
            let approvalToAccount = await kateToken.approve(accountsArray[2][1], toWei('50'), {from: accountsArray[1][1]});

            let allowanceToAccount = fromWei(await kateToken.allowance(accountsArray[1][1], accountsArray[2][1]))
            
            console.log(`status:`, approvalToAccount.receipt.status);
            console.log(`account 1 balance:`, fromWei(await kateToken.balanceOf(accountsArray[1][1])));
            console.log(`account 2 balance:`, fromWei(await kateToken.balanceOf(accountsArray[2][1])));
            console.log(`account 2 allowance to account 1:`, allowanceToAccount);

            // assert.equal(approvalToAccount.receipt.status, false, `approval succeded while shouldn't`);
            // assert.equal(allowanceToAccount, 0, `allowance different than zero, as expected`);

            // attempt to transfer 100 tokens FROM account1 to account3, more amount than approved allowance 
            await assertErrors(kateToken.transferFrom(accountsArray[1][1], accountsArray[3][1], toWei('100')), 'ERC20: transfer amount exceeds allowance'); 
        })

        it("account1 should be able to increase allowance to account2", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accountsArray[1][1], toWei('1000'), {from: accountsArray[0][1]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accountsArray[1][1])));

            // approve 50 tokens FROM account1 TO account2
            await kateToken.approve(accountsArray[2][1], toWei('50'), {from: accountsArray[1][1]});

            let allowanceToAccountBEFORE = fromWei(await kateToken.allowance(accountsArray[1][1], accountsArray[2][1]));        
            console.log(`account 2 allowance to account 1 BEFORE:`, allowanceToAccountBEFORE);        

            // attempt to increase allowance to account2 by 50 tokens
            let increaseAllowanceProccess = await kateToken.increaseAllowance(accountsArray[2][1], toWei('50'), {from: accountsArray[1][1]});
            console.log('increaseAllowanceProccess', increaseAllowanceProccess.receipt.status);

            // get allowance of account2 converted from string to number so as to make calcs in asserts
            let allowanceToAccountAFTER = parseInt(fromWei(await kateToken.allowance(accountsArray[1][1], accountsArray[2][1])));        
            console.log(`account 2 allowance to account 1 AFTER:`, allowanceToAccountAFTER);

            assert.equal(increaseAllowanceProccess.receipt.status, true, `proccess to increase allowance did not succeed`);
            assert.equal(allowanceToAccountBEFORE, allowanceToAccountAFTER-50, `allowance of account2 is not increased by 50 tokens approved`);
        })

        it("account1 should be able to decrease allowance to account2", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accountsArray[1][1], toWei('1000'), {from: accountsArray[0][1]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accountsArray[1][1])));

            // approve 50 tokens FROM account1 TO account2
            await kateToken.approve(accountsArray[2][1], toWei('50'), {from: accountsArray[1][1]});

            let allowanceToAccountBEFORE = fromWei(await kateToken.allowance(accountsArray[1][1], accountsArray[2][1]));        
            console.log(`account 2 allowance to account 1 BEFORE:`, allowanceToAccountBEFORE);        

            // attempt to decrease allowance to account2 by 50 tokens
            let decreaseAllowanceProccess = await kateToken.decreaseAllowance(accountsArray[2][1], toWei('50'), {from: accountsArray[1][1]});
            console.log('decreaseAllowanceProccess', decreaseAllowanceProccess.receipt.status);

            // get allowance of account2 converted from string to number so as to make calcs in asserts
            let allowanceToAccountAFTER = parseInt(fromWei(await kateToken.allowance(accountsArray[1][1], accountsArray[2][1])));        
            console.log(`account 2 allowance to account 1 AFTER:`, allowanceToAccountAFTER);

            assert.equal(decreaseAllowanceProccess.receipt.status, true, `proccess to increase allowance did not succeed`);
            assert.equal(allowanceToAccountBEFORE, allowanceToAccountAFTER+50, `allowance of account2 is not decreased by 50 tokens approved, should be zero`);
        })

        it("account1 should NOT be able to decrease allowance more than already availabe to account2", async () => {

            const kateToken = await deploy(accounts);
            const accountsArray = Object.entries(accounts);
            
            // transfer 1000 tokens to account1 FROM owner     
            await kateToken.transfer(accountsArray[1][1], toWei('1000'), {from: accountsArray[0][1]});
            console.log(`account1 balance:`, fromWei(await kateToken.balanceOf(accountsArray[1][1])));

            // approve 50 tokens FROM account1 TO account2
            await kateToken.approve(accountsArray[2][1], toWei('50'), {from: accountsArray[1][1]});

            // attempt to decrease allowance by 100 tokens FROM account1 to account2, more amount than already approved 
            await assertErrors(kateToken.decreaseAllowance(accountsArray[2][1], toWei('100'), {from: accountsArray[1][1]}), 'ERC20: decreased allowance below zero'); 
        
        })
    
    })

    describe("Mint/Burn", () => {

        it("", async () => {
            
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })
    
    })

    describe("Ownable", () => {

        it("", async () => {
        
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })
    
    })

    describe("Pausable", () => {

        it("", async () => {
        
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })

        it("", async () => {
        
        })
    
    })

  

})