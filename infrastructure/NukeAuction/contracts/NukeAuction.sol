pragma solidity ^0.8.13;

contract NukeAuction 
{
    uint public maxAmount = 0.1 ether;
    address public winner;

    constructor() public {}
    
    function deposit() public payable 
    {
        require(msg.value == 0.0001 ether, "You can only send 0.0001 Ether");

        uint balance = address(this).balance;
        require(balance <= maxAmount, "Auction is over");

        if (balance == maxAmount) 
        {
            winner = msg.sender;
        }
    }

    function claimAuction() public 
    {
        require(msg.sender == winner, "Not winner");

        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    function isAuctionSane() external view returns (bool)
    {
        return (address(this).balance < maxAmount);
    }

        // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) 
    {
        return address(this).balance;
    }

    function isSolved() public view returns (bool) {
        return getBalance() >= maxAmount;
    }
}
