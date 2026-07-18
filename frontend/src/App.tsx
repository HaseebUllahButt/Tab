import { useMemo, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useReadContracts } from 'wagmi';
import { tabAbi } from './abi';
import { TAB_CONTRACT_ADDRESS } from './contractAddress';
import { short, ZERO } from './format';
import { NewDebtForm } from './NewDebtForm';
import { DebtRow, type Debt } from './DebtRow';

const tab = { address: TAB_CONTRACT_ADDRESS, abi: tabAbi } as const;

function ConnectBar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const injected = connectors[0];

  if (isConnected && address) {
    return (
      <span className="addr">
        <span className="dot" />
        <span className="mono">{short(address)}</span>
        <button className="ghost" onClick={() => disconnect()}>
          Disconnect
        </button>
      </span>
    );
  }

  return (
    <button disabled={isPending || !injected} onClick={() => injected && connect({ connector: injected })}>
      {isPending ? 'Connecting…' : 'Connect wallet'}
    </button>
  );
}

function Ledger({ me }: { me: `0x${string}` }) {
  const { data: ids, refetch: refetchIds } = useReadContract({
    ...tab,
    functionName: 'getDebtsFor',
    args: [me],
  });

  const { data: raw, refetch: refetchDebts } = useReadContracts({
    contracts: (ids ?? []).map((id) => ({
      ...tab,
      functionName: 'getDebt' as const,
      args: [id] as const,
    })),
    query: { enabled: (ids?.length ?? 0) > 0 },
  });

  const refetch = () => {
    refetchIds();
    refetchDebts();
  };

  const debts = useMemo<Debt[]>(() => {
    if (!ids || !raw) return [];
    return ids
      .map((id, i) => {
        const r = raw[i]?.result as readonly unknown[] | undefined;
        if (!r) return null;
        const creditor = r[0] as `0x${string}`;
        if (creditor.toLowerCase() === ZERO) return null;
        return {
          id,
          creditor,
          debtor: r[1] as `0x${string}`,
          amount: r[2] as bigint,
          description: r[3] as string,
          status: Number(r[4]),
          creditorConfirmedPaid: r[5] as boolean,
          debtorConfirmedPaid: r[6] as boolean,
        } satisfies Debt;
      })
      .filter((d): d is Debt => d !== null)
      .reverse();
  }, [ids, raw]);

  const [view, setView] = useState<'open' | 'history'>('open');
  const [query, setQuery] = useState('');

  const { open, history } = useMemo(() => {
    const open: Debt[] = [];
    const history: Debt[] = [];
    for (const d of debts) (d.status === 0 ? open : history).push(d);
    return { open, history };
  }, [debts]);

  const visible = view === 'open' ? open : history;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((d) => {
      const counterparty = d.creditor.toLowerCase() === me.toLowerCase() ? d.debtor : d.creditor;
      return counterparty.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
    });
  }, [visible, query, me]);

  return (
    <>
      <NewDebtForm me={me} onCreated={refetch} />

      <div className="ledger-tabs">
        <button className={`ledger-tab${view === 'open' ? ' active' : ''}`} onClick={() => setView('open')}>
          Open <span className="count">{open.length}</span>
        </button>
        <button
          className={`ledger-tab${view === 'history' ? ' active' : ''}`}
          onClick={() => setView('history')}
        >
          History <span className="count">{history.length}</span>
        </button>
      </div>

      {debts.length > 6 && (
        <input
          className="search mono"
          placeholder="Search by address or description…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          {query
            ? 'No entries match that search.'
            : view === 'open'
              ? 'Nothing open. Record one above.'
              : 'No settled entries yet.'}
        </div>
      ) : (
        <div>
          {filtered.map((d, i) => (
            <DebtRow key={d.id.toString()} debt={d} entryNo={i + 1} me={me} onChanged={refetch} />
          ))}
        </div>
      )}
    </>
  );
}

export function App() {
  const { address, isConnected } = useAccount();
  const placeholder = TAB_CONTRACT_ADDRESS.toLowerCase() === ZERO;

  return (
    <div className="wrap">
      <div className="pad">
        <div className="masthead">
          <span className="brand">Tab</span>
          <span className="seal">● live on monad</span>
        </div>
        <p className="tagline">
          Log what's owed. It's only marked settled once you both say so — no one can erase a debt alone.
        </p>
        <div className="signline">
          <span className="signline-label">{isConnected ? 'Signed in as' : 'Not signed in'}</span>
          <ConnectBar />
        </div>

        {placeholder && (
          <div className="empty">
            Contract address not set — update <span className="mono">TAB_CONTRACT_ADDRESS</span> after deployment.
          </div>
        )}

        {!isConnected || !address ? (
          <div className="empty">Connect your wallet to open your ledger.</div>
        ) : (
          <Ledger me={address} />
        )}
      </div>
      <p className="footnote">every entry below is a real transaction on Monad — nothing here is faked</p>
    </div>
  );
}
