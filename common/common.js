// includes common functions
import { ethers } from 'ethers'

export function get_provider () {
    console.log(process.env.RPC_URL);
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    return provider;  // return rpc provider
}

export async function get_eth_balance (address, provider) {
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);   // return eth balance
}

export function get_contract (address, abi, provider) {
    const contract = new ethers.Contract(address, abi, provider);
    return contract;    // return contract interface
}