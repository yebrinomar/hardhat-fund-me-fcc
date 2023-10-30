// import
// main function
// calling of main function

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
// function deployFunc() {
//   console.log("Hi!")
// }

// module.exports.default = deployFunc

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const address = "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    const args = [ethUsdPriceFeedAddress]
    // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
    const fundMe = await deploy("FundMe", {
        from: deployer,
        gasLimit: 4000000,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("-------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
