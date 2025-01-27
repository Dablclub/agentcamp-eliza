export const TokenLauncherABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "initialOwner",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "OwnableInvalidOwner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenPrice",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokensForSale",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "startTime",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "endTime",
                type: "uint256",
            },
        ],
        name: "PreSaleCreated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "creator",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "symbol",
                type: "string",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "totalSupply",
                type: "uint256",
            },
        ],
        name: "TokenCreated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "pricePaid",
                type: "uint256",
            },
        ],
        name: "TokensPurchased",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenAmount",
                type: "uint256",
            },
        ],
        name: "buyTokens",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenPrice",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "minPurchase",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "maxPurchase",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "tokensForSale",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "startTime",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "duration",
                type: "uint256",
            },
        ],
        name: "createPreSale",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "symbol",
                        type: "string",
                    },
                    {
                        internalType: "uint256",
                        name: "totalSupply",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "fid",
                        type: "uint256",
                    },
                    {
                        internalType: "string",
                        name: "imageUrl",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "socialProof",
                        type: "string",
                    },
                    {
                        internalType: "bytes32",
                        name: "salt",
                        type: "bytes32",
                    },
                ],
                internalType: "struct TokenLauncher.TokenConfig",
                name: "config",
                type: "tuple",
            },
        ],
        name: "createToken",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
        ],
        name: "finalizePreSale",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
        ],
        name: "getPreSaleInfo",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "tokenPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "minPurchase",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "maxPurchase",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "startTime",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "endTime",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "tokensForSale",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "tokensSold",
                        type: "uint256",
                    },
                    {
                        internalType: "bool",
                        name: "finalized",
                        type: "bool",
                    },
                    {
                        internalType: "address",
                        name: "tokenAddress",
                        type: "address",
                    },
                ],
                internalType: "struct TokenLauncher.PreSale",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getUserTokens",
        outputs: [
            {
                internalType: "address[]",
                name: "",
                type: "address[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "presales",
        outputs: [
            {
                internalType: "uint256",
                name: "tokenPrice",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "minPurchase",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "maxPurchase",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "startTime",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "endTime",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "tokensForSale",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "tokensSold",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "finalized",
                type: "bool",
            },
            {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "userTokens",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
