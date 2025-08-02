require('@matterlabs/hardhat-zksync-deploy');
require('@matterlabs/hardhat-zksync-solc');
require('@nomicfoundation/hardhat-chai-matchers');
require('solidity-coverage');
require('solidity-docgen');
require('hardhat-dependency-compiler');
require('hardhat-deploy');
require('hardhat-gas-reporter');
require('hardhat-tracer');
require('dotenv').config();

const { Networks, getNetwork } = require('@1inch/solidity-utils/hardhat-setup');

if (getNetwork().indexOf('zksync') !== -1) {
    require('@matterlabs/hardhat-zksync-verify');
} else {
    require('@nomicfoundation/hardhat-verify');
}

if (getNetwork() !== 1337) {
    require('hardhat-contract-sizer');
    require('hardhat-gas-reporter');
}

const { networks, etherscan } = (new Networks()).registerAll();

module.exports = {
    etherscan,
    etherscan: {
        apiKey: {
            polygon: `${process.env.POLYGONSCAN_API_KEY}` || '',
        }
    },
    tracer: {
        enableAllOpcodes: true
    },
    solidity: {
        compilers: [
            {
                version: '0.8.28',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1_000_000,
                    },
                    evmVersion: networks[getNetwork()]?.hardfork || 'shanghai',
                    viaIR: true,
                },
            },
        ],
    },
    deterministicDeployment: () => {
        return undefined; // отключаем EIP-1167
    },
    networks,
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    contractSizer: {
        runOnCompile: true,
        unit: 'B',
    },
    gasReporter: {
        enabled: true,
        currency: 'USD',
    },    defaultNetwork: 'hardhat',
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    networks: {
        hardhat: {
            /**
            * blockGasLimit settings for different chains
            * For BSC: https://bscscan.com/chart/gaslimit
            * : 140000000
            *
            * For Polygon: https://forum.polygon.technology/t/increasing-gas-limit-to-30m/1652
            * : 30000000
            *
            * For Ethereum: https://ycharts.com/indicators/ethereum_average_gas_limit
            * : 30000000
            */

            chainId: 1337,
            blockGasLimit: 30000000,
            gasPrice: 70_000_000_000,
            mining: {
                auto: true,
                interval: 5000,
            },
        },
        polygon: {
            chainId: 137,
            url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_KEY}`,
            accounts: process.env.DEPLOYER_PRIVATE_KEY !== undefined ? [`${process.env.DEPLOYER_PRIVATE_KEY}`] : ['0000000000000000000000000000000000000000000000000000000000000001'],
        },
      }
    }