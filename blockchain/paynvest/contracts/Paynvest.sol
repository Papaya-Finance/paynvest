// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import { IPaynvest } from "./interfaces/IPaynvest.sol";
import { IPapaya } from "./interfaces/IPaynvest.sol";

import { IERC1271 } from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract Paynvest is IERC1271, IPaynvest {

    address immutable owner;
    constructor(address owner_) {
        owner = owner_;
    }

    function claim() external {}
    function withdraw() external {}

    function isValidSignature(bytes32 hash, bytes memory signature) external view returns (bytes4) {
        if (SignatureChecker.isValidSignatureNow(owner, hash, signature)) {
            return this.isValidSignature.selector;
        } else {
            return 0xffffffff;
        }
    }
}