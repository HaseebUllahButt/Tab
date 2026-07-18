import { useState, type FormEvent } from 'react';
import { isAddress, parseEther } from 'viem';
import { tabAbi } from './abi';
import { TAB_CONTRACT_ADDRESS } from './contractAddress';
import { useTabWrite } from './useTabWrite';

function parseMon(input: string): bigint {
  try {
    return input.trim() ? parseEther(input.trim()) : 0n;
  } catch {
    return 0n;
  }
}

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
  const amountWei = parseMon(amount);
  const validDebtor = isAddress(trimmedDebtor) && trimmedDebtor.toLowerCase() !== me.toLowerCase();
  const valid = validDebtor && amountWei > 0n;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    writeContract({
      address: TAB_CONTRACT_ADDRESS,
      abi: tabAbi,
      functionName: 'createDebt',
      args: [trimmedDebtor as `0x${string}`, amountWei, description.trim()],
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
        min="0"
        step="any"
        placeholder="Amt in MON (e.g. 0.05)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit" disabled={!valid || busy}>
        {isPending ? 'Confirm in wallet…' : busy ? 'Recording…' : 'Record entry'}
      </button>
    </form>
  );
}
