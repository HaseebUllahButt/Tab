# Tab — frontend

Single-page React + Vite + TypeScript app for the Tab onchain debt ledger, built with wagmi + viem against the Monad Testnet.

## Run

```sh
npm install
npm run dev
```

Then open the printed local URL and connect an injected wallet (e.g. MetaMask). Add the Monad Testnet network to your wallet if prompted — the app defines it (chain id `10143`, RPC `https://testnet-rpc.monad.xyz`, symbol `MON`).

## After deploying the contract

Update the one placeholder constant in **`src/contractAddress.ts`**:

```ts
export const TAB_CONTRACT_ADDRESS = '0xYourDeployedAddress';
```

That is the only value that changes once `Tab.sol` is deployed. Monad network details (RPC, chain id, explorer) live in one place too, at the top of `src/wagmi.ts`, if they ever need editing.
