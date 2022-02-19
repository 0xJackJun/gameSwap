// SPDX-License-Identifier: MIT
pragma solidity = 0.8.3;

import "./SafeMath.sol";
import "../interfaces/IGamePair.sol";

library GameLibrary {
    
    using SafeMath for uint;
    
    // calculates the CREATE2 address for a pair without making any external calls
    function pairFor(address factory, address token, string memory title) internal pure returns (address pair) {
        bytes32 gameId = keccak256(abi.encodePacked(title));
        pair = address(bytes20(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(abi.encodePacked(token, gameId)),
                // GameFactory.sol:getCodeHash
                hex"7fcfa5c664c5efa25a7c1485b883a9e2f75f0bd0835a3bae3e267f84efd156af"//8f27dd26047dcc02e6e4b1d15f94c59f5b7c4b3162bb661d3a1e29154c6a2562 init code hash
            ))));
    }
    
    function getReserves(address factory, address token, string memory title) internal view returns (uint[] memory reserves) {
        reserves = IGamePair(pairFor(factory, token, title)).getReserves();
    }
    
    function getAmountOut(uint amountIn, uint side, uint[] memory reserves) internal pure returns (uint amountOut) {
        uint pool = reserves[side];
        uint l = reserves.length;
        uint n_pool = pool.add(amountIn);
        uint z;
        if (l <= 2) {
            uint numerator = reserves[0 ** side].mul(amountIn);
            z = numerator / n_pool;
        } else {
            uint z1 = SafeMath.check_power_root(pool, (l-1));
            uint z2 = SafeMath.check_power_root(n_pool, (l-1));
            for (uint i; i < l; i++) {
                if (i != side) {
                    uint p = reserves[i];
                    uint z3 = SafeMath.sub(p, (SafeMath.mul(p, z1) / z2));
                    z += z3;
                }
            }
        }
        amountOut = z.mul(900) / 1000;
    }
    
    function getAmountsOut(uint amountIn, uint side, uint[] memory reserves) internal pure returns (uint[] memory amountsOut) {
        uint pool = reserves[side];
        uint l = reserves.length;
        uint n_pool = pool.add(amountIn);
        amountsOut = new uint[](l);
        amountsOut[side] = amountIn;
        if (l <= 2 ) {
            uint numerator = reserves[0**side].mul(amountIn);
            amountsOut[0**side] = numerator / n_pool;
        } else {
            uint z1 = SafeMath.check_power_root(pool, (l-1));
            uint z2 = SafeMath.check_power_root(n_pool, (l-1));
            for (uint i; i < l; i++) {
                if (i != side) {
                    uint p = reserves[i];
                    uint z3 = SafeMath.sub(p, (SafeMath.mul(p, z1) / z2));
                    amountsOut[i] = z3;
                }
            }
        }
    }
}