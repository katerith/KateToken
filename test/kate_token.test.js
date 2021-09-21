// const {
//   // Deployment Function
//   deployMock,

//   // Testing Utilities
//   log,
//   assertBn,
//   assertEvents,
//   assertErrors,
//   UNSET_ADDRESS,
//   TEN_UNITS,

//   // Library Functions
//   parseUnits,
//   getNativeBalance,
//   verboseAccounts,
//   big,
//   time,
//   fromWei,
//   toWei,

//   // Project Specific Constants
//   PROJECT_CONSTANTS,
//   DEFAULT_CONFIGS,
// } = require("./utils")(artifacts);


// const { web3 } = require("@openzeppelin/test-helpers/src/setup");


// /*
//  * uncomment accounts to access the test accounts made available by the
//  * Ethereum client
//  * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
//  */
// contract("KateToken", (accounts) => {
//   // console.log('accounts KateToken', accounts)

//   // // let kateToken;
//   // // const owner = accounts[0];
//   // // const zeroAddress = '0x0000000000000000000000000000000000000000';

//   // // before( async () => {
//   // //   kateToken = await KateToken.deployed();
//   // //   console.log('kateToken', kateToken.methods);
//   // // })

//   // it.only("should match name/symbol/totalSupply/decimals succesfully", async () => {

//   //   if (Array.isArray(accounts)) 
//   //       accounts = await verboseAccounts(accounts);
            
//   //   const { kateToken } = await deployMock(accounts);
//   //   console.log('katetoken', kateToken.methods)
//   //   console.log('accounts.owner', accounts.owner)


//   //   assert.equal(await kateToken.name(), "KateToken");
//   //   assert.equal(await kateToken.symbol(), "KTN");
//   //   assertBn(await kateToken.decimals(), 18);
//   //   assert.equal(await kateToken.owner(), accounts.owner);

//   //   const totalSupply = await kateToken.totalSupply().then(
//   //     res => {
//   //       console.log('fromWei(res)', fromWei(res))
//   //       return fromWei(res)
//   //     }
//   //   )
//   //   console.log('totalSupply', totalSupply)

//   //   assertBn(totalSupply, 1000000);
//   // });

//   // it("should give the owner 1M tokens", async () => {
//   //   let balance = await kateToken.balanceOf(owner);
//   //   balance = web3.utils.fromWei(balance, 'ether');
//   //   console.log('owner balance', balance);
//   //   const balanceExpected = 1000000;
//   //   assert.equal(balanceExpected, balance, 'Balances not equal, exact 1M tokens have not been trasfered to owner')
//   // })

//   // it("right after construction no other than owner's account should have any balance", async () => {
//   //   console.log('owner: ', owner);
//   //   console.log('accounts: ', accounts);
//   //   console.log('accounts.length: ', accounts.length);

//   //   for(let i=1; i<accounts.length; i++) {
//   //     console.log(`i`, i);
//   //     let balance = await kateToken.balanceOf(accounts[i]);
//   //     balance = web3.utils.fromWei(balance, 'ether');
      
//   //     console.log(`${accounts[i]} balance`, balance);
//   //     const balanceExpected = 0;
//   //     assert.equal(balanceExpected, balance, `Balance of account ${accounts[i]} not zero`)
//   //   }
    
//   // })

//   // it("right after construction no account should have any allowance at KateToken Contract", async () => {

//   //   for(let i=0; i<accounts.length; i++) {
//   //     console.log(`i`, i);
//   //     console.log(`kateToken.address`, kateToken.address);
//   //     let allowance = await kateToken.allowance(accounts[i], kateToken.address);
//   //     allowance = web3.utils.fromWei(allowance, 'ether');
//   //     console.log(`${accounts[i]} allowance`, allowance);
//   //     const allowanceExpected = 0;
//   //     assert.equal(allowanceExpected, allowance, `Allowance of account ${accounts[i]} not zero`)
//   //   }
//   // })

//   // it("right after construction no account should have any allowance at any other account", async () => {
//   //   for(let i=0; i<accounts.length; i++) {
//   //     console.log(`i`, i);
//   //     for (let j=0; j<accounts.length; j++) {
//   //       console.log(`j`, j);
        
//   //       let allowance = await kateToken.allowance(accounts[i], accounts[j]);
//   //       allowance = web3.utils.fromWei(allowance, 'ether');     

//   //       console.log(`${accounts[i]} allowance to ${accounts[j]}`, allowance);
//   //       const allowanceExpected = 0;
//   //       assert.equal(allowanceExpected, allowance, `Allowance of account ${accounts[i]} not zero`)
//   //     }
//   //   }
//   // })


//   // it("should transfer 1K tokens between accounts, from owner to any other account", async () => {
//   //   let tokenTransfered = 0;
//   //   let ownerBalanceBefore = await kateToken.balanceOf(owner);
//   //   ownerBalanceBefore = web3.utils.fromWei(ownerBalanceBefore, 'ether');
//   //   console.log(`Owner's balance BEFORE the transfers is:`, ownerBalanceBefore);

//   //   for(let i=1; i<accounts.length; i++) {
//   //     console.log('i', i);
//   //     let amount = web3.utils.toWei('1000', 'ether');
//   //     console.log('amount', typeof(amount), amount);

//   //     await kateToken.transfer(accounts[i], amount, {from: owner})

//   //     let accountBalance = await kateToken.balanceOf(accounts[i]);
//   //     accountBalance = web3.utils.fromWei(accountBalance, 'ether');
//   //     console.log(`${accounts[i]} balance is`, accountBalance);

//   //     console.log('accountBalance to be added', accountBalance);
//   //     console.log('accountBalance', typeof(accountBalance), accountBalance)
//   //     tokenTransfered += parseInt(accountBalance);
//   //     console.log('tokenTransfered until now', tokenTransfered);

//   //     assert.equal(accountBalance, 1000, `${accounts[i]} balance is not 1k, as expected`);
//   //   }

//   //   let ownerBalanceAfter = await kateToken.balanceOf(owner);
//   //   ownerBalanceAfter = web3.utils.fromWei(ownerBalanceAfter, 'ether');
//   //   console.log(`Owner's balance AFTER the transfers is:`, ownerBalanceAfter);

//   //   const ownerBalanceExpected = ownerBalanceBefore - tokenTransfered;

//   //   assert.equal(ownerBalanceExpected, ownerBalanceAfter, `owner's balance is not the tokens before minus the tokens trasfered, as expected`);
//   // })

//   // it("should NOT be able to transfer TO address(0)", async () => {
//   //   let amount = web3.utils.toWei('1000', 'ether');
//   //   const errorMsgFromContract = 'ERC20: transfer to the zero address';
//   //   let errorMsgFromTest;

//   //   try {
//   //     await kateToken.transfer(zeroAddress, amount, {from: owner})
//   //   } 
//   //   catch(err) {
//   //     console.log('err', err.reason)
//   //     errorMsgFromTest = err.reason
//   //   }

//   //   console.log('errorMsgFromContract', errorMsgFromContract)
//   //   console.log('errorMsgFromTest', errorMsgFromTest)

//   //   assert.equal(errorMsgFromContract, errorMsgFromTest, `Error messages not the same, transaction either successed or failed for different reason`);
//   // })

//   // it("should NOT be able to transfer FROM address(0)", async () => {

//   //   // καθυστερεί πολύ. ίσως πρέπει να κάνω implement τη burn function ωστε το zeroAddress να έχει balance.
//   //   let amount = web3.utils.toWei('1000', 'ether');
//   //   const errorMsgFromContract = 'ERC20: transfer from the zero address';
//   //   let errorMsgFromTest;

//   //   try {
//   //     await kateToken.transfer(owner, amount, {from: zeroAddress})
//   //   } 
//   //   catch(err) {
//   //     console.log('err', err.reason)
//   //     errorMsgFromTest = err.reason
//   //   }

//   //   console.log('errorMsgFromContract', errorMsgFromContract)
//   //   console.log('errorMsgFromTest', errorMsgFromTest)

//   //   assert.equal(errorMsgFromContract, errorMsgFromTest, `Error messages not the same, transaction either successed or failed for different reason`);
//   // })

//   // it("account should NOT be able to transfer more tokens than it has", async () => {
//   //   //make a trasfer from owner to account[1] so as to account[1] has some funds
//   //   let ownerBalanceBefore = await kateToken.balanceOf(owner);
//   //   ownerBalanceBefore = web3.utils.fromWei(ownerBalanceBefore, 'ether');
//   //   console.log(`Owner's balance BEFORE the transfers is:`, ownerBalanceBefore);

//   //   let amount = web3.utils.toWei('1000', 'ether');
//   //   console.log('amount', typeof(amount), amount);

//   //   await kateToken.transfer(accounts[1], amount, {from: owner})
//   //   let accountBalance = await kateToken.balanceOf(accounts[1]);
//   //   accountBalance = web3.utils.fromWei(accountBalance, 'ether');
//   //   console.log(`${accounts[1]} balance is`, accountBalance);

//   //   let ownerBalanceAfter = await kateToken.balanceOf(owner);
//   //   ownerBalanceAfter = web3.utils.fromWei(ownerBalanceAfter, 'ether');
//   //   console.log(`Owner's balance AFTER the transfers is:`, ownerBalanceAfter);

//   //   amount = parseInt(web3.utils.fromWei(amount, 'ether'));

//   //   console.log('minus', ownerBalanceBefore-amount);

//   //   //make a trasfer from account[1] to account[2] with more funds that is has

//   //   let moreAmount = web3.utils.toWei('2000', 'ether');
//   //   const errorMsgFromContract = 'ERC20: transfer amount exceeds balance';
//   //   let errorMsgFromTest;

//   //   try {
//   //     await kateToken.transfer(accounts[2], moreAmount, {from: accounts[1]})

//   //     let account2Balance = await kateToken.balanceOf(accounts[2]);
//   //     account2Balance = web3.utils.fromWei(accountBalance, 'ether');
//   //     console.log(`${accounts[2]} balance is`, account2Balance);
//   //   } 
//   //   catch(err) {
//   //     console.log('err', err.reason)
//   //     errorMsgFromTest = err.reason
//   //   }

//   //   console.log('errorMsgFromContract', errorMsgFromContract)
//   //   console.log('errorMsgFromTest', errorMsgFromTest)

//   //   assert.equal(ownerBalanceAfter, ownerBalanceBefore-amount, `owner's balance is not the tokens before minus the tokens trasfered, as expected`);
//   //   assert.equal(errorMsgFromContract, errorMsgFromTest, `Error messages not the same, transaction either successed or failed for different reason`);
//   // })



  

//   it("should NOT be able to aproove any allowance FROM address(0)", async () => {
//     await kateToken.approve()
//   })

//   it("should NOT be able to aproove any allowance TO address(0)", async () => {
//     await kateToken.approve()
//   })

//   it("should NOT be able to aproove more allowance than available TO address(0)", async () => {
//     await kateToken.approve()
//   })

//   it("should transfer 1K tokens between accounts, from owner to any other account", async () => {
//     await kateToken.approve()
//   })

// });



// /*
// accounts [
//   '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
//   '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
//   '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
//   '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
//   '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
//   '0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e',
//   '0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5',
//   '0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5',
//   '0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc',
//   '0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE'
// */