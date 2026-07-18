import { useEffect, useRef, useState } from 'react';
import { tabAbi } from './abi';
import { ConfirmDialog } from './ConfirmDialog';
import { TAB_CONTRACT_ADDRESS } from './contractAddress';
import { formatMon, short } from './format';
import { useTabWrite } from './useTabWrite';

export type Debt = {
  id: bigint;
  creditor: `0x${string}`;
  debtor: `0x${string}`;
  amount: bigint;
  description: string;
  status: number;
};

const STATUS = ['pending', 'settled'] as const;

export function DebtRow({
  debt,
  entryNo,
  me,
  onChanged,
}: {
  debt: Debt;
  entryNo: number;
  me: `0x${string}`;
  onChanged: () => void;
}) {
  const { writeContract, busy, isPending } = useTabWrite(onChanged);

  const iAmDebtor = debt.debtor.toLowerCase() === me.toLowerCase();
  const counterparty = iAmDebtor ? debt.creditor : debt.debtor;
  const statusName = STATUS[debt.status] ?? 'pending';

  // Re-play the ink-stamp animation whenever the status actually changes.
  const lastStatus = useRef(debt.status);
  const [justStamped, setJustStamped] = useState(false);
  useEffect(() => {
    if (lastStatus.current !== debt.status) {
      lastStatus.current = debt.status;
      setJustStamped(true);
      const t = setTimeout(() => setJustStamped(false), 450);
      return () => clearTimeout(t);
    }
  }, [debt.status]);

  const pay = () =>
    writeContract({
      address: TAB_CONTRACT_ADDRESS,
      abi: tabAbi,
      functionName: 'payDebt',
      args: [debt.id],
      value: debt.amount,
    });

  const remove = () =>
    writeContract({
      address: TAB_CONTRACT_ADDRESS,
      abi: tabAbi,
      functionName: 'deleteDebt',
      args: [debt.id],
    });

  const label = isPending ? 'Confirm in wallet…' : busy ? 'Sending…' : null;

  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const renderAction = () => {
    if (debt.status !== 0) return null;

    if (iAmDebtor) {
      return (
        <button className="stamp-btn" disabled={busy} onClick={pay}>
          {label ?? `Pay ${formatMon(debt.amount)}`}
        </button>
      );
    }

    return (
      <>
        <span className="waiting">waiting on {short(counterparty)}</span>
        <button className="stamp-btn void-btn" disabled={busy} onClick={() => setConfirmingCancel(true)}>
          {label ?? 'Cancel'}
        </button>
      </>
    );
  };

  return (
    <div className="debt">
      <div className="debt-no">No.{String(entryNo).padStart(3, '0')}</div>
      <div className="debt-main">
        <div className="debt-line">
          {iAmDebtor ? (
            <>
              <span className="pill-owe">You owe</span>
              <span className="mono">{short(counterparty)}</span>
            </>
          ) : (
            <>
              <span className="mono">{short(counterparty)}</span>
              <span className="pill-owed">owes you</span>
            </>
          )}
          <span className="debt-amount">{formatMon(debt.amount)}</span>
        </div>
        {debt.description && <div className="debt-desc">{debt.description}</div>}
      </div>
      <div className="debt-right">
        <span className={`badge ${statusName}${justStamped ? ' just-stamped' : ''}`}>{statusName}</span>
        {renderAction()}
      </div>
      {confirmingCancel && (
        <ConfirmDialog
          title="Cancel this entry?"
          body="This is a real transaction and costs a small amount of gas."
          confirmLabel="Cancel entry"
          onConfirm={() => {
            setConfirmingCancel(false);
            remove();
          }}
          onCancel={() => setConfirmingCancel(false)}
        />
      )}
    </div>
  );
}
