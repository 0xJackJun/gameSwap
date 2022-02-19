// SPDX-License-Identifier: MIT
pragma solidity = 0.8.3;

import './GamePair.sol';
import './interfaces/IGamePair.sol';
import './interfaces/IGameFactory.sol';
import './interfaces/IGSTTOKEN.sol';
import './libraries/GameLibrary.sol';

contract GameFactory is IGameFactory {

    mapping(address => mapping(string => address)) public getPair;
    address[] public allPairs;
    address public gsttoken;
    //uint public gstPledge = 2 * 10**18;
    uint public gstPledge = 0;

    event PairCreatedWithoutInit(address indexed token, address indexed pair, string gameId);
    event PairCreated(address indexed token, address indexed pair, string gameId, uint length);
    
    constructor(address GST) {
        gsttoken = GST;
    }
    
    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }
    
    function getCodeHash() external pure returns (bytes32) {
        return keccak256(type(GamePair).creationCode);
    }
    
    function getAddress() external view returns (address) {
        return address(this);
    }
    
    function getPledge() external view returns (uint) {
        return gstPledge;
    }
    
    function gsttokenPledge(address pair, uint deadline, address user, uint8 v, bytes32 r, bytes32 s) override external returns (uint gstAmount) {
        gstAmount = gstPledge;
        IGSTTOKEN(gsttoken).permit(user, address(this), gstAmount, deadline, v, r, s);
        IGSTTOKEN(gsttoken).transferFrom(user, pair, gstAmount);
    }
    
    function initPair(address pair, address token, string calldata title, string calldata url, uint[] calldata deadline, address user) override external {
        IGamePair(pair).initialize(title, token, url, deadline[0], deadline[1], user);
        getPair[token][title] = pair;
        allPairs.push(pair);
        emit PairCreated(token, pair, title, allPairs.length);
    }
    
    function createPair(address token, string calldata title) override external returns (address pair) {
        require(token != address(0), 'GameFactory: ZERO_ADDRESS');
        require(getPair[token][title] == address(0), 'GameFactory: PAIR_EXISTS');
        bytes memory bytecode = type(GamePair).creationCode;
        bytes32 gameId = keccak256(abi.encodePacked(title));
        bytes32 salt = keccak256(abi.encodePacked(token, gameId));
        //solium-disable-next-line
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        emit PairCreatedWithoutInit(token, pair, title);
    }
    
}