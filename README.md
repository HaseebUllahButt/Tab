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

## Install & run

Requires [Node 18+](https://nodejs.org) and a browser with **MetaMask** installed (see "Wallet support" below).

```sh
git clone https://github.com/HaseebUllahButt/Tab.git
cd Tab/frontend
npm install
npm run dev
```

Opens at **http://localhost:58362** (fixed, uncommon port — chosen so it won't collide with anything else you have running).

In MetaMask, add Monad Testnet if you haven't already (chain id `10143`, RPC `https://testnet-rpc.monad.xyz`, explorer `https://testnet.monadexplorer.com`), fund it from a [Monad testnet faucet](https://testnet.monad.xyz/), connect your wallet on the page, and use two accounts (one as creditor, one as debtor — MetaMask lets you add a second account for free) to see the full create → settle flow.

## Wallet support

The app connects via [wagmi's injected connector](frontend/src/wagmi.ts), i.e. whatever wallet extension injects `window.ethereum` into your browser. **MetaMask is the only wallet this has been built and tested against.** Other injected wallets (Rabby, Coinbase Wallet, Brave Wallet) may work since they use the same interface, but they're untested — there's no WalletConnect/mobile support and no smart-contract-wallet integration.

## Security notes

This is hackathon code, not an audited product. Before treating it as anything more than a demo:

- **The contract has not been professionally audited.** It's small and covered by 12 Foundry tests (`contracts/test/Tab.t.sol`), but that's test coverage, not a security review.
- **No money actually moves on-chain.** `amount` is just a number the creditor types in — Tab records that a debt exists and lets both sides attest it was paid, but the actual payment (cash, Venmo, whatever) happens off-chain. The contract can't verify a payment really happened; it can only record that both named parties agreed it did. Don't rely on it as proof outside a context where both parties are honest about the underlying transfer.
- **Deployed on Monad Testnet.** Testnet MON has no real value — nothing here currently risks real funds. If you deploy your own copy to Mainnet, you're deploying and interacting with it at your own risk, using your own funds.
- **Never share your seed phrase or private key with anyone or anything**, including this app. Tab only ever asks MetaMask to send transactions you approve; it never asks for your seed phrase.
- The deploy script (`contracts/script/Deploy.s.sol`) expects a throwaway deploy-only private key in a local, gitignored `.env` — never put a wallet holding real funds there.

## Contracts

Solidity source, tests, and deploy script live in [`contracts/`](contracts/) — see [`contracts/README.md`](contracts/README.md) for how to build, test (`forge test`, 12 passing tests), and redeploy.

## Stack

- Solidity (Foundry) — [`contracts/src/Tab.sol`](contracts/src/Tab.sol)
- React + TypeScript + Vite — [`frontend/`](frontend/)
- wagmi + viem for wallet connection and contract calls
