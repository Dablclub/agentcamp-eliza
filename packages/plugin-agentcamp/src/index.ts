import { Plugin } from "@elizaos/core";
import { launchTokenAction, testAction } from "./actions/index.ts";
export * as actions from "./actions/index.ts";
export * as evaluators from "./evaluators/index.ts";
export * as providers from "./providers/index.ts";

import { walletProvider } from "./providers/wallet";
import { addressAction } from "./actions/addressAction.ts";
import { socialProvider } from "./providers/socialProvider.ts";
import { friendshipEvaluator } from "./evaluators/friendship.ts";
export const agentcampPlugin: Plugin = {
    name: "agentcamp",
    description: "Agentcamp plugin",
    actions: [addressAction, launchTokenAction, testAction],
    evaluators: [friendshipEvaluator],
    providers: [socialProvider, walletProvider],
};

export default agentcampPlugin;
