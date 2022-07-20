// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "./DefaultConfig.sol";

/* Dev note: FOR ALL TUTORS: This is the default Tutorial that is uploaded onto the Contract. If an update is necessary 
* or if there is demand for a new tutorial, please go through the changeTutorial() method on the SolidityTutorial Contract. 
* The configuration needed to reset the SolidityTutor to the initial tutorial is located in the DefaultConfig file as constant state variables
*/
contract SolidityByExample {
    uint256 getterVar;
    event HelloEvent(address); // Events can be used to communicate with front-ends to provide realtime feedback on contract execution flow!
    event GoodbyeEvent(address);

    /*  
        Standard HelloWorld!
        Dev note: ~ Love to see it!
    */
    function HelloWorld() public {  
        emit HelloEvent(msg.sender);
    }

    function getExamples() public pure returns (string[12] memory) {
        string[12] memory examples = ["typeCasting()", "ifElseIfStatement()", "forLoop()", "whileLoop()", "doWhileLoop()", "switchCaseYUL()", "HelloWorld()", "GoodByeWorld()", "getterFunction()", "setterFunction()", "pureFunction()", "viewFunction()"];
        return examples;
    }

    function typeCasting() public pure returns (bytes memory) {
        uint256 a = 0x12345678;
        uint128 b = uint128(a);
        uint64 c = uint64(b);
        uint32 d = uint32(c);
        uint8 e = uint8(d);
        int8 f = int8(e);
        bytes32 g = bytes32(a);
        bytes16 h = bytes16(g);
        bytes8 i = bytes8(h);
        return abi.encodePacked(f, i); // We can also call built-in methods from the ABI!
    }

    function ifElseIfStatement() public pure returns (bool) {
        if (true) {
            return true;
        } else {
            return false;
        }
    }
    
    // View functions only reads, but doesn't write state.
    function viewFunction() public view returns (address) {
        return address(this);
    }

    // Pure functions does not alter state whatsoever
    function pureFunction() public pure returns (int) {
        return 1 + 2;
    }

    function getterFunction() public view returns (uint256) {
        return getterVar;
    }

    function setterFunction(uint256 newValue) public {
        getterVar = newValue;
    }

    function forLoop() public pure returns (int) {
        int counter = 0;
        for(int i = 0; i < 10; i++) {
            counter++;
        }
        return counter;
    }

    function whileLoop() public pure returns (int) {
        int i = 0;
        while(i < 10) {
            i++;
        }
        return i;
    }

    function doWhileLoop() public pure returns (int) {
        int i = 0; 
        do {
            i++;
        } while(i < 10);
        return i;
    }

    /*
        Dev notes: Switch cases are not integrated within Solidity, but they're still available using inline Assembly!
    */
    function switchCaseYUL(uint _case) public pure returns (bool) {
        uint output;
        assembly {
            switch eq(_case, 0)
            case 0x1 {
                output := 0
            }
            default {
                output := 1
            }
        }

        /*
            Ternary operator is also available! 
        */
        return output == 0 ? false : true;
    }

    /*
        Standard GoodbyeWorld!
        Dev note: It's only appropriate to completely destroy the contract once we're done!
    */
    function GoodByeWorld() public {
        emit GoodbyeEvent(msg.sender);
        selfdestruct(payable(0x0));
    }
}



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
