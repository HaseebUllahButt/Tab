# Tab

You know the argument. Someone covers pizza, someone else says they'll "get it back later," and three weeks later nobody agrees on who owes what. Group chat IOUs die in the scroll. Cash app screenshots get "lost." Someone swears they paid; someone else swears they didn't.

Tab fixes that by making the payment itself the receipt. When your roommate pays you back through Tab, the money actually moves on the blockchain, right there, in the same click that marks the debt as settled. Nobody has to take anyone's word for it — the transaction is the proof, forever, for both of you to see.

## How it actually works

Two things you can do, that's it:

1. **Log a debt.** Someone owes you money? Type in their wallet address, what it's for ("pizza night," "half the wifi bill"), and how much — click one button. It shows up on both your ledgers as "Pending."
2. **Pay it off.** The person who owes shows up, clicks "Pay," and their wallet sends the exact amount straight to the other person's wallet. Done. The debt flips to "Settled" instantly, in that same transaction — because the money genuinely just moved, there's nothing left to confirm or dispute.

(There's also a "Cancel" button if you logged something by mistake, but only before it's been paid — once real money's moved, nobody gets to quietly erase that.)

## How to use it (step by step, zero crypto experience needed)

1. **Install MetaMask.** It's a free browser extension — [get it here](https://metamask.io/download/). It's basically your login and your wallet in one.
2. **Add Monad Testnet to MetaMask.** This app currently runs on Monad's testnet (practice-money version of the real network) — network details: chain ID `10143`, RPC `https://testnet-rpc.monad.xyz`, explorer `https://testnet.monadexplorer.com`.
3. **Get free testnet MON.** Head to the [Monad testnet faucet](https://testnet.monad.xyz/) and grab some — it costs nothing and it's not real money, it's just what you need to click buttons and pay debts while testing.
4. **Open the app** and click **Connect wallet**. MetaMask will pop up asking you to approve — say yes.
5. **To log a debt:** paste in the other person's wallet address, say what it's for, type the amount in MON, hit **Record entry**.
6. **To pay someone back:** find the entry, hit **Pay**, confirm in MetaMask. That's it — you're done, and so is the debt.
7. **Made a mistake?** Hit **Cancel** on an entry before the other person pays it.

Want to try the whole loop yourself without roping in a friend? Add a second account inside MetaMask (it's free, just a few clicks), fund both with testnet MON, and pretend to owe yourself money.

## Is this MetaMask only?

**Basically, yes.** Under the hood it connects through whatever wallet extension your browser has injected (technically it'll try to talk to anything that behaves like MetaMask — Rabby, Coinbase Wallet, Brave Wallet might work), but **MetaMask is the only one this has actually been built and tested against.** No WalletConnect, no mobile wallets, no "scan this QR code" — just a browser extension wallet.

## Gotchas — read this before you take it seriously

This was built solo, fast, for a hackathon. It's a proof of concept, not a product you should trust with real money without a lot more scrutiny:

- **The contract hasn't been professionally audited.** It's got 12 automated tests and they all pass, but that's not the same thing as a security review by people whose job is finding holes.
- **Real money moves, and there's no undo.** Once a payment goes through, it's a real, final on-chain transfer — same as sending crypto anywhere else. Send the wrong amount and the transaction just fails (your money stays put), but a successful payment can't be reversed or refunded through the app.
- **It's currently on testnet**, meaning the MON involved right now is fake practice money with no real value. That'll change if/when this gets deployed to Mainnet — at that point every payment is real money, so treat it accordingly.
- **Amounts are in MON directly** — there's no "type in dollars" conversion. You're paying crypto, not fiat.
- **Never, ever type your seed phrase into anything.** Tab (or any legitimate app) will only ever ask MetaMask to approve a transaction — it never needs your seed phrase, and if anything ever asks for it, that's a scam.

## Live deployment

- **App**: [tab-monad.vercel.app](https://tab-monad.vercel.app)
- **Network**: Monad Testnet (chain id `10143`)
- **Contract**: [`0x7eb3f576b52c6ef1fa7df9c1be809365eab6b67f`](https://testnet.monadexplorer.com/address/0x7eb3f576b52c6ef1fa7df9c1be809365eab6b67f)
- Every button here fires a real transaction — nothing in this app is faked or hardcoded for demo purposes. Paying a debt is a genuine MON transfer, not a status flag being flipped behind the scenes.

## Install & run it yourself

Requires [Node 18+](https://nodejs.org) and MetaMask installed in your browser.

```sh
git clone https://github.com/HaseebUllahButt/Tab.git
cd Tab/frontend
npm install
npm run dev
```

Opens at **http://localhost:58362** (a fixed, uncommon port so it won't collide with anything else you've already got running).

## Contracts

Solidity source, tests, and the deploy script live in [`contracts/`](contracts/) — see [`contracts/README.md`](contracts/README.md) for how to build, test (`forge test`, 12 passing), and redeploy.

## Stack

- Solidity (Foundry) — [`contracts/src/Tab.sol`](contracts/src/Tab.sol)
- React + TypeScript + Vite — [`frontend/`](frontend/)
- wagmi + viem for wallet connection and contract calls
