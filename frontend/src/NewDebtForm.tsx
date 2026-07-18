import { useState, type FormEvent } from 'react';
import { isAddress } from 'viem';
import { tabAbi } from './abi';
import { TAB_CONTRACT_ADDRESS } from './contractAddress';
import { toAmountUnits } from './format';
import { useTabWrite } from './useTabWrite';

export function NewDebtForm({ me, onCreated }: { me: `0x${string}`; onCreated: () => void }) {
  const [debtor, setDebtor] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const { writeContract, busy, isPending } = useTabWrite(() => {
    setDebtor('');
    setAmount('');
    setDescription('');
    onCreated();
  });

  const trimmedDebtor = debtor.trim();
  const amountNum = Number(amount);
  const amountUnits = Number.isFinite(amountNum) ? toAmountUnits(amountNum) : 0n;
  const validDebtor = isAddress(trimmedDebtor) && trimmedDebtor.toLowerCase() !== me.toLowerCase();
  const valid = validDebtor && amountUnits > 0n;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    writeContract({
      address: TAB_CONTRACT_ADDRESS,
      abi: tabAbi,
      functionName: 'createDebt',
      args: [trimmedDebtor as `0x${string}`, amountUnits, description.trim()],
    });
  };

  return (
    <form className="newdebt" onSubmit={submit}>
      <div className="newdebt-label">New entry — who owes what</div>
      <input
        className="field-addr mono"
        placeholder="Debtor's wallet address (0x…)"
        value={debtor}
        onChange={(e) => setDebtor(e.target.value)}
      />
      <input
        placeholder="What for (e.g. pizza night)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        min="0.01"
        step="0.01"
        placeholder="Amt (e.g. 12.50)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit" disabled={!valid || busy}>
        {isPending ? 'Confirm in wallet…' : busy ? 'Recording…' : 'Record entry'}
      </button>
    </form>
  );
}
