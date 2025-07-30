// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import { IERC1271 } from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import { SafeERC20, IERC20 } from "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";

import { IPaynvest } from "./interfaces/IPaynvest.sol";
import { IPapaya } from "./interfaces/IPapaya.sol";
import { IPapayaNotification } from "./interfaces/IPapayaNotification.sol";

contract Paynvest is IERC1271, IPaynvest, IPapayaNotification {

    using SafeERC20 for IERC20;

    uint32 public constant CLAIM_PERIOD = 30.5 days; //NOTE: This constant MUST be equal with Papaya`s period

    uint32 initialTimestamp;
    uint32 iteration;
    uint256 averagePriceOfToken;
    address immutable owner;

    IERC20 immutable WETH;

    mapping(address account => User user) public users;

    constructor(address owner_, IER20 weth_) {
        owner = owner_;
        WETH = weth_;
    }

    //Данный метод отвечает за исполнение стратегии, т.е здесь нам надо сходить на чейнлинк и спросить цену
    //Затем засунуть это дело в аргументы инча

    //Идея такова что мы будем у чейнлинка спрашивать актуальную цену и постепенно строить среднюю цену за все время
    function claim() external {

    }

    function withdraw(uint256 amount) external {
        _sync(msg.sender, 0);

        if(users[msg.sender].balance < amount) revert WrongAmount();

        users[msg.sender].balance -= amount;

        WETH.safeTransferFrom(address(this), msg.sender, amount);
    }

    function streamCreated(address from, uint32 streamStarts, uint256 encodedRates) external {
        (uint96 incomeAmount, , , uint32 timestamp) = _decodeRates(encodedRates);

        if(initialTimestamp == 0) {
            initialTimestamp = timestamp;
        }

        users[from].rate = incomeAmount;
        users[from].streamStarted = timestamp;
    }

    function streamRevoked(address from, uint32 streamDeadline, uint256 encodedRates) external {
        uint256 periodsPassed = (block.timestamp - users[account].streamStarted + afterDelay) % CLAIM_PERIOD;
        uint256 afterDelay = ((periodsPassed + 1) * CLAIM_PERIOD + initialTimestamp ) - block.timestamp;

        _sync(msg.sender, afterDelay);
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
    //NOTE: Не забудь про нюансы с кол-вом нулей, та же самая проблема что и раньше
    function _sync(address account, uint256 afterDelay) internal pure {

        uint256 periodsPassed = (block.timestamp - users[account].streamStarted + afterDelay) % CLAIM_PERIOD;
        uint256 amountStreamed = users[account].rate * periodsPassed;

        users[account].balance = amountStreamed * averagePriceOfToken; 
    }
}