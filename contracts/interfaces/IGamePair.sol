// SPDX-License-Identifier: MIT
pragma solidity = 0.8.3;

interface IGamePair {
    function initialize(string calldata _title, address _token, string calldata _url, uint start_deadline, uint end_deadline, address user) external;
    function getReserves() external view returns (uint[] memory res);
    function bet(uint side, uint amount, address to) external;
    function mint(uint side, uint[] calldata options, string calldata titles, address to) external returns (uint liquidity);
    function resultInput(uint side) external;
    function reward(address to, address ballot) external;
    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;
    function transferFrom(address from, address to, uint value) external returns (bool);
    function burn(address to) external;
    function gsttokenPledge() external view returns (uint);
    function gameResult() external view returns (uint);
    function setGst(address gst) external;
}