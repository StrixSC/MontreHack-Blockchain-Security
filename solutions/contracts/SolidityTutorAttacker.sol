// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SolidityTutorAttacker {
    function attack(address attacker) public returns (bool) {
        (bool success, ) = payable(attacker).call{value: address(this).balance}("");
        return success;
    }

    function sanity() public pure returns (int) {
        return 1337;
    }
}