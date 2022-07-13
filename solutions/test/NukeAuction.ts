import { expect } from "chai";
import { BigNumber, Contract, ContractFactory, providers, Signer } from "ethers";
import { ethers } from "hardhat";

describe("NukeAuction", function () {
    let signer: Signer;
    let player: string;
    let challengeFactory: ContractFactory;
    let challenge: Contract;
    let challenge_instance_address = "0x6e72e864216cBC8a8A3921715F08d88fF35A5708";

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

        
    });
});