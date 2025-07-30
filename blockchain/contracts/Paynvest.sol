// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import { IERC1271 } from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { IPaynvest } from "./interfaces/IPaynvest.sol";
import { IPapaya } from "./interfaces/IPapaya.sol";
import { IPapayaNotification } from "./interfaces/IPapayaNotification.sol";

contract Paynvest is IERC1271, IPaynvest, IPapayaNotification {

    uint32 public constant CLAIM_PERIOD = 30.5 days; //NOTE: This constant MUST be equal with Papaya`s period

    mapping(address account => User user) public users;

    uint256 totalIncomeBalance;
    uint32 initialTimestamp;

    uint256 averagePriceOfToken;
    uint32 iteration;

    address immutable owner;
    constructor(address owner_) {
        owner = owner_;
    }

    //Данный метод отвечает за исполнение стратегии, т.е здесь нам надо сходить на чейнлинк и спросить цену
    //Затем засунуть это дело в аргументы инча
    function claim() external {}

    //Данный метод отвечает за вывод доступных пользователю средств
    function withdraw(uint256 amount) external {}

    function streamCreated(address from, uint32 streamStarts, uint256 encodedRates) external {
        (uint96 incomeAmount, , , uint32 timestamp) = _decodeRates(encodedRates);

        if(initialTimestamp == 0) {
            initialTimestamp = timestamp;
        }

        users[from].rate = incomeAmount;
        users[from].streamStarted = timestamp;
    }

    function streamRevoked(address from, uint32 streamDeadline, uint256 encodedRates) external {

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
}