// SPDX-License-Identifier: MIT
pragma solidity = 0.8.3;

import './libraries/SafeMath.sol';
import './interfaces/IERC20.sol';
import './interfaces/IGameBallot.sol';
import './GameERC20.sol';

contract GamePair is GameERC20 {
    
    struct BetOrder {
        uint side;
        uint betAmount;
        uint betRate;
        uint winAmount;
        uint total;
        address user;
    }

    string public title;
    address public token;
    string public gameUrl;
    uint public gameStartDeadline;
    uint public gameEndDeadline;
    
    uint public rewardTime;
    uint public gameResult;
    
    address public factory;
    address public creator;
    address public gsttoken;
    
    uint private unlocked = 1;
    uint public gsttokenPledge;
    
    mapping(address => mapping(uint => BetOrder)) public bets;
    mapping(address => mapping(uint => uint)) public reservestWin;
    
    mapping(uint => uint) public reserves;
    mapping(uint => uint) public reservesEnable;
    mapping(uint => uint) public reservesLocked;
    mapping(uint => uint) public betUser;
    uint public banker;
    uint public platform;
    string public reserveTitles;
    uint[] private allReserves;
    BetOrder[] public allBets;
    
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));
    uint public constant MINIMUM_LIQUIDITY = 10**3;
    uint public constant DISPUTE_TIME = 60 * 60 * 12;
    
    modifier lock() {
        require(unlocked == 1, 'GamePair: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }
    
    modifier ensure() {
        require(gameStartDeadline >= block.timestamp, 'GamePair: EXPIRED');
        _;
    }
    
    constructor() {
        factory = msg.sender;
    }
    
    function safeTransferFrom(
        address token_,
        address from,
        address to,
        uint256 value
    ) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token_.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            'transferFrom failed'
        );
    }
    
    function _safeTransfer(address token_, address to, uint value) internal {
        //solium-disable-next-line
        (bool success, bytes memory data) = token_.call(abi.encodeWithSelector(SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TRANSFER_FAILED');
    }
    
    function getReserves() public view returns (uint[] memory res) {
        uint l = allReserves.length;
        res = new uint[](l);
        for(uint i; i < l; i++) {
            res[i] = reservesEnable[i];
        }
        return res;
    }
    
    function balanceOfReserve() public view returns (uint b) {
        uint l = allReserves.length;
        for(uint i; i < l; i++) {
            b = SafeMath.add(b, reserves[i]);
        }
    }
    
    function setGst(address gst) external {
        require(gsttoken == address(0), "TOKEN ADDRESS: ALREADY SETTED");
        gsttoken = gst;
    }
    
    function initialize(string calldata _title, address _token, string calldata _url, uint start_deadline, uint end_deadline, address user) external lock {
        require(msg.sender == factory, 'GamePair: FORBIDDEN'); // sufficient check
        require(_token != address(0), "TOKEN ADDRESS: ZERO_ADDRESS");
        require(gsttoken != address(0), "GST TOKEN ADDRESS: ZERO_ADDRESS");
        uint gstValue = IERC20(gsttoken).balanceOf(address(this));
        //require(gstValue >= 2 * 10**18, "GamePair: MUST PLEDGE GST");
        token = _token;
        title = _title;
        gameUrl = _url;
        gameStartDeadline = start_deadline;
        gameEndDeadline = end_deadline;
        creator = user;
        gsttokenPledge = gstValue;
    }
    
    function _checkAmount(uint side, uint[] memory inputs, uint amount) internal view {
         uint l = inputs.length;
         uint total;
        if (allReserves.length == 0) {
            for(uint i; i<l; i++) {
                total = SafeMath.add(inputs[i], total);
            }
        } else {
            //uint[] memory pools = getReserves();
            //uint pool = pools[side];
            //uint n_pool = SafeMath.add(inputs[side], pool);
            //uint z1 = SafeMath.check_power_root(pool, (l-1));
            //uint z2 = SafeMath.check_power_root(n_pool, (l-1));
            for(uint i; i<l; i++) {
                if (i != side) {
                    //uint z3 = SafeMath.sub(pools[i], (SafeMath.mul(pools[i], z1) / z2));
                    // require(inputs[side] == z3, "GamePair: INSUFFICIENT INPUT-SIDE");
                }
                total = SafeMath.add(inputs[i], total);
            }
        }
        require(total == amount, "GamePair: INSUFFICIENT AMOUNTS");
    }
    
    function _update(uint _index, uint _value) private {
        reservesEnable[_index] = SafeMath.add(reservesEnable[_index], _value);
    }
    
    function _update_bet(uint side, address user, uint amount, uint win, uint[] memory rWin) private {
        BetOrder memory order = bets[user][side];
        order.side = side;
        order.user = user;
        order.betAmount = SafeMath.add(order.betAmount, amount);
        order.winAmount = SafeMath.add(order.winAmount, win);
        order.total += 1;
        bets[user][side] = order;
        order.betAmount = amount;
        order.winAmount = win;
        allBets.push(order);
        uint l = rWin.length;
        for(uint i; i<l; i++) {
            reservestWin[user][i] = SafeMath.add(reservestWin[user][i], rWin[i]);
        }
        betUser[side] = betUser[side] + 1;
    }
    
    function mint(uint side, uint[] calldata options, string calldata titles, address to) external lock returns (uint liquidity) {
        require(rewardTime == 0, "GamePair: End");
        uint amount = IERC20(token).balanceOf(address(this));
        uint _reserve = balanceOfReserve();
        uint balance = SafeMath.add(_reserve, SafeMath.add(banker, platform));
        uint _amount = SafeMath.sub(amount, balance);
        if(gsttoken == token) {
            _amount = SafeMath.sub(_amount, gsttokenPledge);
        }
        _checkAmount(side, options, _amount);
        uint l = options.length;
        require(l >=2, "GamePair:Options must be greater than 2");
        for(uint i=0; i<l; i++) {
            reserves[i] = SafeMath.add(reserves[i], options[i]);
            reservesEnable[i] = SafeMath.add(reservesEnable[i], options[i]);
            if (balance == 0) {
                allReserves.push(i);
            }
        }
        if(balance == 0) {
            reserveTitles = titles;
        }
        uint _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            liquidity = SafeMath.check_power_root(_amount, 2);
            //liquidity = SafeMath.check_power_root(_amount, 2).sub(MINIMUM_LIQUIDITY);
           //_mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            liquidity = SafeMath.mul(_amount, _totalSupply) / _reserve;
        }
        require(liquidity > 0, 'GamePair: INSUFFICIENT_LIQUIDITY_MINTED');
        _mint(to, liquidity);
    }
    
    function burn(address to) external lock returns (uint amount) {
        require(rewardTime != 0, "GamePair: Not Ending");
        require(betUser[gameResult] == 0, "GamePair: User No Reward");
        uint liquidity = balanceOf[address(this)];
        uint _totalSupply = totalSupply;
        //uint _reserve = balanceOfReserve();
        uint l = allReserves.length;
        for (uint i; i < l; i++) {
            uint v = SafeMath.mul(liquidity, reserves[i]) / _totalSupply;
            reserves[i] = SafeMath.sub(reserves[i], v);
            amount += v;
        }
        require(amount > 0, 'GamePair: INSUFFICIENT_LIQUIDITY_BURNED');
        _burn(address(this), liquidity);
        _safeTransfer(token, to, amount);
    }
    
    function bet(uint side, uint amount, address to) external lock {
        require(token != address(0), "GamePair: TOKEN ADDRESS: ZERO_ADDRESS");
        require(gameStartDeadline >= block.timestamp, 'GamePair: EXPIRED');
        require(rewardTime == 0, "GamePair: Rewarded");
        uint[] memory r = getReserves();
        uint balance = IERC20(token).balanceOf(address(this));
        uint cAmount = SafeMath.sub(balance, balanceOfReserve());
        require(amount == cAmount, "GamePair: INSUFFICIENT AMOUNT");
        uint l = allReserves.length;
        uint pool = r[side];
        uint n_pool = SafeMath.add(pool, amount);
        uint z1 = SafeMath.check_power_root(pool, (l-1));
        uint z2 = SafeMath.check_power_root(n_pool, (l-1));
        reserves[side] = n_pool;
        reservesEnable[side] = n_pool;
        uint z;
        uint[] memory win = new uint[](l);
        for (uint i; i < l; i++) {
            if (i != side) {
                uint p = reservesEnable[i];
                uint z3 = SafeMath.sub(p, (SafeMath.mul(p, z1) / z2));
                reservesEnable[i] = SafeMath.sub(p, z3);
                reservesLocked[i] = SafeMath.add(reservesLocked[i], z3);
                win[i] = z3;
                z = SafeMath.add(z, z3);
            }
        }
        //save platform
        uint z4 = SafeMath.mul(z, 50) / 1000;
        banker = SafeMath.add(banker, z4);
        platform = SafeMath.add(platform, z4);
        _update_bet(side, to, amount, SafeMath.sub(z, SafeMath.mul(z4, 2)), win);
    }
    
    function resultInput(uint side) external lock {
        require(rewardTime == 0, "GamePair: Repeat");
        require(msg.sender == creator, "GamePair: FORBIDDEN");
        require(gameEndDeadline <= block.timestamp, 'GamePair: BETTING');
        gameResult = side;
        rewardTime = block.timestamp;
    }
    
    function reward(address to, address ballot) external lock returns(uint){
        require(rewardTime != 0, "GamePair: No Award");
        //isDisputing:1 voting; 0 voted; 2 not vote
        (uint isDisputing, uint endTime) = IGameBallot(ballot).isDisputing(address(this));
        require(isDisputing != 1, "GamePair: DISPUTING");
        uint result = gameResult;
        if (0 == isDisputing) {
            result = IGameBallot(ballot).getResult(address(this));
            require(endTime < block.timestamp, "GamePair: No Time To");
        } else {
            require(rewardTime + DISPUTE_TIME < block.timestamp, "GamePair: No Time To");
        }
        BetOrder memory b = bets[to][result];
        require(b.betAmount != 0, "GamePair: Rewarded");
        uint v = SafeMath.add(b.betAmount, b.winAmount);
        _safeTransfer(token, to, v);
        reserves[b.side] = SafeMath.sub(reserves[b.side], b.betAmount);
        reservesEnable[b.side] = SafeMath.sub(reservesEnable[b.side], b.betAmount);
        uint l = allReserves.length;
        for (uint i; i < l; i++) {
            uint r = reservestWin[to][i];
            reservesLocked[i] = SafeMath.sub(reservesLocked[i], r);
            reserves[i] = SafeMath.sub(reserves[i], r);
        }
        bets[to][result].betAmount = 0;
        betUser[result] -= b.total;
        (uint amount, address winner) = IGameBallot(ballot).getReward(address(this), to);
        if(to == winner) {
            _safeTransfer(gsttoken, to, gsttokenPledge);
        }
        return amount;
    }

}