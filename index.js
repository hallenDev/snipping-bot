require('dotenv').config();
const ethers = require('ethers');
const { get_provider, get_pair_address } = require('./common/common.js');
const {
    get_contract_function
} = require('./modules/get_contract_function.js')

const provider = get_provider();

async function test () {
    // const addr = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
    // const res = await get_pair_address(addr, provider);
    // console.log(res);
    const addr = '0x25504baC55267E6939CEEEa3C8A13eC72632796C';
    get_contract_function(addr, provider)
}

test().then();
