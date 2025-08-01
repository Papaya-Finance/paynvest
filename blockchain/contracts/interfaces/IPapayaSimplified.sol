// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

interface IPapayaSimplified {
    function withdraw(uint256 amount) external;
    function balanceOf(address account) external view returns (uint);
}