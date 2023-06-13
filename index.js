import * as dotenv from 'dotenv';
import { get_eth_balance, get_provider } from './common/common.js';

dotenv.config();

const provider = get_provider();

async function test () {
    const res = await get_eth_balance('0x9345c3e50F31F18A68C5bD210Cce6f2083Ec6943', provider);
    console.log(res);
}

await test();
