# Tab — contracts

`Tab.sol` is a mutual, tamper-proof onchain debt ledger for friends and roommates. A debt only becomes real once both the creditor and the debtor have acknowledged it onchain, and it can only be marked settled once both parties independently confirm. Neither side can unilaterally invent a debt against someone else or erase what they owe.

## Setup

```sh
forge install foundry-rs/forge-std --no-git
```

## Test

```sh
forge test
```

## Deploy

Set `PRIVATE_KEY` and `MONAD_RPC_URL` in a local, untracked `.env` (copy `.env.example`), then:

```sh
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL --broadcast --private-key $PRIVATE_KEY
```

`PRIVATE_KEY` should be a throwaway, deploy-only wallet — never a wallet holding real funds. Keep it in `.env`, which is gitignored.
