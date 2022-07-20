// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

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

