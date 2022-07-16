import { expect } from "chai";
import { BigNumber, Contract, ContractFactory, providers, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Tests", function () {
    let signer: Signer;
    let player: string;
    let challengeFactory: ContractFactory;
    let challenge: Contract;
    let challenge_instance_address = "0x06A56751dec4C7CA9d2B45651720304eB02bb529";

    before(async () => {
        [signer] = await ethers.getSigners();
        player = await signer.getAddress();
        console.log("Primary Signer Address:", player);
        challengeFactory = await ethers.getContractFactory("onChainLotterySecuredx20000");
        challenge = challengeFactory.attach(challenge_instance_address);
    });

    it("Should solve the challenge", async () => {
        const key = player;
        const position = 1;

        const bytes32_key = ethers.utils.hexZeroPad(key, 32);
        const bytes32_position = ethers.utils.hexZeroPad(BigNumber.from(position).toHexString(), 32);

        const concatenation = BigNumber.from(bytes32_key).add(bytes32_position).toHexString();
        const storagePositon = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(concatenation));
        const provider = signer.provider!;
        const storage = await provider.getStorageAt(challenge.address, storagePositon);
        console.log("Storage", storage);
    });
});