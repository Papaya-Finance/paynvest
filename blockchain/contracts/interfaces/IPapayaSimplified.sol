// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import { IERC20 } from "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";

interface IPapayaSimplified {
    function withdraw(uint256 amount) external;
    function balanceOf(address account) external view returns (uint);
    function DECIMALS_SCALE() external view returns (uint);
    function TOKEN() external view returns (IERC20);
}