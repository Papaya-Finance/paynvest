// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import { IERC1271 } from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { IPaynvest } from "./interfaces/IPaynvest.sol";
import { IPapaya } from "./interfaces/IPapaya.sol";
import { IPapayaNotification } from "./interfaces/IPapayaNotification.sol";

contract Paynvest is IERC1271, IPaynvest, IPapayaNotification {

    mapping(address user => uint256 amount) public balances;

    uint256 totalIncomeBalance;
    

    address immutable owner;
    constructor(address owner_) {
        owner = owner_;
    }

    //Данный метод отвечает за исполнение стратегии, т.е здесь нам надо сходить на чейнлинк и спросить цену
    //Затем засунуть это дело в аргументы инча
    function claim() external {}

    //Данный метод отвечает за вывод доступных пользователю средств
    function withdraw() external {}

    function streamCreated(address from, uint32 streamStarts, uint256 encodedRates) external {

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
}