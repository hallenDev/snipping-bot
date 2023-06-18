import * as dotenv from 'dotenv';
import { get_eth_balance, get_provider } from './common/common.js';
import { get_contract_function } from './modules/get_contract_function.js';
import { get_buy_count } from './modules/get_buy_count.js';
import { uniswap_v2_router, eth_address } from './constants/constants.js';
import { ethers } from 'ethers'

dotenv.config();

const provider = get_provider();

async function test () {
    const res = await get_eth_balance('0x9345c3e50F31F18A68C5bD210Cce6f2083Ec6943', provider);
    // console.log(res);

    // check get buy tx count
    // const counts = await get_buy_count('1');
    // console.log(counts);

    const txHash = '0x3fff65b91923bd23c7505ed23125baa29ac3ad71efeee9d4111dfeeaee2fa608';

}

await test();
