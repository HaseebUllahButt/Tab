import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { config } from './wagmi';
import { App } from './App';
import { ToastProvider } from './Toast';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Debts are public on-chain data — safe to cache to disk. Paint
      // instantly from the last-known state on reload, then revalidate.
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

// Nothing sensitive ever lands here: only public reads (debt ids, amounts,
// addresses, statuses) — never wallet keys or signatures.
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'tab-query-cache',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </PersistQueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
