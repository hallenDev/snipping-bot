require('dotenv').config();
const ethers = require('ethers');
const { get_provider, get_pair_address } = require('./common/common.js');
const {
    get_contract_function
} = require('./modules/get_contract_function.js')
const mongoose = require('mongoose');

const provider = get_provider();

async function test () {

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
    console.log(parseInt(new Date().getTime() / 1000));
}

test().then();
