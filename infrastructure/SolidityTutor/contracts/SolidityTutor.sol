// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract SolidityTutorial {
    address internal currentTutorialContract;
    address owner;

    constructor(uint256 salt, bytes memory data) {
        owner = msg.sender;
        _deploy(salt, data);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "");
        _;
    }

    function changeTutorial(uint256 salt, bytes memory data) public onlyOwner {
        _deploy(salt, data);
    }

    function _deploy(uint256 salt, bytes memory data) internal {
        assembly {
            let encodedData := add(0x20, data)
            let encodedSize := mload(data)
            sstore(
                currentTutorialContract.slot,
                create2(0, encodedData, encodedSize, salt)
            )
        }
    }

    // The result will be in raw bytes, decode it to UTF-8 to get the example functions you can call!
    // Here, use this: https://gchq.github.io/CyberChef/#recipe=From_Hex('Auto')
    function getAvailableFunctions() external returns (bytes memory) {
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
    function donate() public payable returns (bool) {
        require(
            msg.value > 0,
            "Unfortunately, null donations are not really donations..."
        );
        (bool sent, ) = payable(currentTutorialContract).call{value: msg.value}(
            ""
        );
        return sent;
    }

    receive() external payable {
        donate();
    }

    fallback() external payable {
        address implementation = currentTutorialContract;
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(
                gas(),
                implementation,
                0,
                calldatasize(),
                0,
                0
            )
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
