import { expect } from "chai";
import { BigNumber, Contract, ContractFactory, providers, Signer } from "ethers";
import { ethers } from "hardhat";

const abi = [
    "event TransmitMessage(address _from, string _message)",
    "event Received(address _from, uint256 _value)",
]

// https://stackoverflow.com/questions/43726344/js-decoding-morse-code
function decodeMorse(morseCode: any) {
    const ref: Record<string, string> = {
        '.-': 'a',
        '-...': 'b',
        '-.-.': 'c',
        '-..': 'd',
        '.': 'e',
        '..-.': 'f',
        '--.': 'g',
        '....': 'h',
        '..': 'i',
        '.---': 'j',
        '-.-': 'k',
        '.-..': 'l',
        '--': 'm',
        '-.': 'n',
        '---': 'o',
        '.--.': 'p',
        '--.-': 'q',
        '.-.': 'r',
        '...': 's',
        '-': 't',
        '..-': 'u',
        '...-': 'v',
        '.--': 'w',
        '-..-': 'x',
        '-.--': 'y',
        '--..': 'z',
        '.----': '1',
        '..---': '2',
        '...--': '3',
        '....-': '4',
        '.....': '5',
        '-....': '6',
        '--...': '7',
        '---..': '8',
        '----.': '9',
        '-----': '0',
    };

    return morseCode
        .split('   ')
        .map(
            (a: any) => a
                .split(' ')
                .map(
                    (b: string) => ref[b]
                ).join('')
        ).join(' ');
}

// token: v4.local.MzzDhV45CAVBzBTSXkhB0_pVVg3PuIljYCCa2NKpveUCIKx53hJePgxkPlES4gFRBb4Z8KJ-povQASQrlIdHrn0rSWGEZjFqUNGPp9cB3Ke2CP9TtEkOPO6kTHqH-Y-lJkOaaRnGRs2rDR0W5RhSz_R-NEv0rYqOJhp2WGxIn8r-zjg
describe("Transmitter", function () {
    let signer: Signer;
    let player: string;

    // Set the challenge instance to the address returned when deploying the challenge.
    let challengeInstanceAddress = "0x7BB2B3F29faC32dd86b2B760ca180462b2E08e6E";

    before(async () => {
        [signer] = await ethers.getSigners();
        player = await signer.getAddress();
        console.log("Primary Signer Address:", player);
    });

    it("Should solve the challenge", async () => {
        try {
            const provider = ethers.getDefaultProvider('ropsten');
            const iface = new ethers.utils.Interface(abi);
            const logs = await provider.getLogs({ address: "0x7BB2B3F29faC32dd86b2B760ca180462b2E08e6E", fromBlock: 0});
            const events = logs.map((l) => iface.parseLog(l));
            const messages = events.map((e) => {
                return e.args[1];
            }).filter(v => typeof (v) === "string" && v.includes('.'));
            const flag_morse = decodeMorse(messages.join(" "));
            console.log(Buffer.from(flag_morse, 'hex').toString('utf-8'));
        } catch (e) {
            console.error(e);
        }
    });
});