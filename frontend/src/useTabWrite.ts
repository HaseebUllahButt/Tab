import { useEffect } from 'react';
import { useWaitForTransactionReceipt, useWriteContract, type BaseError } from 'wagmi';

function shortErrorMessage(error: unknown): string {
  const shortMessage = (error as Partial<BaseError>)?.shortMessage;
  if (shortMessage) return shortMessage;
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}

export function useTabWrite(onConfirmed: () => void, onError?: (message: string) => void) {
  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      onConfirmed();
      reset();
    }
  }, [isSuccess, onConfirmed, reset]);

  useEffect(() => {
    const error = writeError ?? receiptError;
    if (error) {
      onError?.(shortErrorMessage(error));
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeError, receiptError]);

  // isPending: awaiting the wallet signature; isConfirming: tx is mining.
  return { writeContract, busy: isPending || isConfirming, isPending };
}
