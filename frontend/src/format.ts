export function short(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export const ZERO = '0x0000000000000000000000000000000000000000';

// Amounts are stored on-chain as an integer number of hundredths (like cents),
// so debts can be for fractional amounts (e.g. 0.50) without touching the
// contract — it's just a plain uint256, the decimal is a display convention.
const AMOUNT_DECIMALS = 100n;

export function toAmountUnits(input: number): bigint {
  return BigInt(Math.round(input * 100));
}

export function formatAmount(units: bigint): string {
  const whole = units / AMOUNT_DECIMALS;
  const frac = units % AMOUNT_DECIMALS;
  return `${whole}.${frac.toString().padStart(2, '0')}`;
}
