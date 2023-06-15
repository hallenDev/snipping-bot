// get contract function from byte code or verified code
import axios from 'axios';
import * as dotenv from 'dotenv';
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
    let res = [];

    return res;
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
        const code = get_bytecode(address);

        function_list = get_from_bytecode(code);
    }
    function_list = get_from_abi(JSON.parse(res.data.result));

    console.log(function_list);
}