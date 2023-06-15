// get contract function from byte code or verified code
import axios from 'axios';
import * as dotenv from 'dotenv';
import pkg from 'evm';
import { get_bytecode } from '../common/common.js';

dotenv.config();

function get_from_abi (abi) {
    let res = [];
    for (let i = 0; i < abi.length; i ++) {
        if(abi[i].name) {
            let tmp = abi[i].name + '(';
            let inputs = abi[i].inputs;
            for (let j = 0; j < inputs.length; j ++) {
                if (j) tmp +=', ';
                tmp += inputs[j].type + ' ' + inputs[j].name;
            }
            tmp += ')';
            res.push(tmp);
        }
    }
    return res;
}

function get_from_bytecode(code) {
    const { EVM } = pkg;
    const evm = new EVM(code);
    return evm.getFunctions();
}

export async function get_contract_function (address, provider) {
    let function_list;
    let url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API}`;
    const res = await axios(url);
    if(!res || !res.data) {
        console.log('something went wrong.');
        return null;
    }
    if(res.data.status == 0) {
        console.log('Contract is not verified.');
        const code = await get_bytecode(address, provider);
        function_list = get_from_bytecode(code);
    }
    if(res.data.status == 1) {
        console.log('Contract is verified.');
        function_list = get_from_abi(JSON.parse(res.data.result));
    }
    console.log('address: ', address);
    console.log(function_list);
    console.log();
}