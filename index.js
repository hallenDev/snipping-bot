import * as dotenv from 'dotenv';
import { get_eth_balance, get_provider } from './common/common.js';
import { get_contract_function } from './modules/get_contract_function.js';

dotenv.config();

const provider = get_provider();

async function test () {
    const res = await get_eth_balance('0x9345c3e50F31F18A68C5bD210Cce6f2083Ec6943', provider);
    console.log(res);

    // check get_contract function
    const token = '0x1B3e758df7B615651a632483aa5CF97A2650A434';
    await get_contract_function(token, provider);

}

await test();
