// detect trading start event from mempool
require('dotenv').config();
const ethers = require('ethers');
const {
    get_pair_address, 
    get_provider, 
    get_token_info, 
    get_eth_balance, 
    get_token_contract
} = require('../common/common.js');
const {
    uniswap_v2_router, 
    zero_address 
} = require('../constants/constants.js');

const provider = get_provider();

async function filterTransaction (txHash, provider) {
    const date = new Date().toUTCString();
    let tx_data = await provider.getTransaction(txHash);
    if(!tx_data) return;
    const trading_method = [
        ethers.utils.id('openTrading()').substring(0, 10), 
        ethers.utils.id('setTrading(bool)').substring(0, 10)
    ];
    const add_liquidity_method = ethers.utils.id('addLiquidityETH(address,uint256,uint256,uint256,address,uint256)').substring(0, 10);

    let action;
    let pair_address, eth_balance, token, token_info, token_balance;

    if (tx_data.data.indexOf(trading_method[0]) != -1 || tx_data.data.indexOf(trading_method[1]) != -1) 
    {
        // openTrading() or setTrading(bool) event
        if(tx_data.data.indexOf(trading_method[1]) != -1) {
            const parameter = ethers.utils.defaultAbiCoder.decode(['bool'], 
                ethers.utils.hexDataSlice(tx_data.data, 4));
            if(parameter[0] == false) return;   // setTrading(false)
        }
        
        action = 'start trading';
        token = tx_data.to;
        pair_address = get_pair_address(token, provider);
        if(pair_address == zero_address) return;    // no liquidity
        eth_balance = await get_eth_balance(pair_address, provider);
        const token_contract = get_token_contract(token, provider);
        token_info = await get_token_info(token, provider);
        token_balance = await token_contract.balanceOf(pair_address);
        token_balance = ethers.utils.formatUnits(token_balance, token_info.decimal);
    } 
    else if (tx_data.to == uniswap_v2_router && tx_data.data.indexOf(add_liquidity_method) != -1) 
    {
        // addLiquidityETH() event
        action = 'add liquidityETH';
        const parameter = ethers.utils.defaultAbiCoder.decode(['address','uint256','uint256','uint256','address','uint256'], 
            ethers.utils.hexDataSlice(tx_data.data, 4));
        token = parameter[0];
        pair_address = await get_pair_address(token, provider);
        eth_balance = ethers.utils.formatEther(tx_data.value);
        token_info = await get_token_info(token, provider);
        token_balance = ethers.utils.formatUnits(parameter[1], token_info.decimal);
    } 
    else return;
    const res = {
        'action': action,
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