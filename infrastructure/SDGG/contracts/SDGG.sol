pragma solidity ^0.8.7;

contract SDGG {
    event GuessTriggered(uint256 _number, string _result);
    event GameStarted();
    event GameEnded();
    event GameWon();
    event GameLost();

    mapping(uint256 => uint256) private _generator;
    uint256 private _generatorSize;
    address private _owner;
    uint256 private MIN_WORD_LENGTH = 1;
    uint256 private gameCost = 1000000000000000;
    uint8 private MAX_GUESSES = 1;
    uint8 private _guessCount = 0;
    uint256 private _number;
    bool private _won = false;

    constructor(uint256[] memory dictionary) public {
        _generatorSize = dictionary.length;
        for (uint256 i = 0; i < _generatorSize; i++) {
            _generator[i] = dictionary[i];
        }
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return a % b;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getOwner() public view returns (address) {
        return _owner;
    }

    function getNumberFromGenerator() public view returns (uint256) {
        return _generator[rand(_generatorSize)];
    }

    function concat(bytes32 b1, bytes32 b2)
        private
        pure
        returns (bytes memory)
    {
        bytes memory result = new bytes(64);
        assembly {
            mstore(add(result, 32), b1)
            mstore(add(result, 64), b2)
        }
        return result;
    }

    function rand(uint256 modV) public view returns (uint256) {
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp +block.difficulty +((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +block.gaslimit +((uint256(keccak256(abi.encodePacked(msg.sender)))) /(block.timestamp)) +block.number)));
        return mod((seed - ((seed / 1000) * 1000)), modV);
    }

    function createGame() public payable {
        require(
            (msg.value >= gameCost),
            "Oh oh! It looks like you're broke or you forgot to pay lol..."
        );
        _number = getNumberFromGenerator();
        _won = false;
        _guessCount = 0;
        emit GameStarted();
    }

    function isSolved() public view returns (bool) {
        return _won;
    }

    function submitGuess(uint256 number) public payable {
        require(0 <= number && number < 2**256 - 1, "Not a valid number...");
        require(
            _guessCount < MAX_GUESSES,
            "Max guessed reached... Cannot guess anymore."
        );

        string memory result = "";
        if (number > _number) {
            result = "TOO HIGH!";
        } else if (number < _number) {
            result = "TOO LOW";
        } else if (number == _number) {
            result = "YOU GOT IT!";
            _won = true;
            payable(msg.sender).transfer(gameCost);
            emit GameWon();
            emit GameEnded();
        }
        emit GuessTriggered(number, result);
        _guessCount++;
    }

    receive() external payable {}
    fallback() external payable {}
}