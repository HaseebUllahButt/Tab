import { formatEther } from 'viem';

export function short(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export const ZERO = '0x0000000000000000000000000000000000000000';

// Amounts are real MON, stored on-chain in wei (18 decimals) — payDebt
// transfers exactly this much value from debtor to creditor.
export function formatMon(wei: bigint): string {
  const mon = Number(formatEther(wei));
  return `${mon.toFixed(mon < 1 ? 4 : 2)} MON`;
}
