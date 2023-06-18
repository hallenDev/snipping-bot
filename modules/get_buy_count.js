// get count of buy transaction when trading event is detected. also for the next 2 blocks.
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { get_provider } from '../common/common.js';
import { uniswap_v2_router } from '../constants/constants.js';

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

export async function get_buy_count (trading_event, token) {
    console.log('count of buying ', token);
    let id = 0;
    let res = [];
    res[0] = 0;
    res[1] = 0;
    res[2] = 0;
    const provider = get_provider();

    provider.on('pending', (txHash) => {
        provider.getTransaction(txHash).then((tx_data) => {
            if(tx_data?.to != uniswap_v2_router) return;
            const buy_method = ethers.utils.id('swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)').substring(0, 10);
            if(tx_data?.data.indexOf(buy_method) == -1) return;
            const parameter = ethers.utils.defaultAbiCoder.decode(['uint256','address[]','address','uint256'], 
                                                            ethers.utils.hexDataSlice(tx_data.data, 4));
            if(!parameter[1] && parameter[1][0] != eth_address) return;
            if(parameter[1][1] != token) return;
            console.log(txHash);
            res[id] ++;
        })
    })

    provider.on('block', (blockNumber) => {
        id ++;
        if(id == 3) {
            provider.removeAllListeners();
            sleep(10000);
            console.log('same block count: ', res[0]);
            console.log('next block count: ', res[1]);
            console.log('next block count: ', res[2]);
        }
    })

}


