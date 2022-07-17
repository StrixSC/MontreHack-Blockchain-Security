// SPDX-License-Identifier: MIT;
pragma solidity ^0.6.10;

contract TimeRacers {
    uint256 private startTime;
    uint256 public reward = 0.1 ether;
    uint256 public fee = 0.1 ether;
    mapping (address => uint256) private games;

    function startGame() public payable {
        require(msg.value >= fee);
        require(games[msg.sender] == 0, "Game already started...");
        games[msg.sender] = now + 1 minutes;
    }

    function submitGuess(uint256 guess) public payable {
        require(games[msg.sender] != 0, "Game not started...");
        require(block.timestamp < games[msg.sender], "Too late...");
        if (guess == uint256(keccak256(abi.encodePacked(bytes32(uint256(block.timestamp + block.difficulty + (uint256(keccak256(abi.encodePacked(block.coinbase))) / (block.timestamp)))), bytes32(uint256(block.gaslimit + ((uint256(keccak256(abi.encodePacked(msg.sender)))) / (block.timestamp))) + block.number))))) {
            (bool sent, ) = msg.sender.call{value: fee + reward}("");
            if (sent) {
                games[msg.sender] = 0;
            } else {
                games[msg.sender] = now + 1 minutes;
            }
        }
    }
}