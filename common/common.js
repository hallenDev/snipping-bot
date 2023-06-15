// includes common functions
import { ethers } from 'ethers'

import { eth_address, uniswap_v2_factory, uniswap_v2_router } from '../constants/constants.js';
import erc20Abi from '../constants/abi/erc20.json' assert { type: "json" };
import uniswapV2FactoryAbi from '../constants/abi/uniswapV2Factory.json' assert { type: "json" };
import uniswapV2RouterAbi from '../constants/abi/uniswapV2Router.json' assert { type: "json" };

export function get_provider () {
    // return new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    return new ethers.providers.WebSocketProvider(process.env.RPC_WSS_URL);
}

export async function get_eth_balance (address, provider) {
    const eth_contract = get_token_contract(eth_address, provider);
    const balance = await eth_contract.balanceOf(address);
    return ethers.utils.formatEther(balance);   // return eth balance
}

export function get_contract (address, abi, provider) {
    return new ethers.Contract(address, abi, provider);
}

export function get_token_contract (address, provider) {
    return get_contract(address, erc20Abi, provider);
}

export function get_uniswap_factory (provider) {
    return new ethers.Contract(uniswap_v2_factory, uniswapV2FactoryAbi, provider);
}

export function get_uniswap_router (provider) {
    return new ethers.Contract(uniswap_v2_router, uniswapV2RouterAbi, provider);
}

export async function get_pair_address (address, provider) {
    const factory = get_uniswap_factory(provider);
    const res = await factory.getPair(address, eth_address);
    return res;
}

export async function get_token_info (address, provider) {
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

export async function get_bytecode (address, provider) {
    try {
        const code = await provider.getCode(address);
        return code;
    } catch (e) {
        console.log('error while getting contract byte code: ', address);
        return null;
    }
}