import * as dotenv from 'dotenv';
import { get_eth_balance, get_provider } from './common/common.js';
import { get_contract_function } from './modules/get_contract_function.js';

dotenv.config();

const provider = get_provider();

async function test () {
    const res = await get_eth_balance('0x9345c3e50F31F18A68C5bD210Cce6f2083Ec6943', provider);
    // console.log(res);

    // check get_contract function
    const token_1 = '0x1B3e758df7B615651a632483aa5CF97A2650A434'; // verified
    const token_2 = '0xb81c759eDC53E5DB9e4CaD0A8435b6Ad6c7965Da'; // unverified
    console.log();
    await get_contract_function(token_2, provider);
    await get_contract_function(token_1, provider);

}

await test();
