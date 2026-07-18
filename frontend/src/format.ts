export function short(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export const ZERO = '0x0000000000000000000000000000000000000000';
