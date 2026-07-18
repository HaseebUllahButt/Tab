export const tabAbi = [
  {
    type: 'function',
    name: 'createDebt',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'debtor', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'description', type: 'string' },
    ],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'payDebt',
    stateMutability: 'payable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'deleteDebt',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getDebt',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [
      { name: 'creditor', type: 'address' },
      { name: 'debtor', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'description', type: 'string' },
      { name: 'status', type: 'uint8' },
    ],
  },
  {
    type: 'function',
    name: 'getDebtsFor',
    stateMutability: 'view',
    inputs: [{ name: 'who', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    type: 'event',
    name: 'DebtCreated',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'creditor', type: 'address', indexed: true },
      { name: 'debtor', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'description', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'DebtSettled',
    inputs: [{ name: 'id', type: 'uint256', indexed: true }],
  },
  {
    type: 'event',
    name: 'DebtDeleted',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'creditor', type: 'address', indexed: true },
    ],
  },
] as const;
