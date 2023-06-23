require('dotenv').config();
const { ethers, BigNumber } = require('ethers');
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
const token_transfer_event = ethers.utils.id("Transfer(address,address,uint256)");

async function sell_tax (token_balance, token, pair_address) {
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

    const res = await tx.wait();
    const logs = res.logs;
    let total = BigNumber.from('0');
    let extra = BigNumber.from('0');
    for(let i = 0; i < logs.length; i ++) {
        if(logs[i]?.address != token) continue;
        if(logs[i]?.topics[0] == token_transfer_event) {
            let tmp = ethers.utils.defaultAbiCoder.decode(['uint256'], logs[i].data)[0];
            const receiver = ethers.utils.defaultAbiCoder.decode(['address'], logs[i].topics[2])[0];                
            total = total.add(tmp.toString());
            if(receiver != pair_address) {
                extra = extra.add(tmp.toString());
            }
        }
    }
    extra = extra.mul(100).div(total.toString());
    console.log("sell tax: " + extra.toString() + "%");

    // analyze token transfer
}

async function buy_tax(eth_balance, token, pair_address) {
    try {
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
        // console.log(tx);
        const res = await tx.wait();
        const logs = res.logs;
        let total = BigNumber.from('0');
        let extra = BigNumber.from('0');
        for(let i = 0; i < logs.length; i ++) {
            if(logs[i]?.address != token) continue;
            if(logs[i]?.topics[0] == token_transfer_event) {
                let tmp = ethers.utils.defaultAbiCoder.decode(['uint256'], logs[i].data)[0];
                const receiver = ethers.utils.defaultAbiCoder.decode(['address'], logs[i].topics[2])[0];                
                total = total.add(tmp.toString());
                if(receiver != to) {
                    extra = extra.add(tmp.toString());
                }
            }
        }
        extra = extra.mul(100).div(total.toString());
        console.log("buy tax: " + extra.toString() + "%");
    } catch (e) {
        console.log(e);
    }

    // analyze token transfer
}