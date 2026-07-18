# Tab

A mutual debt ledger where settlement is a real payment. When the debtor pays, the MON goes straight to the creditor's wallet in the same transaction that closes the debt out — nobody has to separately vouch that it happened, because the chain already proves it.

## The problem

Informal debts between friends and roommates ("you owe me for pizza," "I paid the wifi bill") get tracked in someone's head, a group chat, or a single-user app — and the moment there's a dispute ("I paid you back" / "no you didn't"), there's no record either side trusts. The record lives in one party's phone, and either party can silently edit or delete it.

## The solution

Tab is an onchain ledger with exactly two actions:

- Anyone **owed** money can log a debt (`createDebt`) — it starts `Pending`.
- The debtor pays it off (`payDebt`), sending the exact amount owed, in MON, straight to the creditor's wallet through the contract. The debt flips to `Settled` in that same transaction. There's no separate "I confirm I got paid" step, because the creditor really did just get paid, on-chain, and that's not something either side can dispute or fake.
- A creditor can cancel a mistaken entry (`deleteDebt`), but only while it's still `Pending` — once it's paid, the transfer already happened and the record can't be unilaterally erased.

Real value moving atomically with the record update — impossible to dispute, impossible to fake — is the one thing a blockchain gives you that a normal database (or a Venmo receipt someone could screenshot-fake) can't.

## Live deployment

- **Network**: Monad Testnet (chain id `10143`)
- **Contract**: [`0x7eb3f576b52c6ef1fa7df9c1be809365eab6b67f`](https://testnet.monadexplorer.com/address/0x7eb3f576b52c6ef1fa7df9c1be809365eab6b67f)
- Every button in the app (record / pay / cancel) sends a real transaction — nothing in the UI is simulated or hardcoded. Paying a debt is a real MON transfer to the creditor, not just a status flag. On testnet this is free faucet MON with no real-world value.

## Install & run

Requires [Node 18+](https://nodejs.org) and a browser with **MetaMask** installed (see "Wallet support" below).

```sh
git clone https://github.com/HaseebUllahButt/Tab.git
cd Tab/frontend
npm install
npm run dev
```

Opens at **http://localhost:58362** (fixed, uncommon port — chosen so it won't collide with anything else you have running).

In MetaMask, add Monad Testnet if you haven't already (chain id `10143`, RPC `https://testnet-rpc.monad.xyz`, explorer `https://testnet.monadexplorer.com`), fund it from a [Monad testnet faucet](https://testnet.monad.xyz/), connect your wallet on the page, and use two accounts (one as creditor, one as debtor — MetaMask lets you add a second account for free) to see the full create → pay flow. You'll need testnet MON in the debtor account to actually pay a debt off.

## Wallet support

The app connects via [wagmi's injected connector](frontend/src/wagmi.ts), i.e. whatever wallet extension injects `window.ethereum` into your browser. **MetaMask is the only wallet this has been built and tested against.** Other injected wallets (Rabby, Coinbase Wallet, Brave Wallet) may work since they use the same interface, but they're untested — there's no WalletConnect/mobile support and no smart-contract-wallet integration.

## Security notes

This is hackathon code, not an audited product. Before treating it as anything more than a demo:

- **The contract has not been professionally audited.** It's small and covered by 12 Foundry tests (`contracts/test/Tab.t.sol`), but that's test coverage, not a security review.
- **Real MON moves on-chain.** `payDebt` is `payable` — the debtor must send exactly the amount owed, and the contract forwards it directly to the creditor in the same transaction. This is a genuine, irreversible transfer, not a status flag. There's no escrow and no refund path: if you pay the wrong amount the transaction simply reverts (so funds never leave your wallet on a mismatch), but once a payment succeeds it's final, like any on-chain transfer.
- **Deployed on Monad Testnet.** Testnet MON has no real-world value — nothing here currently risks real funds. If you deploy your own copy to Mainnet, every `payDebt` call moves real money, at your own risk.
- **Never share your seed phrase or private key with anyone or anything**, including this app. Tab only ever asks MetaMask to send transactions you approve; it never asks for your seed phrase.
- The deploy script (`contracts/script/Deploy.s.sol`) expects a throwaway deploy-only private key in a local, gitignored `.env` — never put a wallet holding real funds there.

## Contracts

Solidity source, tests, and deploy script live in [`contracts/`](contracts/) — see [`contracts/README.md`](contracts/README.md) for how to build, test (`forge test`, 12 passing tests), and redeploy.

## Stack

- Solidity (Foundry) — [`contracts/src/Tab.sol`](contracts/src/Tab.sol)
- React + TypeScript + Vite — [`frontend/`](frontend/)
- wagmi + viem for wallet connection and contract calls
