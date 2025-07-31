// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

interface IPaynvest {

    error WrongAmount();

    struct User {
        uint256 balance; //NOTE: Uses only in streamEnded and withdraw after it 
        uint96 rate;
        uint32 streamStarted;
    }

    function claim() external;
    function withdraw(uint256 amount) external;

    function balanceOf(address account) external view returns (uint256 balance);
}