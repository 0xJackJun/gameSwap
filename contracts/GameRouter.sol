// SPDX-License-Identifier: MIT
pragma solidity =0.8.3;
pragma experimental ABIEncoderV2;

import './libraries/GameLibrary.sol';
import './libraries/TransferHelper.sol';

import './interfaces/IGameFactory.sol';
import './interfaces/IGamePair.sol';

contract GameRouter {
    // 创建游戏事件
    event EventCreateGame(
        address indexed token,
        address indexed pair,
        string[] gameStr,
        uint256[] deadline,
        uint256[] amountsIn,
        uint256 amount,
        uint256 side
    );
    // 下注事件
    event EventBetForToken(
        address indexed token,
        address indexed pair,
        address indexed sender,
        uint256 side,
        uint256 amount,
        uint256 deadline
    );

    address public factory;
    address public gst;
    address public ballot;
    string public test;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, 'GameRouter: EXPIRED');
        _;
    }

    constructor(
        address _factory,
        address _gst,
        address _ballot
    ) {
        factory = _factory;
        gst = _gst;
        ballot = _ballot;
    }

    function setTest(string memory _test) public {
        test = _test;
    }

    function createGame(
        address token,
        string[] memory gameStr,
        uint256[] memory deadline,
        uint256[] memory amountsIn,
        uint256 amount,
        uint256 side,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public ensure(deadline[2]) returns (address pair, uint256 gstAmount) {
        pair = IGameFactory(factory).createPair(token, gameStr[0]);
        IGamePair(pair).setGst(gst);
        {
            gstAmount = IGameFactory(factory).gsttokenPledge(pair, deadline[2], msg.sender, v, r, s);
            IGameFactory(factory).initPair(pair, token, gameStr[0], gameStr[1], deadline, msg.sender);
        }
        TransferHelper.safeTransferFrom(token, msg.sender, pair, amount);
        IGamePair(pair).mint(side, amountsIn, gameStr[2], msg.sender);
        //emit EventCreateGame(token, gameStr[0], gameStr[1], gameStr[2], deadline[0], deadline[1], deadline[2], amountsIn, amount, side);
        emit EventCreateGame(token, pair, gameStr, deadline, amountsIn, amount, side);
    }

    function addLiquidity(
        address token,
        string memory title,
        uint256 deadline,
        uint256[] memory amountsIn,
        uint256 amount,
        uint256 side
    ) public ensure(deadline) {
        address pair = GameLibrary.pairFor(factory, token, title);
        TransferHelper.safeTransferFrom(token, msg.sender, pair, amount);
        IGamePair(pair).mint(side, amountsIn, title, msg.sender);
    }

    function removeLiquidity(
        address pair,
        uint256 deadline,
        uint256 liquidity,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public ensure(deadline) {
        uint256 value = approveMax ? type(uint256).max : liquidity;
        IGamePair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
        IGamePair(pair).transferFrom(msg.sender, pair, liquidity);
        IGamePair(pair).burn(msg.sender);
    }

    function reward(address pair, uint256 deadline) public ensure(deadline) {
        IGamePair(pair).reward(msg.sender, ballot);
    }

    function betForToken(
        address token,
        address pair,
        uint256 side,
        uint256 amount,
        uint256 deadline
    ) public ensure(deadline) {
        TransferHelper.safeTransferFrom(token, msg.sender, pair, amount);
        IGamePair(pair).bet(side, amount, msg.sender);
        emit EventBetForToken(token, pair, msg.sender, side, amount, deadline);
    }

    function getAmountOuts(address pair, uint256 amountIn) public view returns (uint256[] memory amountOuts) {
        uint256[] memory r = IGamePair(pair).getReserves();
        uint256 l = r.length;
        amountOuts = new uint256[](l);
        for (uint256 i; i < l; i++) {
            uint256 out = GameLibrary.getAmountOut(amountIn, i, r);
            amountOuts[i] = out;
        }
    }

    function getAmountOut(
        address pair,
        uint256 side,
        uint256 amountIn
    ) public view returns (uint256 amountOut) {
        uint256[] memory r = IGamePair(pair).getReserves();
        return GameLibrary.getAmountOut(amountIn, side, r);
    }

    function getAmountsOut(
        address pair,
        uint256 side,
        uint256 amountIn
    ) public view returns (uint256[] memory amountsOut) {
        uint256[] memory r = IGamePair(pair).getReserves();
        return GameLibrary.getAmountsOut(amountIn, side, r);
    }

    function getAmountOutPath(
        uint256 side,
        uint256 amountIn,
        uint256[] memory reserves
    ) public pure returns (uint256 amountOut) {
        return GameLibrary.getAmountOut(amountIn, side, reserves);
    }

    function getAmountsOutPath(
        uint256 side,
        uint256 amountIn,
        uint256[] memory reserves
    ) public pure returns (uint256[] memory amountsOut) {
        return GameLibrary.getAmountsOut(amountIn, side, reserves);
    }
}
