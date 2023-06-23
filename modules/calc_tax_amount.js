require('dotenv').config();
const ethers = require('ethers');
const {
    get_virtual_provider,
    get_uniswap_router
} = require('../common/common.js');
const {
    eth_address
} = require('../constants/constants.js')

const provider = get_virtual_provider();
const test_private = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const signer = new ethers.Wallet(test_private, provider);

async function buy_tax (token_balance, token) {
    const uniswap_router = get_uniswap_router(signer);
    const amountIn = token_balance;
    const amountOutMin = 0;
    const path = [token, eth_address];
    const to = await signer.getAddress();
    const deadline = parseInt(new Date().getTime() / 1000) + 600;
    const tx = await uniswap_router.swapExactTokensForETHSupportingFeeOnTransferTokens(
        amountIn,
        amountOutMin,
        path,
        to,
        deadline,
        options
    );

    // analyze token transfer
}

async function sell_tax(eth_balance, token) {
    const uniswap_router = get_uniswap_router(signer);
    const options = {value: ethers.utils.parseEther(eth_balance)}
    const amountOutMin = 0;
    const path = [eth_address, token];
    const to = await signer.getAddress();
    const deadline = parseInt(new Date().getTime() / 1000) + 600;
    const tx = await uniswap_router.swapExactETHForTokensSupportingFeeOnTransferTokens(
        amountOutMin,
        path,
        to,
        deadline,
        options
    );

    // analyze token transfer
}