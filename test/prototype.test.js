// const {
//     deployMock,
//     assertBn,
//     assertErrors,
//     assertEvents,
//     UNSET_ADDRESS,
//     TEN_UNITS,

//     verboseAccounts,
//     big,

//     PROJECT_CONSTANTS,
// } = require("./utils")(artifacts);

// const { web3 } = require("@openzeppelin/test-helpers/src/setup");
// const EthCrypto =  require("eth-crypto");


// contract("FSD", (accounts) => {
//     describe("construction", () => {
//         it("should deploy the Fairside Token and validate the state of the deployed contract", async () => {
//             if (Array.isArray(accounts)) 
//                 accounts = await verboseAccounts(accounts);
            
//             const { fsd, timelock } = await deployMock(accounts);

//             assert.equal(await fsd.name(), "FairSide Token");
//             assert.equal(await fsd.symbol(), "FSD");
//             assertBn(await fsd.decimals(), 18);
//             assert.equal(await fsd.owner(), accounts.owner);
//             assert.equal(await fsd.account2(), accounts.owner);
//             assert.equal(await fsd.timelock(), timelock.address);
//             assertBn(await fsd.totalSupply(), 0);
            
//         });

        
//         it("should check if the right addresses are added to the signature whitelist", async () => {
//             const { fsd } = await deployMock();
//             // TODO: Check what is happening here with the address whitelist.
//             // assert.equal(await fsd.whitelisted(accounts.account1), true);
//         });

       

//         // it("should not create a new CNFT from a msg.sender that is not the FSD address", async () => {
//         //     const { fairSideConviction } = await deployMock();
//         //     await assertErrors(fairSideConviction.createConvictionNFT(accounts.owner, 0, 100, true, { from: accounts.owner }), 
//         //     "FairSideConviction::createConvictionNFT: Insufficient Privileges");
//         // });
//     });

//     describe("priviledged functionality", () => {
//         it("should not allow minting from a non whitelisted account", async () => {
//             const { fsd } = await deployMock();
//             const creatorIdentity = EthCrypto.createIdentity();
            
//             const signHash = EthCrypto.hash.keccak256([
//                 { // prefix
//                     type: 'string',
//                     value: 'Signed for DonationBag:'
//                 }, { // contractAddress
//                     type: 'address',
//                     value: fsd.address
//                 }, { // receiverAddress
//                     type: 'address',
//                     value: accounts.account1
//                 }
//             ]);
//             const signature = EthCrypto.sign(
//                 creatorIdentity.privateKey,
//                 signHash
//             );
//             await assertErrors(fsd.mint(signature, 100, { from: accounts.owner }), 
//             "FSD::mint: Not whitelisted");
//         });

//         it("should not allow to add to the registration tribute from a different address than FSD", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.addRegistrationTribute(100, { from: accounts.account1 }), 
//             "FSD::addRegistrationTribute: Insufficient Privileges");
//         });

//         it("should not allow to add to the registration tribute governance from a different address than FSD", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.addRegistrationTributeGovernance(100, { from: accounts.account1 }), 
//             "FSD::addRegistrationTributeGovernance: Insufficient Privileges");
//         });
        
//         it("should not allow to pay claim from a different address than FSD", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.payClaim(accounts.account1, 100, true, { from: accounts.account1 }), 
//             "FSD::payClaim: Insufficient Privileges");
//         });

//         it("should not allow to liquidate Eth from a different address than FSD", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.liquidateEth(20, 100, { from: accounts.account1 }), 
//             "FSD::liquidateEth: Insufficient Privileges");
//         });

//         it("should not allow to liquidate Dai from a different address than FSD", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.liquidateDai(20, 100, { from: accounts.account1 }), 
//             "FSD::liquidateDai: Insufficient Privileges");
//         });

//         it("should not allow to abdicate from a different address than FSD", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.abdicate( { from: accounts.account1 }), 
//             "FSD::abdicate: Insufficient Privileges");
//         });

//         it("should not allow to updateGovernanceThreshold from a different address than FSD", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.updateGovernanceThreshold( 100, { from: accounts.account1 }), 
//             "FSD::updateGovernanceThreshold: Insufficient Privileges");
//         });

//         it("should not allow to updateGovernanceMinimumBalance from a different address than FSD", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.updateGovernanceMinimumBalance( 100, { from: accounts.account1 }), 
//             "FSD::updateGovernanceMinimumBalance: Insufficient Privileges");
//         });

//         it("should not allow to claimGovernanceTribute from a address that is not a governance member", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.claimGovernanceTribute( 100, { from: accounts.account1 }), 
//             "FSD::claimGovernanceTribute: Not a governance member");
//         });

//         it("should not allow to setFairSideConviction from a address that is not timelock or owner", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.setFairSideConviction( accounts.account1, { from: accounts.account1 }), 
//             "FSD::setFairSideConviction: Insufficient Privileges");
//         });

//         it("should not allow to setConvictionless from a address that is not timelock or owner", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.setConvictionless(accounts.account1, true, { from: accounts.account1 }), 
//             "FSD::setConvictionless: Insufficient Privileges");
//         });

//         it("should not allow to setFairSideNetwork from a address that is not timelock or owner", async () => {
//             const { fsd } = await deployMock();
//             await assertErrors(fsd.setFairSideNetwork(accounts.account1, { from: accounts.account1 }), 
//             "FSD::setFairSideNetwork: Insufficient Privileges");
//         });
//     });

//     describe("input validation", () => {
//         it("should not allow burning with high slippage", async () => {
//             const { fsd } = await deployMock();
//             // await fsd.getReserveBalance().then(console.log);
//             // await fsd.burn(TEN_UNITS, 10, {from: accounts.owner }).then(res => console.log(res));
//             // await assertErrors(fsd.burn(10000000, 100), "FSD::burn: High Slippage");
//         });
//     });

// });