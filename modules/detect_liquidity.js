// detect new liquidity
require('dotenv').config();
const ethers = require('ethers');

const { 
    get_eth_balance, 
    get_pair_address,
    get_provider, 
    get_token_contract, 
    get_token_info 
} = require('../common/common.js');
const { 
    uniswap_v2_factory, 
    eth_address 
} = require('../constants/constants.js');

const provider = get_provider();

async function display_liquidity_info (event, provider) {
    const date = new Date().toUTCString();
    const abiCoder = new ethers.utils.AbiCoder();
    const token1 = abiCoder.decode(['address'], event.topics[1])[0];
    const token2 = abiCoder.decode(['address'], event.topics[2])[0];
    if(eth_address != token1 && eth_address != token2) return;

    const token = (eth_address != token1) ? token1 : token2;
    const pair_address = await get_pair_address(token, provider);
    const token_info = await get_token_info(token, provider);
    const eth_balance = await get_eth_balance(pair_address, provider);
    const token_contract = get_token_contract(token, provider);
    let token_balance = await token_contract.balanceOf(pair_address);
    token_balance = ethers.utils.formatUnits(token_balance, token_info.decimal);

    const res = {
        'action': 'PairCreated',
        'pair_address': pair_address,
        'ETH_balance': eth_balance,
        'token_balance': token_balance,
        'token': token_info,
        'date': date
    }
    console.log(res);
    console.log();
}

const filter = {
    address: uniswap_v2_factory,
    topics: [
        ethers.utils.id("PairCreated(address,address,address,uint256)")
    ]
}

provider.on(filter, (event) => {
    display_liquidity_info(event, provider);
})
