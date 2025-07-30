// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

interface IPaynvest {

    struct User {
        uint96 rate;
        uint32 streamStarted;
    }

    function claim() external;
    function withdraw(uint256 amount) external;
}