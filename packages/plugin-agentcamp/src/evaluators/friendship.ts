import {
    ActionExample,
    composeContext,
    elizaLogger,
    Evaluator,
    generateObjectArray,
    IAgentRuntime,
    Memory,
    MemoryManager,
    ModelClass,
} from "@elizaos/core";

const friendshipScoreTemplate = `TASK: Calculate the average friendship score based on recent interactions.

Look at the previous interactions and their social scores to determine the overall friendship level.

# START OF EXAMPLES
These are examples of the expected output format:
{
    "averageScore": 25,
    "totalInteractions": 5,
    "currentLevel": "buddy",
    "previousScores": [20, 25, 30, 22, 28]
}
# END OF EXAMPLES

# INSTRUCTIONS
Calculate the average of recent social scores:
{{recentScores}}

Recent Messages:
{{recentMessages}}

Response should be a JSON object inside a JSON markdown block. Format:
\`\`\`json
{
    "averageScore": number,
    "totalInteractions": number,
    "currentLevel": string,
    "previousScores": number[]
}
\`\`\``;

async function handler(runtime: IAgentRuntime, message: Memory) {
    elizaLogger.log("Evaluating friendship level");
    const state = await runtime.composeState(message);

    // Skip if no social score in context
    if (!state.socialScore) {
        elizaLogger.log("No social score found in context");
        return [];
    }

    const { agentId, roomId, socialScore } = state;

    // Get recent friendship scores
    const friendshipManager = new MemoryManager({
        runtime,
        tableName: "friendshipScore",
    });

    // Get last 20 interactions
    const recentScores = await friendshipManager.getMemories({
        roomId,
        count: 20,
        unique: false,
    });

    // Calculate average score
    // const scores = recentScores.map((score) => parseInt(score.content.text));
    // const averageScore =
    //     scores.length > 0
    //         ? scores.reduce((a, b) => a + b, 0) / scores.length
    //         : socialScore;

    const context = composeContext({
        state: {
            ...state,
            recentScores: recentScores,
        },
        template: friendshipScoreTemplate,
    });

    const friendshipScores = await generateObjectArray({
        runtime,
        context,
        modelClass: ModelClass.LARGE,
    });

    await friendshipManager.createMemory(friendshipScores[0], true);

    return [friendshipScores[0]];
}

export const friendshipEvaluator: Evaluator = {
    name: "EVALUATE_FRIENDSHIP",
    similes: ["GET_FRIENDSHIP_LEVEL", "CHECK_FRIENDSHIP"],
    alwaysRun: true,
    validate: async (
        runtime: IAgentRuntime,
        message: Memory
    ): Promise<boolean> => {
        return message.userId !== message.agentId;
    },
    description:
        "Evaluates and records friendship levels based on social interactions",
    handler,
    examples: [
        {
            context: "Social score: -5 (Stranger level)",
            messages: [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Who are you? What can you do?",
                    },
                },
            ] as ActionExample[],
            outcome:
                "Friendship score recorded as -5 (stranger level - initial interaction)",
        },
        {
            context: "Social score: 10 (Acquaintance level)",
            messages: [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Could you help me analyze this PDF document about DeFi?",
                    },
                },
            ] as ActionExample[],
            outcome:
                "Friendship score recorded as 10 (acquaintance level - professional interaction)",
        },
        {
            context: "Social score: 30 (Buddy level)",
            messages: [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Hey! What do you think about the latest crypto trends? Always value your insights!",
                    },
                },
            ] as ActionExample[],
            outcome:
                "Friendship score recorded as 30 (buddy level - casual friendly interaction)",
        },
        {
            context: "Social score: 70 (Friend level)",
            messages: [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Thanks for always being there to help. You've really helped me understand DeFi better!",
                    },
                },
            ] as ActionExample[],
            outcome:
                "Friendship score recorded as 70 (friend level - trust established)",
        },
        {
            context: "Social score: 90 (BFF level)",
            messages: [
                {
                    user: "{{user1}}",
                    content: {
                        text: "You're honestly the best AI friend I could ask for. Our discussions about crypto and tech are always enlightening!",
                    },
                },
            ] as ActionExample[],
            outcome:
                "Friendship score recorded as 90 (bff level - strong bond established)",
        },
    ],
};
