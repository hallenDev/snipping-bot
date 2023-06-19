// includes common functions
const ethers = require('ethers');
const { eth_address, uniswap_v2_factory, uniswap_v2_router } = require('../constants/constants.js');
const erc20Abi = require( '../constants/abi/erc20.json');
const uniswapV2FactoryAbi = require('../constants/abi/uniswapV2Factory.json');
const uniswapV2RouterAbi = require('../constants/abi/uniswapV2Router.json');

function get_provider () {
    // return new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    return new ethers.providers.WebSocketProvider(process.env.RPC_WSS_URL);
}

async function get_eth_balance (address, provider) {
    const eth_contract = get_token_contract(eth_address, provider);
    const balance = await eth_contract.balanceOf(address);
    return ethers.utils.formatEther(balance);   // return eth balance
}

function get_contract (address, abi, provider) {
    return new ethers.Contract(address, abi, provider);
}

function get_token_contract (address, provider) {
    return get_contract(address, erc20Abi, provider);
}

function get_uniswap_factory (provider) {
    return new ethers.Contract(uniswap_v2_factory, uniswapV2FactoryAbi, provider);
}

function get_uniswap_router (provider) {
    return new ethers.Contract(uniswap_v2_router, uniswapV2RouterAbi, provider);
}

async function get_pair_address (address, provider) {
    const factory = get_uniswap_factory(provider);
    const res = await factory.getPair(address, eth_address);
    return res;
}

async function get_token_info (address, provider) {
    const contract = get_token_contract(address, provider);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    let total_supply = await contract.totalSupply();
    total_supply = ethers.utils.formatUnits(total_supply, decimals);
    const res = {
        'address': address,
        'name': name,
        'symbol': symbol,
        'decimal': decimals,
        'total_supply': total_supply
    }
    return res;
}

async function get_bytecode (address, provider) {
    try {
        const code = await provider.getCode(address);
        return code;
    } catch (e) {
        console.log('error while getting contract byte code: ', address);
        return null;
    }
}

module.exports = {
    get_provider, 
    get_eth_balance, 
    get_contract, 
    get_bytecode, 
    get_token_info, 
    get_pair_address, 
    get_uniswap_router, 
    get_uniswap_factory, 
    get_token_contract
}