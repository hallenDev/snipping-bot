// detect trading start event from mempool
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { get_provider, get_uniswap_router } from '../common/common.js';
import { uniswap_v2_router } from '../constants/constants.js';

dotenv.config();

const provider = get_provider();

async function filterTransaction (txHash, provider) {
    let tx_data = await provider.getTransaction(txHash);
    if(tx_data?.to != uniswap_v2_router) return;
    const add_liquidity_method = ethers.utils.id('addLiquidityETH(address,uint256,uint256,uint256,address,uint256)').substring(0, 10);
    if(tx_data?.data.indexOf(add_liquidity_method) == -1) return;
    console.log(tx_data);
    console.log();
}

provider.on('pending', (txHash) => {
    filterTransaction(txHash, provider);
})