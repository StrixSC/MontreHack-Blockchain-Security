// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

contract SolidityTutorHelper {
    function getExamples() public pure returns (string[12] memory) {
        string[12] memory examples = ["attack()", "", "", "", "", "", "", "", "", "", "", ""];
        return examples;
    }

    function attack(address attacker, address tutorContract) public returns (bool) {
        (bool success, ) = tutorContract.call(abi.encodeWithSignature("attack(address)", attacker));
        return success;
    }

    function addressToUint256(address addr) public pure returns (uint256) {
        return uint256(uint160(addr));
    }

    function uint256ToAddress(uint256 uinteger) public pure returns (address) {
        return address(uint160(uinteger));
    }

    function changeOwner(address owner, address tutorContract) public returns (bool) {
        (bool success, ) = tutorContract.call(abi.encodeWithSignature("setterFunction(uint256)", addressToUint256(owner)));
        return success;
    }

    // Not the tutor contract!!
    function killTutorial(address tutorialContract) public returns (bool) {
        (bool success, ) = tutorialContract.call(abi.encodeWithSignature("GoodByeWorld()"));
        return success;
    }
}

