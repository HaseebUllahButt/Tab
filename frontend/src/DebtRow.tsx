import { useEffect, useRef, useState } from 'react';
import { tabAbi } from './abi';
import { TAB_CONTRACT_ADDRESS } from './contractAddress';
import { formatAmount, short } from './format';
import { useTabWrite } from './useTabWrite';

export type Debt = {
  id: bigint;
  creditor: `0x${string}`;
  debtor: `0x${string}`;
  amount: bigint;
  description: string;
  status: number;
  creditorConfirmedPaid: boolean;
  debtorConfirmedPaid: boolean;
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

  const iConfirmedPaid = iAmDebtor ? debt.debtorConfirmedPaid : debt.creditorConfirmedPaid;
  const otherConfirmedPaid = iAmDebtor ? debt.creditorConfirmedPaid : debt.debtorConfirmedPaid;

  const call = (functionName: 'settleDebt' | 'deleteDebt') =>
    writeContract({
      address: TAB_CONTRACT_ADDRESS,
      abi: tabAbi,
      functionName,
      args: [debt.id],
    });

  const label = isPending ? 'Confirm in wallet…' : busy ? 'Sending…' : null;

  const remove = () => {
    if (window.confirm('Cancel this entry? This is a real transaction and costs a small amount of gas.')) {
      call('deleteDebt');
    }
  };

  const renderAction = () => {
    if (debt.status !== 0) return null;

    if (iConfirmedPaid) {
      return <span className="waiting">waiting on {short(counterparty)}</span>;
    }

    return (
      <>
        {otherConfirmedPaid && <span className="waiting">waiting on you</span>}
        <button className="stamp-btn" disabled={busy} onClick={() => call('settleDebt')}>
          {label ?? (iAmDebtor ? 'I paid this' : 'Payment received')}
        </button>
        {!iAmDebtor && !otherConfirmedPaid && (
          <button className="stamp-btn void-btn" disabled={busy} onClick={remove}>
            {label ?? 'Cancel'}
          </button>
        )}
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
          <span className="debt-amount">{formatAmount(debt.amount)}</span>
        </div>
        {debt.description && <div className="debt-desc">{debt.description}</div>}
      </div>
      <div className="debt-right">
        <span className={`badge ${statusName}${justStamped ? ' just-stamped' : ''}`}>{statusName}</span>
        {renderAction()}
      </div>
    </div>
  );
}
