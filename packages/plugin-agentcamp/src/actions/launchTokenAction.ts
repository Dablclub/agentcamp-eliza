import {
    Action,
    ActionExample,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    HandlerCallback,
    composeContext,
    generateObjectDeprecated,
} from "@elizaos/core";
import { initWalletProvider } from "../providers/wallet";
import { TokenLauncherABI } from "../lib/TokenLauncherABI";
import { polygonAmoy } from "viem/chains";
import { parseEther } from "viem";

interface TokenConfig {
    name: string;
    symbol: string;
    totalSupply: bigint;
    fid: bigint;
    imageUrl: string;
    socialProof: string;
    salt: `0x${string}`;
}

interface LaunchTokenContent {
    name: string;
    symbol: string;
    totalSupply: string;
    fid: string;
    imageUrl: string;
    socialProof: string;
}

const launchTokenTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "name": "My Token",
    "symbol": "MTK",
    "totalSupply": "1000000",
    "fid": "123",
    "imageUrl": "https://i.imgur.com/example.jpg",
    "socialProof": "0x1234567890abcdef1234567890abcdef12345678"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the token launch:
- Token name
- Token symbol
- Total supply
- Farcaster ID (fid) - must be a valid Farcaster user ID
- Image URL - must be a valid image URL (supported: i.imgur.com, arweave.net, ipfs.io)
- Social proof - must be a valid Farcaster cast hash starting with 0x

Note: For social proof, look for a cast hash. For image URL, look for embedded images or image links.

Respond with a JSON markdown block containing only the extracted values.`;

const missingTokenConfigTemplate = `Here are the token parameters I have confirmed:

{{#each confirmed}}
- {{@key}}: {{this}}
{{/each}}

The following required parameters are missing:
{{#each missing}}
- {{this}}
{{/each}}

Please provide values for the missing parameters to proceed with the token launch.`;

function isLaunchTokenContent(
    content: LaunchTokenContent
): content is LaunchTokenContent {
    return (
        typeof content.name === "string" &&
        typeof content.symbol === "string" &&
        typeof content.totalSupply === "string" &&
        typeof content.fid === "string" &&
        typeof content.imageUrl === "string" &&
        typeof content.socialProof === "string"
    );
}

export const launchTokenAction: Action = {
    name: "LAUNCH_TOKEN",
    description: "Launch a new token with specified parameters",
    similes: ["CREATE_TOKEN", "DEPLOY_TOKEN", "NEW_TOKEN"],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: unknown,
        callback?: HandlerCallback
    ): Promise<boolean> => {
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        console.log("Launch token action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const walletClient = walletProvider.getWalletClient("polygonAmoy");

        try {
            // Generate token details from context
            const context = composeContext({
                state,
                template: launchTokenTemplate,
            });

            const content = await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            });

            if (!isLaunchTokenContent(content)) {
                const missingTokenConfig = await generateObjectDeprecated({
                    runtime,
                    context: composeContext({
                        state,
                        template: missingTokenConfigTemplate,
                    }),
                    modelClass: ModelClass.LARGE,
                });

                if (callback) {
                    callback({
                        text: `Missing token config: ${missingTokenConfig}`,
                        content: {
                            success: false,
                            error: "Missing required token parameters",
                        },
                    });
                }
                return false;
            }

            // Create token config
            const tokenConfig: TokenConfig = {
                name: content.name,
                symbol: content.symbol,
                totalSupply: BigInt(content.totalSupply),
                fid: BigInt(content.fid),
                imageUrl: content.imageUrl,
                socialProof: content.socialProof,
                // Generate a random salt
                salt: `0x${crypto.randomUUID().replace(/-/g, "").padEnd(64, "0")}` as `0x${string}`,
            };

            // Get contract instance
            const tokenLauncherAddress =
                "0xce2EDfdeEa6ceb0278719d261cDf100BFbbcB1bA"; // Polygon Amoy deployment

            while (!tokenLauncherAddress) {
                const missingTokenConfig = await generateObjectDeprecated({
                    runtime,
                    context: composeContext({
                        state,
                        template: missingTokenConfigTemplate,
                    }),
                    modelClass: ModelClass.LARGE,
                });

                callback({
                    text: `Missing token config: ${missingTokenConfig}`,
                });
            }

            const hash = await walletClient.writeContract({
                address: tokenLauncherAddress,
                abi: TokenLauncherABI,
                functionName: "createToken",
                args: [
                    {
                        name: tokenConfig.name,
                        symbol: tokenConfig.symbol,
                        totalSupply: parseEther(
                            tokenConfig.totalSupply.toString()
                        ),
                        fid: tokenConfig.fid,
                        imageUrl: tokenConfig.imageUrl,
                        socialProof: tokenConfig.socialProof,
                        // Pad the salt to 32 bytes
                        salt: `0x${crypto.randomUUID().replace(/-/g, "").padEnd(64, "0")}` as `0x${string}`,
                    },
                ],
                chain: polygonAmoy,
                account: walletClient.account,
            });

            if (callback) {
                callback({
                    text: `Successfully launched token ${content.name} (${content.symbol})\nTransaction Hash: ${hash}`,
                    content: {
                        success: true,
                        hash,
                        name: content.name,
                        symbol: content.symbol,
                        totalSupply: content.totalSupply,
                    },
                });
            }

            return true;
        } catch (error) {
            console.error("Error launching token:", error);
            if (callback) {
                callback({
                    text: `Error launching token: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Launch a new token called 'My Token' with symbol MTK, total supply of 1000000, fid 123, and image https://example.com/image.png",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you launch your token...",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
