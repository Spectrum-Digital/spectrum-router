export const SPECTRUM_ROUTER_ABI = [
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'router',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct AmountsOut[]',
        name: 'path',
        type: 'tuple[]',
      },
    ],
    name: 'getAmountsOut',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'router',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct AmountsOut[][]',
        name: 'paths',
        type: 'tuple[][]',
      },
    ],
    name: 'getAmountsOutMulti',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'amountOut',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'router',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'factory',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'getPairCalldata',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'poolRequestCalldata',
            type: 'bytes',
          },
        ],
        internalType: 'struct PoolRequest[]',
        name: 'path',
        type: 'tuple[]',
      },
    ],
    name: 'getPoolRequests',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'results',
        type: 'bytes[]',
      },
      {
        internalType: 'address[]',
        name: 'tokens0',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'router',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'factory',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'getPairCalldata',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'poolRequestCalldata',
            type: 'bytes',
          },
        ],
        internalType: 'struct PoolRequest[][]',
        name: 'paths',
        type: 'tuple[][]',
      },
    ],
    name: 'getPoolRequestsMulti',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes[]',
            name: 'results',
            type: 'bytes[]',
          },
          {
            internalType: 'address[]',
            name: 'tokens0',
            type: 'address[]',
          },
        ],
        internalType: 'struct PoolRequestResult[]',
        name: 'result',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
