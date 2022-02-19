// SPDX-License-Identifier: MIT
pragma solidity = 0.8.3;

// pragma experimental ABIEncoderV2;

interface IGameFactory {
    
    function createPair(address token, string calldata title) external returns (address pair);
    function gsttokenPledge(address pair, uint deadline, address user, uint8 v, bytes32 r, bytes32 s) external returns (uint gstAmount);
    function initPair(address pair, address token, string calldata title, string calldata url, uint[] calldata deadline, address user) external;
}