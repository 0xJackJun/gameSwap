// SPDX-License-Identifier: MIT
pragma solidity = 0.8.3;

// a library for performing various math operations

library SafeMath {
    
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x, 'ds-math-add-overflow');
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x, 'ds-math-sub-underflow');
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, 'ds-math-mul-overflow');
    }
    
    function min(uint x, uint y) internal pure returns (uint z) {
        z = x < y ? x : y;
    }

    // babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
    function power_root_k(uint y,uint v,uint k) internal pure returns (uint z) {
        if (k < 2) {
            return z = 1;
        }
        if (y > 3) {
            z = y;
            uint x = v;
            while (x < z) {
                z = x;
                x = (y / (x**(k - 1)) + (k - 1) * x) / k;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    function check_power_root(uint y, uint k) internal pure returns (uint z) {
        uint mid=0;
        uint high=256;
        uint low=0;
        uint n=0;
        while(n != 1) {
            mid = (high+low) / 2;
            n = y >> mid;
            if(n > 1) {
                low = mid;
            } else if(n == 0) {
                high = mid;
            }
        }
        uint v = 2**(((mid + 1) / 2) + 1);
        if((mid + 1) % 2 == 0){
            v = 2**((mid + 1) / 2);
        }
        z = power_root_k(y, v, k);
    }
}
