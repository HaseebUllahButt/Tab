import { defineChain } from 'viem';
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Monad Testnet network details — edit here if the RPC/chain id/explorer change.
const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz';
const MONAD_CHAIN_ID = 10143;
const MONAD_EXPLORER_URL = 'https://testnet.monadexplorer.com';

export const monadTestnet = defineChain({
  id: MONAD_CHAIN_ID,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [MONAD_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: MONAD_EXPLORER_URL },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  transports: {
    [monadTestnet.id]: http(MONAD_RPC_URL),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
