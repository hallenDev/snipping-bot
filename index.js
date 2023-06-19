require('dotenv').config();
const ethers = require('ethers');
const { get_provider, get_pair_address } = require('./common/common.js');

const provider = get_provider();

async function test () {
    const addr = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
    const res = await get_pair_address(addr, provider);
    console.log(res);
}

test().then();
