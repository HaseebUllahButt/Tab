import { useState, type FormEvent } from 'react';
import { isAddress } from 'viem';
import { tabAbi } from './abi';
import { TAB_CONTRACT_ADDRESS } from './contractAddress';
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
  const validDebtor = isAddress(trimmedDebtor) && trimmedDebtor.toLowerCase() !== me.toLowerCase();
  const valid = validDebtor && Number.isFinite(amountNum) && amountNum > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    writeContract({
      address: TAB_CONTRACT_ADDRESS,
      abi: tabAbi,
      functionName: 'createDebt',
      args: [trimmedDebtor as `0x${string}`, BigInt(Math.trunc(amountNum)), description.trim()],
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
        min="1"
        placeholder="Amt"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit" disabled={!valid || busy}>
        {isPending ? 'Confirm in wallet…' : busy ? 'Recording…' : 'Record entry'}
      </button>
    </form>
  );
}
