// get count of buy transaction when trading event is detected. also for the next 2 blocks.
const ethers = require('ethers');
const axios = require('axios');
const { get_provider } = require('../common/common.js');
const { uniswap_v2_router } = require('../constants/constants.js');

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

async function get_buy_count_onBlock (blockNumber, token) {
    let res = 0;
    let url = `https://api.etherscan.io/api?module=account&action=txlist&address=${uniswap_v2_router}&startblock=${blockNumber}&endblock=${blockNumber}&page=1&offset=300&sort=asc&apikey=${process.env.ETHERSCAN_API}`;
    const { data } = await axios(url);
    const tx_list = data.result;
    const buy_action1 = ethers.utils.id('swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)').substring(0, 10);
    const buy_action2 = ethers.utils.id('swapETHForExactTokens(uint256,address[],address,uint256)').substring(0, 10);
    for (let i = 0; i < tx_list.length; i ++) {
        if(tx_list[i].methodId != buy_action1 && tx_list[i].methodId != buy_action2) continue;
        const parameter = ethers.utils.defaultAbiCoder.decode(['uint256','address[]','address','uint256'], ethers.utils.hexDataSlice(tx_list[i].input, 4));
        if(!parameter[1] && parameter[1][0] != eth_address) continue;
        if(parameter[1][1] != token) continue;
        res ++;
    }
    return res;
}

async function get_buy_count (trading_event, token) {
    let id = 0;
    let res_pending = Array(3).fill(0);
    let res_onBlock = Array(3).fill(0);
    const provider = get_provider();

    provider.on('pending', (txHash) => {
        let tmp = id;
        provider.getTransaction(txHash).then((tx_data) => {
            if(tx_data?.to != uniswap_v2_router) return;
            const buy_method = ethers.utils.id('swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)').substring(0, 10);
            if(tx_data?.data.indexOf(buy_method) == -1) return;
            const parameter = ethers.utils.defaultAbiCoder.decode(['uint256','address[]','address','uint256'], 
                                                            ethers.utils.hexDataSlice(tx_data.data, 4));
            if(!parameter[1] && parameter[1][0] != eth_address) return;
            if(parameter[1][1] != token) return;
            console.log(txHash);
            res_pending[tmp] ++;
        })
    })

    provider.on('block', async (blockNumber) => {
        id ++;

        if(id == 3) {
            provider.removeAllListeners();
            res_onBlock[id - 1] = await get_buy_count_onBlock(blockNumber, token);
            sleep(10000);
            console.log('count of buying ', token);
            console.log('trading event pending block: ', res_pending[0]);
            console.log('trading event added block: ', res_onBlock[0]);
            console.log('trading event pending next block: ', res_pending[1]);
            console.log('trading event added next block: ', res_onBlock[1]);
            console.log('trading event pending next 2 blocks: ', res_pending[2]);
            console.log('trading event added next 2 blocks: ', res_onBlock[2]);
        } else {
            res_onBlock[id - 1] = await get_buy_count_onBlock(blockNumber, token);
        }
    })

}


