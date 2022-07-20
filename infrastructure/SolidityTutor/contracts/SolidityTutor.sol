// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "./DefaultConfig.sol";

contract SolidityTutor {
    address public owner;
    address public currentTutorialContract;
    mapping (address => address) internal _tutorials;
    event SendThanks();

    constructor() public payable {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner of this tutor contract can change the current tutorial.");
        _;
    }

    function resetToInitialTutorial() public payable {
        require(msg.value > 0, "Resetting the tutorial is not free...");
        _deploy(defaultSalt, defaultBytecode);
    }

    function changeTutorial(uint256 salt, bytes memory data) public onlyOwner returns (address) {
        return _deploy(salt, data);
    }

    function _deploy(uint salt, bytes memory data) internal returns (address) {
        address implementorAddr; 
        assembly {
            let encodedData := add(0x20, data)
            let encodedSize := mload(data)
            implementorAddr := create(hex"00", encodedData, encodedSize)
        }

        bytes memory callback  = (hex"5860208158601c335a63aaf10f428752fa158151803b80938091923cf3");
        address morpherAddr = address(uint160(uint256(keccak256(abi.encodePacked(hex"ff", address(this), salt, keccak256(abi.encodePacked(callback)))))));
        _tutorials[morpherAddr] = implementorAddr;
        address addr;
        assembly {
            let encodedData := add(0x20, callback)
            let encodedSize := mload(callback)
            addr := create2(hex"00", encodedData, encodedSize, salt)
        }
        require(addr == morpherAddr);
        currentTutorialContract = addr;
        return addr;
    }

    function getImplementation() external view returns (address implementation) {
        return _tutorials[msg.sender];
    }

    // The result will be in raw bytes, decode it to UTF-8 to get the example functions you can call!
    // Here, use this: https://gchq.github.io/CyberChef/#recipe=From_Hex('Auto')
    function getAvailableExamples() external returns (bytes memory) {
        (bool success, bytes memory functions) = currentTutorialContract.call(
            abi.encodeWithSignature("getExamples()")
        );
        if (success) {
            return functions;
        } else {
            return bytes(hex"00");
        }
    }

    /*
        If these tutorials proved useful, please dont forget to donate! :) 
    */
    function donateToTutorial() public payable returns (bool) {
        require(
            msg.value > 0,
            "Unfortunately, null donations are not really donations..."
        );
        (bool sent, ) = payable(currentTutorialContract).call{value: msg.value}(
            ""
        );
        emit SendThanks();
        return sent;
    }

    receive() external payable {
        emit SendThanks();
    }

    fallback() external payable {
        address implementation = currentTutorialContract;
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    function isSolved() public view returns (bool) {
        return address(this).balance == 0;
    }
}
