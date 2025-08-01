// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import "@1inch/limit-order-protocol-contract/contracts/interfaces/IOrderMixin.sol";
import "@1inch/limit-order-protocol-contract/contracts/libraries/TakerTraitsLib.sol";

interface IPaynvest {

    event Claimed(uint256 makingAmount, uint256 takingAmount, bytes32 orderHash);

    error WrongAmount();
    error WrongMakingAmount();

    struct User {
        uint256 balance; //NOTE: Uses only in streamEnded and withdraw after it 
        uint96 rate;
        uint32 updated;
    }

    function claim(
        IOrderMixin.Order calldata order,
        bytes calldata signature,
        uint256 amount,
        TakerTraits takerTraits
    ) external;
    function withdraw(uint256 amount) external;

    function balanceOf(address account) external view returns (uint256 balance);
    function latestRoundData() external view returns (int tokenPrice);
}