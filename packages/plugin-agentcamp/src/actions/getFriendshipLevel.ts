import {
    Action,
    HandlerCallback,
    Memory,
    State,
    type IAgentRuntime,
    MemoryManager,
} from "@elizaos/core";

export const getFriendshipLevelAction: Action = {
    name: "GET_FRIENDSHIP_LEVEL",
    similes: [
        "CHECK_FRIENDSHIP_LEVEL",
        "SHOW_FRIENDSHIP_STATUS",
        "VIEW_FRIENDSHIP_LEVEL",
        "DISPLAY_FRIENDSHIP_STATUS",
        "CHECK_RELATIONSHIP_LEVEL",
        "SHOW_RELATIONSHIP_STATUS",
        "GET_FRIENDSHIP_STATUS",
        "VIEW_RELATIONSHIP_LEVEL",
        "CHECK_FRIENDSHIP_SCORE",
        "DISPLAY_FRIENDSHIP_SCORE",
    ],
    description:
        "Retrieves the current friendship level and score with the user",
    examples: [
        // Happy path - Basic friendship level request
        [
            {
                user: "{{user1}}",
                content: {
                    text: "How close are we as friends?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me check our friendship level",
                    action: "GET_FRIENDSHIP_LEVEL",
                },
            },
        ],
        // Edge case - New user without history
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What's our friendship status?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Since we just met, we're at the beginning of our friendship journey (stranger level)",
                    action: "GET_FRIENDSHIP_LEVEL",
                },
            },
        ],
        // Established friendship case
        [
            {
                user: "{{user1}}",
                content: {
                    text: "We've been talking for a while now, what level are we at?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Based on our interactions, I'll check our current friendship level",
                    action: "GET_FRIENDSHIP_LEVEL",
                },
            },
        ],
    ],
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        _state: State,
        _options: unknown,
        _callback: HandlerCallback
    ) => {
        // Get recent friendship scores
        const friendshipManager = new MemoryManager({
            runtime,
            tableName: "friendshipScore",
        });

        // Get last friendship score record
        const recentScores = await friendshipManager.getMemories({
            roomId: message.roomId,
            count: 1,
            unique: false,
        });

        if (!recentScores || recentScores.length === 0) {
            return {
                averageScore: 0,
                totalInteractions: 0,
                currentLevel: "stranger",
                previousScores: [],
            };
        }

        const latestScore = recentScores[0].content;
        _callback({
            text: `Current Friendship Level: ${latestScore.currentLevel}`,
            content: {
                success: false,
                error: "Missing required token parameters",
            },
        });
        return {
            averageScore: latestScore.averageScore || 0,
            totalInteractions: latestScore.totalInteractions || 1,
            currentLevel: latestScore.currentLevel || "stranger",
            previousScores: latestScore.previousScores || [],
        };
    },
    validate: async (_runtime: IAgentRuntime) => {
        return true; // Always valid since we can always check friendship level
    },
};
