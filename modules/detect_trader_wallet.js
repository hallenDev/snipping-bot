// module for detecting expert trader wallet
require('dotenv').config();
const axios = require('axios');
const ethers = require('ethers');
const mongoose = require('mongoose');
const {
    get_provider
} = require('../common/common.js');
const {
    uniswap_v2_router
} = require('../constants/constants.js');

let wallet_list_schema;
let wallet_list_model;

const actions = [
    ethers.utils.id('swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)').substring(0, 10),
    ethers.utils.id('swapExactETHForTokens(uint256,address[],address,uint256)').substring(0, 10),
    ethers.utils.id('swapETHForExactTokens(uint256,address[],address,uint256)').substring(0, 10),
    ethers.utils.id('swapExactTokensForETHSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)').substring(0, 10),
    ethers.utils.id('swapTokensForExactTokens(uint256,uint256,address[],address,uint256)').substring(0, 10),
    ethers.utils.id('swapExactTokensForTokens(uint256,uint256,address[],address,uint256)').substring(0, 10),
    ethers.utils.id('swapExactTokensForETH(uint256,uint256,address[],address,uint256)').substring(0, 10)
];

async function update_wallet (address, block_number, provider) {
    const eth_balance = ethers.utils.formatEther(await provider.getBalance(address));
    if (eth_balance < 0.3) return;
    const wallet_info = await wallet_list_model.findOne({"address":address});
    if(wallet_info == null) {
        const wallet = new wallet_list_model({
            "address": address,
            "eth_balance": eth_balance.toString(),
            "last_block": block_number
        });
        await wallet.save();
        return;
    }
    const prev_balance = parseFloat(wallet_info.eth_balance);
    if(eth_balance > prev_balance) {
        wallet_info.expert_level ++;
        wallet_info.eth_balance = eth_balance.toString()
    }
    if(block_number - wallet_info.last_block < 3) wallet_info.front_running ++;
    wallet_info.last_block = block_number;
    wallet_info.trading_count ++;
    await wallet_info.save();
}

async function get_trading_action_byBlock (blockNumber, provider) {
    let url = `https://api.etherscan.io/api?module=account&action=txlist&address=${uniswap_v2_router}&startblock=${blockNumber}&endblock=${blockNumber}&page=1&offset=300&sort=asc&apikey=${process.env.ETHERSCAN_API}`;
    const { data } = await axios(url);
    const tx_list = data.result;
    for(let i = 0; i < tx_list.length; i ++) {
        let flg = 0;
        for(let j = 0; j < actions.length; j ++) {
            if(tx_list[i].methodId == actions[j]) {
                flg = 1;
                break;
            }
        }
        if(!flg) break;
        const operator = ethers.utils.getAddress(tx_list[i].from) ;
        update_wallet(operator, blockNumber, provider).then();
    }
}

async function main () {
    const provider = get_provider();
    await mongoose.connect(process.env.MONGODB_URL);
    wallet_list_schema = new mongoose.Schema({
        "address" : String,
        "eth_balance" : String,
        "last_block" : Number,
        "front_running" : {type: Number, default: 0},
        "expert_level" : {type: Number, default: 0},
        "trading_count": {type: Number, default: 1}
    });
    wallet_list_model = mongoose.model('wallet_lists', wallet_list_schema);

    provider.on('block', async(blockNumber) => {
        await get_trading_action_byBlock(blockNumber - 2, provider);
    })
}

main().then()