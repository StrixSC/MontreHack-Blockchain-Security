// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SolidityTutorAttacker {
    function attack(address attacker) public {
        payable(attacker).transfer(address(this).balance);
    }

    function sanity() public pure returns (int) {
        return 1337;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}