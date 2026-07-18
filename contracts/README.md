# Tab — contracts

`Tab.sol` is an onchain debt ledger for friends and roommates. A creditor logs a debt with `createDebt`; the debtor settles it with `payDebt`, a payable call that forwards the exact amount owed straight to the creditor's wallet and flips the debt to Settled in the same transaction. Settlement is a real, atomic MON transfer — not a status flag either side could fake or dispute.

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
