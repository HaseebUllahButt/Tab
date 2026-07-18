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

**Solution**: a small onchain ledger with exactly two meaningful actions — create and settle. A debt only flips to Settled once *both* the debtor ("I paid this") and the creditor ("I received it") independently confirm it — a tamper-proof, mutually-attested record that neither party can unilaterally rewrite or falsely claim. This is the one property only a blockchain (not a database) actually provides, so it's a genuine "why onchain" answer, not decoration.

There used to be a separate `confirmDebt` step (debtor acknowledges the debt is real before it can be settled). It was removed: a fabricated debt that's never paid just sits inert forever, so that step protected against nothing and only added a wasted transaction. The only step that needs mutual proof is settlement, since one person's unilateral "paid" claim isn't proof — both sides independently confirming is. This also directly lowers gas cost per debt (one fewer transaction in the common path).

**Contract shape** (Solidity, target Monad):
- `createDebt(address debtor, uint amount, string description)` — creditor logs a debt, status = Pending
- `settleDebt(uint id)` — callable by either party; sets that party's `confirmedPaid` flag; only flips status to Settled once BOTH creditor and debtor have called it
- `deleteDebt(uint id)` — creditor-only, only while still Pending AND before either party has confirmed payment; lets you cancel a mistaken entry
- `getDebt(uint id)` / `getDebtsFor(address)` — view functions, free to call (no gas)

Deployed on Monad Testnet (chain 10143): `0xfb823c9fa3962a420d095aa1a8d3722b6bd48dc7` (redeployed after removing `confirmDebt` and the unused `createdAt` field for lower gas; earlier addresses are stale/superseded).

Frontend dev server is pinned to a fixed uncommon port (`58362`, set in `frontend/vite.config.ts`) instead of the 5173 default, so judges hit zero port-collision friction when running it locally.

**Frontend**: single-page app, connect wallet (MetaMask), one screen — create debt / list of debts by status / settle (role-labeled "I paid this" vs "Payment received") / cancel buttons. No auth system beyond wallet signatures. Keep UI legible in one viewport, not decorative (avoid "AI slop" judging flag).

## Why we rejected other ideas (don't resurrect without a new differentiator)
- **Contract security scanner + onchain attestation registry** — crowded, occupied by funded/serious players: CertiK, Hacken, Cyfrin (auditing); Blowfish, Pocket Universe, Wallet Guard (pre-sign transaction preview, 50k+ users). Would read as a worse clone.
- **Dead-man's-switch crypto inheritance** — also occupied: "DeadSwitch" is an existing ETHGlobal Cannes 2026 hackathon project doing the identical check-in/Chainlink mechanism; "Kresus Inheritance" is a funded startup ($38M Series A) doing the same thing as a product.
- **Checked**: existing IOU/debt-tracker apps (OweMate, IOweU, OweFlow, Payback, You Owe Me, etc.) are *all* single-user private-database apps — none are blockchain-based. This is the actual gap Tab fills.

## Setup status / demo plan
- Builder needs to install MetaMask, write down seed phrase safely, add Monad network, fund via testnet faucet first (free), then move to Mainnet only once working (small real cost).
- Demo needs only ONE person: create two accounts inside MetaMask (Account A = creditor, Account B = debtor), switch between them to show create → both sides settle, all as real transactions with visible tx hashes / block explorer links.
- Record demo as screen capture, narrate problem + the mutual-confirmation differentiator, keep under 3 minutes.

## Build order (in progress)
1. [ ] Solidity contract (createDebt / confirmDebt / settleDebt / getDebtsFor)
2. [ ] Deploy to Monad Testnet, verify on explorer
3. [ ] Minimal frontend (wallet connect + 3 actions + list view)
4. [ ] Test full flow with two MetaMask accounts
5. [ ] Deploy to Monad Mainnet (small real MON cost)
6. [ ] Record demo video, write submission copy
