const hre = require('hardhat');
const { getChainId, network, ethers } = hre;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async ({ getNamedAccounts, deployments }) => {
    console.log('running deploy paynvest script');
    console.log('network name: ', network.name);
    console.log('network id: ', await getChainId());

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const WETH = process.env.WETH;
    const TOKEN = process.env.TOKEN;
    const TOKEN_PAIR_PRICE_FEED = process.env.TOKEN_PAIR_PRICE_FEED;
    const PERIOD_PAPAYA = process.env.PERIOD_PAPAYA;
    const LIMIT_ORDER = process.env.LIMIT_ORDER;

    const args = [
        WETH,
        TOKEN,
        TOKEN_PAIR_PRICE_FEED,
        PERIOD_PAPAYA,
        LIMIT_ORDER
    ]

    const paynvest = await deploy('Paynvest', {
        from: deployer,
        args: args
    })

    console.log('Paynvest deployed to: ', await paynvest.address);

    await sleep(10000) //10 seconds

    if (await getChainId() !== '31337') {
        await hre.run(`verify:verify`, {
            address: await paynvest.address,
            constructorArguments: args
        })
    }
};

module.exports.tags = ['Paynvest']