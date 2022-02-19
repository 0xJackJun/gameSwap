// SPDX-License-Identifier: MIT
pragma solidity = 0.8.3;

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
} 

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
}

contract GSTTOKEN {
    using SafeMath for uint;
    
    string public constant name = 'GameSwap Token';
    string public constant symbol = 'GST';
    uint public constant decimals = 18;
    uint public constant totalSupply = 100000000*(10**18);
    uint public constant month = 60 * 60 * 24 * 31;
    uint public marketSupply;
    uint public genesisTime;
    uint public airdropTime;
    uint public teamClaimTime;
    uint public teamClaimTimes;
    
    address public admin;
    address public WETH;
    
    mapping(address => uint) public balanceOf;
    mapping(address => uint) public supportPledgeToken;
    mapping(address => mapping(address => uint)) public allowance;
    mapping(address => mapping(address => uint)) public simpleTokenPledge;
    mapping(address => uint) public nonces;
    
    bytes32 public DOMAIN_SEPARATOR;
    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
    
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);
    event Unlock(address indexed user, uint value, uint lockTime);
    
    constructor(address marketAddress, address omAddress, address adminAddress, address WETHAddress) {
        admin = adminAddress;
        WETH = WETHAddress;
        uint ms = 50 * totalSupply / 100;
        uint oms = 2 * totalSupply / 100;
        uint locks = 48 * totalSupply / 100;
        balanceOf[marketAddress] = balanceOf[marketAddress].add(ms);
        balanceOf[omAddress] = balanceOf[marketAddress].add(oms);
        balanceOf[address(this)] = locks;
        marketSupply = ms + oms;
        teamClaimTime = block.timestamp;
        genesisTime = block.timestamp + month;
        airdropTime = block.timestamp + month * 4; 
        
        uint chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes(name)),
                keccak256(bytes('1')),
                chainId,
                address(this)
            )
        );
    }
    
    function addTokenPledge(address token) public {
        require(admin == msg.sender, "GSTTOKEN: FORBIDDEN");
        supportPledgeToken[token] = 1;
    }
    
    function removeTokenPledge(address token) public {
        require(admin == msg.sender, "GSTTOKEN: FORBIDDEN");
        supportPledgeToken[token] = 0;
    }
    
    function pledgeToken(address token, uint value) payable public returns (uint tokens) {
        require(supportPledgeToken[token] == 1, "GSTTOKEN: NOT SUPPORT");
        if(token == WETH) {
            IWETH(WETH).deposit{value: msg.value}();
        }
        
    }
    
    function genesisAirdrop(bool lpAirdrop) public view returns (uint value) {
        require(block.timestamp <= genesisTime, "GSTTOKEN: EXPIRED");
        if(lpAirdrop) {
            
        } else {
            value = 3 * totalSupply / 100;
        }
    }
    
    function userAirdrop(address airdropAddress) public {
        require(admin == msg.sender, "GSTTOKEN: FORBIDDEN");
        require(block.timestamp >= airdropTime, "GSTTOKEN: LOCKING");
        uint value = totalSupply / 100;
        _transfer(address(this), airdropAddress, value);
        marketSupply = marketSupply.add(value);
        emit Unlock(airdropAddress, value, airdropTime);
        airdropTime = type(uint).max;
    }
    
    function teamClaim(address teamAddress) public {
        require(admin == msg.sender, "GSTTOKEN: FORBIDDEN");
        require(block.timestamp >= teamClaimTime, "GSTTOKEN: LOCKING");
        require(teamClaimTimes <= 48, "GSTTOKEN: CLAIM OVERFLOW");
        uint value = totalSupply * 10 / 100 / 48;
        marketSupply = marketSupply.add(value);
        teamClaimTimes++;
        _transfer(address(this), teamAddress, value);
        emit Unlock(teamAddress, value, teamClaimTime);
        teamClaimTime = block.timestamp + month;
    }
    
    function _approve(address owner, address spender, uint value) private {
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _transfer(address from, address to, uint value) private {
        require(balanceOf[from] >= value, "GSTTOKEN: BALANCE OVERFLOW");
        balanceOf[from] = balanceOf[from].sub(value);
        balanceOf[to] = balanceOf[to].add(value);
        emit Transfer(from, to, value);
    }
    
    function approve(address spender, uint value) external returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint value) external returns (bool) {
        require(allowance[from][msg.sender] >= value, "GSTTOKEN: APPROVE OVERFLOW");
        if (allowance[from][msg.sender] != type(uint).max) {
            allowance[from][msg.sender] = allowance[from][msg.sender].sub(value);
        }
        _transfer(from, to, value);
        return true;
    }
    
    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(deadline >= block.timestamp, 'GSTTOKEN: EXPIRED');
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline))
            )
        );
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, 'GSTTOKEN: INVALID_SIGNATURE');
        _approve(owner, spender, value);
    }

    function GetPermitString(address owner, address spender, uint value, uint deadline) public view returns(bytes memory data,bytes32 digest) {
        uint nonce = nonces[owner];
        data = abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonce, deadline))
            );
        digest = keccak256(data);
        
    }
    function GetPermitAddr(bytes32 digest, uint8 v, bytes32 r, bytes32 s) public pure returns(address addr) {
        addr = ecrecover(digest, v, r, s);
    }
    function CheckPermitString(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) public view returns(bytes memory data,bytes32 digest,address addr) {
        uint nonce = nonces[owner];
        data = abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonce, deadline))
            );
        digest = keccak256(data);
        addr = ecrecover(digest, v, r, s);
        
    }
        
}