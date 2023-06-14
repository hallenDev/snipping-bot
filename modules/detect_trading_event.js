// detect trading start event from mempool
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { get_pair_address, get_provider, get_token_info, get_uniswap_router } from '../common/common.js';
import { uniswap_v2_router } from '../constants/constants.js';

dotenv.config();

const provider = get_provider();

async function filterTransaction (txHash, provider) {
    const date = new Date().toUTCString();
    let tx_data = await provider.getTransaction(txHash);
    if(tx_data?.to != uniswap_v2_router) return;
    const add_liquidity_method = ethers.utils.id('addLiquidityETH(address,uint256,uint256,uint256,address,uint256)').substring(0, 10);
    if(tx_data?.data.indexOf(add_liquidity_method) == -1) return;
    const parameter = ethers.utils.defaultAbiCoder.decode(['address','uint256','uint256','uint256','address','uint256'], 
                                                            ethers.utils.hexDataSlice(tx_data.data, 4));
    const eth_balance = ethers.utils.formatEther(tx_data.value);
    const token = parameter[0];
    const token_info = await get_token_info(token, provider);
    const pair_address = await get_pair_address(token, provider);
    const token_balance = ethers.utils.formatUnits(parameter[1], token_info.decimal);
    const res = {
        'action': 'addLiquidityETH',
        'pair_address': pair_address,
        'ETH_balance': eth_balance,
        'token_balance': token_balance,
        'token': token_info,
        'time': date
    }
    console.log(res);
    console.log();

}

provider.on('pending', (txHash) => {
    filterTransaction(txHash, provider);
})