const { LimitOrder, MakerTraits, Address, TakerTraits } = require("@1inch/limit-order-sdk")
const { Wallet, JsonRpcApiProvider, Contract, ethers } = require('ethers')

const { abi } = require("../artifacts/contracts/Paynvest.sol/Paynvest.json");

async function main() {

    const privKey = process.env.DEPLOYER_PRIVATE_KEY
        
    const maker = new Wallet(privKey);

    const expiresIn = 120n; // 2 minutes
    const expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn;
  
    const makerTraits = MakerTraits.default()

    const takerTraits = TakerTraits.default()

    const receiver = "0x6391630A86458dCFEab45fFA8B4C62F82f39BAa0";

    const paynvest_address = "0x6391630A86458dCFEab45fFA8B4C62F82f39BAa0"

    const makingAmount = 1_000_000n

    const order = new LimitOrder({
    makerAsset: new Address('0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'),
    takerAsset: new Address('0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'),
    makingAmount: makingAmount, // 1 USDC
    takingAmount: 25_500_000_000_000_000n, // 0.00025 WETH
    maker: new Address(maker.address),
    receiver: new Address(receiver)
    }, makerTraits) 

    const typedData = order.getTypedData()
    const signature = await maker.signTypedData(
        typedData.domain,
        {Order: typedData.types.Order},
        typedData.message
    )

    const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_KEY}`)
    const singer = new ethers.Wallet(privKey, provider)
    const paynvest = new ethers.Contract(paynvest_address, abi, provider)

    const tx = await singer.sendTransaction({
        data: paynvest.interface.encodeFunctionData("claim", [order, signature, makingAmount, takerTraits]),
        to: await paynvest.getAddress()
    })

    console.log(tx)
}

main().catch(console.error);
