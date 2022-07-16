// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract onChainLotterySecuredx20000Helper {
    function getStorageLocation() public view returns (bytes32) {
        return keccak256(abi.encodePacked(bytes32(uint256(uint160(msg.sender))), bytes32(uint256(1))));
    }
}