// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

interface IPapayaNotification {
    function streamCreated(address from, uint32 streamStarts, uint256 encodedRates) external;
    function streamRevoked(address from, uint32 streamDeadline, uint256 encodedRates) external;
}
