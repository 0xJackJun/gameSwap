// SPDX-License-Identifier: MIT
pragma solidity = 0.8.3;


interface IERC20GAME {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
    function gsttokenPledge() external view returns (uint);
    function gameResult() external view returns (uint);
    function creator() external view returns (address);
    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;
}

contract GameBallot {
    
    struct Proposal {
        address delegate;
        address beDelegated;
        address pair;
        uint oldResult;
        uint newResult;
        uint oldResultVoted;
        uint newResultVoted;
        uint gstAmount;
        uint voteAmount;
        uint voteEndTime;
        bool isVoting;//0 false;1 true
    }
    
    struct Voter {
        address voterAddress;
        uint votedResult;
    }
    
    mapping(address => Voter[]) public Voters;
    mapping(address => Proposal) public Proposals;
    mapping(address => mapping(address => bool)) public VoterCheck;
    
    address gsttoken;
    uint public constant disputeTime = 60 * 5;
    uint public constant disputePoll = 10**18;
    uint public constant permitNum = type(uint).max;
    
    constructor(address GST) {
        gsttoken = GST;
    }
    
    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            'transferFrom failed'
        );
    }
    
    function safeTransfer(
        address token,
        address to,
        uint256 value
    ) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            'TransferHelper::safeTransfer: transfer failed'
        );
    }
    
    function DisputePermit(address pair, uint deadline, uint votedDispute, uint8 v, bytes32 r, bytes32 s) public returns (uint gstAmount) {
        IERC20GAME(gsttoken).permit(msg.sender, address(this), permitNum, deadline, v, r, s);
        gstAmount = Dispute(pair, votedDispute);
    }
    
    function VotePermit(address pair, uint deadline, uint voteResult, uint8 v, bytes32 r, bytes32 s) public returns (uint voteValue) {
        IERC20GAME(gsttoken).permit(msg.sender, address(this), permitNum, deadline, v, r, s);
        voteValue = Vote(pair, voteResult);
    }
    
    function Dispute(address pair, uint votedDispute) public returns (uint gstAmount) {
        Proposal memory pro = Proposals[pair];
        require(!pro.isVoting, "GameBallot: VOTING");
        //get gst pledge
        gstAmount = IERC20GAME(pair).gsttokenPledge();
        //transfer GST
        safeTransferFrom(gsttoken, msg.sender, address(this), gstAmount);
        //get now game result
        uint oldResult = IERC20GAME(pair).gameResult();
        require(oldResult != votedDispute, "GameBallot: RESULT_SAME");
        address creator = IERC20GAME(pair).creator();
        uint endTime = block.timestamp + disputeTime;
        pro = Proposal(msg.sender, creator, pair, oldResult, votedDispute, 0, 0, gstAmount, 0, endTime, true);
        Proposals[pair] = pro;
    }
    
    function Vote(address pair, uint voteResult) public returns (uint voteValue) {
        Proposal memory pro = Proposals[pair];
        require(pro.isVoting, "GameBallot: VOTED END");
        require(block.timestamp <= pro.voteEndTime, "GameBallot: Dispute EXPIRED");
        require(!VoterCheck[pair][msg.sender], "GameBallot: VOTED");
        safeTransferFrom(gsttoken, msg.sender, address(this), disputePoll);
        if(pro.oldResult == voteResult) {
            pro.oldResultVoted += 1;
        } else if(pro.newResult == voteResult) {
            pro.newResultVoted += 1;
        } else {
            require(false, "GameBallot: ERROR Vote Result");
        }
        pro.voteAmount += disputePoll;
        Proposals[pair] = pro;
        VoterCheck[pair][msg.sender] = true;
        Voters[pair].push(Voter(msg.sender, voteResult));
        voteValue = disputePoll;
    }
    
    function getResult(address pair) public view returns (uint result) {
        Proposal memory pro = Proposals[pair];
        uint oldResultVoted = pro.oldResultVoted;
        uint newResultVoted = pro.newResultVoted;
        uint voteRate = 0;
        if (oldResultVoted + newResultVoted > 0 ) {
            voteRate = newResultVoted / (oldResultVoted + newResultVoted) * 100;
        }
        if(voteRate >= 90) {
            result = pro.newResult;
        } else {
            result = pro.oldResult;
        }
    }
    
    //1 voting; 0 voted; 2 not vote
    function isDisputing(address pair) public view returns (uint result, uint votedTime) {
        Proposal memory pro = Proposals[pair];
        if(pro.isVoting) {
            if (pro.voteEndTime >= block.timestamp) {
                result = 1;
            } else {
                result = 0;
                votedTime = pro.voteEndTime;
            }
        } else {
            result = 2;
        }
    }
    
    function getWinner(address pair) public view returns (address winner) {
        Proposal memory pro = Proposals[pair];
        uint oldResultVoted = pro.oldResultVoted;
        uint newResultVoted = pro.newResultVoted;
        uint voteRate = 0;
        if (oldResultVoted + newResultVoted > 0 ) {
            voteRate = newResultVoted / (oldResultVoted + newResultVoted) * 100;
        }
        if(voteRate >= 90) {
            winner = pro.delegate;
        } else {
            winner = pro.beDelegated;
        }
    }
    
    function getReward(address pair, address user) public returns (uint amount, address winner) {
        Proposal memory pro = Proposals[pair];
        if(pro.isVoting) {
            require(pro.voteEndTime < block.timestamp, "GameBallot: VOTING");
            if(VoterCheck[pair][user]) {
                winner = getWinner(pair);
                uint v = pro.gstAmount;
                if(user == winner) {
                    amount = v * 10 / 100;
                } else {
                    v = v * 90 / 100;
                    amount = v / (pro.oldResultVoted + pro.newResultVoted);
                    amount = amount + disputePoll;
                }
                safeTransfer(gsttoken, user, amount);
                pro.voteAmount = pro.voteAmount - disputePoll;
                Proposals[pair] = pro;
                delete VoterCheck[pair][user];
            }
        }
    }

}