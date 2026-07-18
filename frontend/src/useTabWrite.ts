import { useEffect } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export function useTabWrite(onConfirmed: () => void) {
  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      onConfirmed();
      reset();
    }
  }, [isSuccess, onConfirmed, reset]);

  // isPending: awaiting the wallet signature; isConfirming: tx is mining.
  return { writeContract, busy: isPending || isConfirming, isPending };
}
