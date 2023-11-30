export const __FACTORY_PAIR_FOR_A_B_STABLE = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenA',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenB',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'stable',
        type: 'bool',
      },
    ],
    name: 'pairFor',
    outputs: [
      {
        internalType: 'address',
        name: 'pair',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
