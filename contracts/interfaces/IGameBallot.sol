// SPDX-License-Identifier: MIT
pragma solidity = 0.8.3;

interface IGameBallot {
    function getResult(address pair) external view returns (uint);
    function isDisputing(address pair) external view returns (uint result, uint votedTime);
    function getWinner(address pair) external view returns (address);
    function getReward(address pair, address user) external returns (uint amount, address winner);
}