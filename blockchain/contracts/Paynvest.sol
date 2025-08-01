// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import { IERC1271 } from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import { SafeERC20, IERC20 } from "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import { IPaynvest } from "./interfaces/IPaynvest.sol";
import { IPapayaSimplified } from "./interfaces/IPapayaSimplified.sol";
import { IPapayaNotification } from "./interfaces/IPapayaNotification.sol";

import "@1inch/limit-order-protocol-contract/contracts/interfaces/IOrderMixin.sol";
import "@1inch/limit-order-protocol-contract/contracts/libraries/TakerTraitsLib.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Paynvest is IERC1271, IPaynvest, IPapayaNotification {

    using SafeERC20 for IERC20;
    using TakerTraitsLib for TakerTraits;

    uint32 public constant CLAIM_PERIOD = 30.5 days; //NOTE: This constant MUST be equal with crt Papaya`s period

    uint32 initialTimestamp;
    uint32 iteration;
    uint256 averagePartOfToken;

    address public immutable owner;
    IERC20 public immutable WETH;
    IERC20 public immutable TOKEN;
    IPapayaSimplified public immutable PAPAYA;
    IOrderMixin public immutable LIMIT_ORDER;
    AggregatorV3Interface public immutable TOKEN_PAIR_PRICE_FEED; //TOKEN/WETH
    uint256 public immutable DECIMALS_SCALE;

    mapping(address account => User user) public users;

    constructor(
        IERC20 weth_,
        address token_, 
        address TOKEN_PAIR_PRICE_FEED_,
        IPapayaSimplified papaya_,
        IOrderMixin limit_order_
    ) {
        owner = msg.sender;
        TOKEN = IERC20(token_);
        WETH = weth_;
        PAPAYA = papaya_;
        LIMIT_ORDER = limit_order_;
        TOKEN_PAIR_PRICE_FEED = AggregatorV3Interface(TOKEN_PAIR_PRICE_FEED_);
        DECIMALS_SCALE = 10 ** (18 - IERC20Metadata(token_).decimals());
    }

    function claim(
        IOrderMixin.Order calldata order,
        bytes calldata signature,
        uint256 amount,
        TakerTraits takerTraits
    ) external {
        uint256 currentBalance = (PAPAYA.balanceOf(address(this)));

        (, int256 tokenPrice, , , ) = TOKEN_PAIR_PRICE_FEED.latestRoundData(); //1e18

        averagePartOfToken *= iteration++;
        averagePartOfToken = (averagePartOfToken + uint256(tokenPrice)) / iteration; //1e18

        uint256 amountOfToken = currentBalance * averagePartOfToken;

        if((currentBalance /= DECIMALS_SCALE) != order.makingAmount) {
            revert WrongMakingAmount();
        }

        if(amount != amountOfToken) {
            revert WrongAmount();
        }

        PAPAYA.withdraw(currentBalance);

        TOKEN.forceApprove(address(LIMIT_ORDER), currentBalance);

        (uint256 makingAmount, uint256 takingAmount, bytes32 orderHash) = LIMIT_ORDER.fillContractOrder(
            order,
            signature,
            amount,
            takerTraits
        );

        emit Claimed(makingAmount, takingAmount, orderHash);
    }

    function withdraw(uint256 amount) external {
        _sync(msg.sender, 0);

        if(users[msg.sender].balance < amount) revert WrongAmount();

        users[msg.sender].balance -= amount;

        WETH.safeTransferFrom(address(this), msg.sender, amount);
    }

    function balanceOf(address account) external view returns (uint256) {
        if(account == address(this)) {
            return (uint256(PAPAYA.balanceOf(address(this))));
        }
        uint256 periodsPassed = _periodsPassed(users[account].updated, 0);
        return (users[account].balance + users[account].rate * periodsPassed * averagePartOfToken);
    }

    function latestRoundData() external view returns (int tokenPrice) {
        (, tokenPrice, , , ) = TOKEN_PAIR_PRICE_FEED.latestRoundData();
    }
    //solhint
    function streamCreated(address from, uint32 streamStarts, uint256 encodedRates) external {
        streamStarts;
        
        (uint96 incomeAmount, , , uint32 timestamp) = _decodeRates(encodedRates);

        if(initialTimestamp == 0) {
            initialTimestamp = timestamp;
        }

        users[from].rate = incomeAmount;
        users[from].updated = timestamp;
    }

    function streamRevoked(address from, uint32 streamDeadline, uint256 encodedRates) external {
        streamDeadline;
        encodedRates;

        uint256 periodsPassed = _periodsPassed(users[from].updated, 0);
        uint256 afterDelay = ((periodsPassed + 1) * CLAIM_PERIOD + initialTimestamp ) - block.timestamp;

        _sync(from, afterDelay);
    }

    function isValidSignature(bytes32 hash, bytes memory signature) external view returns (bytes4) {
        if (SignatureChecker.isValidSignatureNow(owner, hash, signature)) {
            return this.isValidSignature.selector;
        } else {
            return 0xffffffff;
        }
    }

    function _decodeRates(uint256 encodedRates) internal pure returns (
        uint96 incomeAmount, 
        uint96 outgoingAmount, 
        uint32 projectId, 
        uint32 timestamp
    ) {
        incomeAmount = uint96(encodedRates);
        outgoingAmount = uint96(encodedRates >> 96);
        projectId = uint32(encodedRates >> 192);
        timestamp = uint32(encodedRates >> 224);
    }

    function _sync(address account, uint256 afterDelay) internal {
        uint256 amountStreamed = users[account].rate * _periodsPassed(users[account].updated, afterDelay);
        if(amountStreamed > 0) {
            users[account].balance += amountStreamed * averagePartOfToken; 
            users[account].updated = uint32(block.timestamp);
        }
    }

    function _periodsPassed(uint256 streamStarted, uint256 afterDelay) internal view returns(uint256 periodsPassed) {
        periodsPassed = (block.timestamp - streamStarted + afterDelay) % CLAIM_PERIOD;
    }
}