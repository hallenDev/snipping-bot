// detect new liquidity
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

import { get_eth_balance, get_pair_address, get_provider, get_token_info } from "../common/common.js";
import { uniswap_v2_factory, eth_address } from '../constants/constants.js';

dotenv.config();

async function display_liquidity_info (event) {
    const abiCoder = new ethers.utils.AbiCoder();
    const token1 = abiCoder.decode(['address'], event.topics[1])[0];
    const token2 = abiCoder.decode(['address'], event.topics[2])[0];
    if(eth_address != token1 && eth_address != token2) return;
    const token = (eth_address != token1) ? token1 : token2;
    const token_info = await get_token_info(token, provider);
    const liquidity_address = await get_pair_address(token);
    const eth_balance = await get_eth_balance(liquidity_address, provider);
    const res = {
        'liquidity address': liquidity_address,
        'ETH balance': eth_balance,
        'token': token_info
    }
    console.log(res);
    console.log();
}

const provider = get_provider();

const filter = {
    address: uniswap_v2_factory,
    topics: [
        ethers.utils.id("PairCreated(address,address,address,uint256)")
    ]
}

provider.on(filter, (event) => {
    display_liquidity_info(event);
})
