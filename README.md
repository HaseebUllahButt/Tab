# Tab

A mutual, tamper-proof debt ledger. A debt only becomes real once the person who owes it agrees. It's only gone once both people say so.

## The problem

Informal debts between friends and roommates ("you owe me for pizza," "I paid the wifi bill") get tracked in someone's head, a group chat, or a single-user app — and the moment there's a dispute ("I paid you back" / "no you didn't"), there's no record either side trusts. The record lives in one party's phone, and either party can silently edit or delete it.

## The solution

Tab is an onchain ledger with exactly two actions:

- Anyone **owed** money can log a debt (`createDebt`) — it starts `Pending`.
- A debt only flips to `Settled` once **both** the debtor ("I paid this") and the creditor ("Payment received") independently call `settleDebt` — one side's word alone is never enough to erase what's owed, or to falsely claim it was paid.
- A creditor can cancel a mistaken entry (`deleteDebt`), but only while it's still `Pending` and before either side has confirmed payment.

This mutual-acknowledgment property — a record neither party can rewrite alone — is the one thing a blockchain gives you that a normal database can't. Keeping it to two actions also keeps gas cost to the minimum needed for that guarantee: no wasted transactions.

## Live deployment

- **Network**: Monad Testnet (chain id `10143`)
- **Contract**: [`0xfb823c9fa3962a420d095aa1a8d3722b6bd48dc7`](https://testnet.monadexplorer.com/address/0xfb823c9fa3962a420d095aa1a8d3722b6bd48dc7)
- Every button in the app (record / settle / cancel) sends a real transaction and costs a small amount of MON in gas — nothing in the UI is simulated or hardcoded. On testnet this is free faucet MON with no real value.

## Run it locally

Requires Node 18+ and a browser wallet extension (e.g. MetaMask) with Monad Testnet added.

```sh
cd frontend
npm install
npm run dev
```

Opens at **http://localhost:58362** (fixed, uncommon port — chosen so it won't collide with anything else you have running).

Connect your wallet, switch to Monad Testnet, and use two accounts (one as creditor, one as debtor) to see the full create → settle flow.

## Contracts

Solidity source, tests, and deploy script live in [`contracts/`](contracts/) — see [`contracts/README.md`](contracts/README.md) for how to build, test (`forge test`, 12 passing tests), and redeploy.

## Stack

- Solidity (Foundry) — [`contracts/src/Tab.sol`](contracts/src/Tab.sol)
- React + TypeScript + Vite — [`frontend/`](frontend/)
- wagmi + viem for wallet connection and contract calls
