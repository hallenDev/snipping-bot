// get correct eth to buy at very first of block of tokens

export function get_correct_ETH (eth_balance, token_balance, token_supply) {
    // assume that we can buy 1% of total supply max
    const balance_buyable = token_supply / 100;
    if(token_balance < balance_buyable) return 0.05;
    const max_eth = eth_balance * balance_buyable / token_balance;
    return (max_eth > 0.05) ? 0.05: max_eth;
}