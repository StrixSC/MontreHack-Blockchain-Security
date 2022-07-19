// SPDX-License-Identifier: MIT;
pragma solidity ^0.6.10;

contract TimeRacers {
    uint256 private startTime;
    uint256 public reward = 0.001 ether;
    uint256 public fee = 0.001 ether;
    mapping(address => uint256) private games;

    constructor() public payable {}

    function startGame() public payable {
        require(msg.value >= fee);
        require(!hasGameInProgress(), "Game already started...");
        games[msg.sender] = now + 2 minutes;
    }

    function submitGuess(uint256 guess) public returns (bool) {
        require(hasGameInProgress(), "Game not started...");
        require(now < games[msg.sender], "Too late...");
        require(getBalance() >= reward + fee, "We are unfortunately out of money somehow, oops! I guess you automatically lose...");
        if (guess == uint256(keccak256(abi.encodePacked(bytes32(uint256(block.timestamp + block.difficulty + uint256(keccak256(abi.encodePacked(block.timestamp))))))))) {
            (bool sent, ) = msg.sender.call{value: fee + reward}("");
            if (sent) {
                games[msg.sender] = 0;
            } else {
                games[msg.sender] = now + 2 minutes;
            }
            return sent;
        }
    }

    function reset() public {
        require(hasGameInProgress(), "Game not started...");
        games[msg.sender] = 0;
    }

    function hasGameInProgress() public view returns (bool) {
        return (games[msg.sender] != 0);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function isSolved() public view returns (bool) {
        return getBalance() == 0;
    }
}
