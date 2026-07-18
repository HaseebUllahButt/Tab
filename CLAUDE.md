# Tab — mutual onchain debt ledger

## Hackathon context
- Event: BuildAnything "Spark" hackathon — https://buildanything.so/hackathons/spark
- Deadline: **July 19, 2026, 11:59 PM UTC** (started July 13, 7-day event)
- Requires: onchain component on Monad (Mainnet preferred, Testnet acceptable), public GitHub repo, hosted app URL, contract address, demo video (max 3 min), problem/solution writeup, category tag.
- Judging: an AI agent checks for (1) work started before the hackathon window, (2) placeholder/hardcoded data instead of a real working app, (3) suspicious commit patterns. Human judges score "elegance and practicality." A separate "Most Viral Solution" prize needs a social post URL.
- Explicitly penalized: AI-slop UI, tutorial-tier projects (todo apps, weather dashboards), undocumented "mystery box" repos, vaporware buttons with fake/hardcoded results.
- Builder has **zero prior crypto/wallet experience** — first onchain project ever.

## The idea
**Problem**: informal debts between friends/roommates ("you owe me for pizza," "I paid the wifi bill") get tracked in someone's head or a single-user app, and disputes ("I paid you back" / "no you didn't") have no record either side trusts, because the record lives in one party's app and either side can silently edit or delete it.

**Solution**: a small onchain ledger with exactly two meaningful actions — create and pay. Settlement is a real, atomic MON transfer: the debtor calls `payDebt` with the exact amount owed, the contract forwards it straight to the creditor, and the debt flips to Settled in that same transaction. There's no separate "I confirm I got paid" step and nothing to dispute — the creditor's wallet balance is the proof. This is the one property only a blockchain (not a database, not a Venmo screenshot) actually provides, so it's a genuine "why onchain" answer, not decoration.

The design went through two earlier iterations, both worth knowing about so they aren't re-litigated:
1. Originally had a `confirmDebt` step (debtor acknowledges the debt is real before it can be settled). Removed: a fabricated debt that's never paid just sits inert forever, so that step protected against nothing and only added a wasted transaction.
2. Then had a two-sided `settleDebt` (both debtor "I paid this" and creditor "I received it" had to independently call it, off-chain payment, no real value moved). Replaced with the current `payDebt` design: instead of *attesting* that an off-chain payment happened, the payment itself happens on-chain. This is strictly better — it's fewer transactions (one instead of two), it's real proof instead of trust, and it's a stronger onchain story for judges.

**Contract shape** (Solidity, target Monad):
- `createDebt(address debtor, uint amount, string description)` — creditor logs a debt, status = Pending. `amount` is real MON, in wei.
- `payDebt(uint id)` — payable, debtor-only; `msg.value` must exactly equal `amount`; forwards the funds to the creditor and flips status to Settled, all in one transaction
- `deleteDebt(uint id)` — creditor-only, only while still Pending (i.e. unpaid); lets you cancel a mistaken entry
- `getDebt(uint id)` / `getDebtsFor(address)` — view functions, free to call (no gas)

Deployed on Monad Testnet (chain 10143): `0x7eb3f576b52c6ef1fa7df9c1be809365eab6b67f` (redeployed after switching to real on-chain `payDebt`; earlier addresses are stale/superseded).

Frontend dev server is pinned to a fixed uncommon port (`58362`, set in `frontend/vite.config.ts`) instead of the 5173 default, so judges hit zero port-collision friction when running it locally. (Port was bumped once already from an initial `47291` pick that collided with something else already running locally — 58362 confirmed free.)

**Frontend**: single-page app, connect wallet (MetaMask/injected only), one screen — create debt (amount in MON) / Open vs History tabs with search once the list gets long / pay (debtor-only, sends real value) / cancel (creditor-only, styled confirm dialog, not the native `window.confirm`) buttons. No auth system beyond wallet signatures. Keep UI legible in one viewport, not decorative (avoid "AI slop" judging flag).

## Why we rejected other ideas (don't resurrect without a new differentiator)
- **Contract security scanner + onchain attestation registry** — crowded, occupied by funded/serious players: CertiK, Hacken, Cyfrin (auditing); Blowfish, Pocket Universe, Wallet Guard (pre-sign transaction preview, 50k+ users). Would read as a worse clone.
- **Dead-man's-switch crypto inheritance** — also occupied: "DeadSwitch" is an existing ETHGlobal Cannes 2026 hackathon project doing the identical check-in/Chainlink mechanism; "Kresus Inheritance" is a funded startup ($38M Series A) doing the same thing as a product.
- **Checked**: existing IOU/debt-tracker apps (OweMate, IOweU, OweFlow, Payback, You Owe Me, etc.) are *all* single-user private-database apps — none are blockchain-based. This is the actual gap Tab fills.

## Setup status / demo plan
- Builder needs to install MetaMask, write down seed phrase safely, add Monad network, fund via testnet faucet first (free), then move to Mainnet only once working (small real cost).
- Demo needs only ONE person: create two accounts inside MetaMask (Account A = creditor, Account B = debtor, both funded with testnet MON), switch between them to show create → debtor pays → creditor's balance visibly goes up in the same transaction, all as real transactions with visible tx hashes / block explorer links.
- Record demo as screen capture, narrate problem + the real-payment-as-settlement differentiator, keep under 3 minutes.

## Build order
1. [x] Solidity contract (createDebt / payDebt / deleteDebt / getDebtsFor)
2. [x] Deploy to Monad Testnet, verify on explorer
3. [x] Frontend (wallet connect, create/pay/cancel, Open/History tabs + search)
4. [ ] Test full flow with two MetaMask accounts (post-payDebt redesign)
5. [ ] Deploy to Monad Mainnet (small real MON cost)
6. [ ] Record demo video, write submission copy
