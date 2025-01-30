import {
    ActionExample,
    booleanFooter,
    composeContext,
    elizaLogger,
    Evaluator,
    generateObjectDeprecated,
    generateTrueOrFalse,
    IAgentRuntime,
    Memory,
    MemoryManager,
    ModelClass,
} from "@elizaos/core";

// Define friendship levels based on score ranges
const friendshipLevels = [
    {
        minScore: -10000,
        level: "nemesis",
        description: "{{agentName}} considers this person an arch-enemy",
    },
    {
        minScore: -5,
        level: "disliked",
        description: "{{agentName}} has a strong dislike for this person",
    },
    {
        minScore: -2,
        level: "wary",
        description: "{{agentName}} is cautious around this person",
    },
    {
        minScore: 0,
        level: "neutral",
        description: "{{agentName}} has no strong feelings either way",
    },
    {
        minScore: 3,
        level: "friendly",
        description: "{{agentName}} considers this person a casual friend",
    },
    {
        minScore: 6,
        level: "close",
        description: "{{agentName}} sees this person as a good friend",
    },
    {
        minScore: 10,
        level: "bestie",
        description: "{{agentName}} considers this person a best friend",
    },
];

// Extract topics from character config to use as interest/cringe words
function extractTopicsFromCharacter(runtime: IAgentRuntime) {
    const character = runtime.character;
    const interestTopics = new Set([
        ...(character.topics || []),
        ...(character.knowledge || []),
    ]);

    const cringeTopics = new Set([
        // Add topics that would annoy the character based on their style
        ...(character.style?.all?.filter(
            (style) =>
                style.includes("avoid") ||
                style.includes("dislike") ||
                style.includes("never")
        ) || []),
    ]);

    return {
        interestTopics: Array.from(interestTopics),
        cringeTopics: Array.from(cringeTopics),
    };
}

const friendshipTemplate = `# Task: Analyze the recent interaction to determine friendship level changes.

Based on the following conversation, determine if the friendship level between the agent and other participants has changed.

Agent's Interest Topics:
{{interestTopics}}

Agent's Disliked Topics:
{{cringeTopics}}

Consider:
- Positive points when users discuss the agent's interest topics
- Negative points when users bring up disliked topics
- General interaction quality and emotional content

Recent Messages:
{{recentMessages}}

Current Friendship Levels:
{{currentFriendships}}

Response should be a JSON object array inside a JSON markdown block. Format:
\`\`\`json
[
  {
    "userId": string,
    "scoreChange": number,
    "reason": string
  },
  ...
]
\`\`\``;

const shouldProcessTemplate =
    `# Task: Decide if the recent messages should be processed for friendship evaluation.

Look for messages that:
- Mention topics the agent likes or dislikes
- Show strong emotional content
- Indicate meaningful interaction

Based on the following conversation, should the messages be processed for friendship evaluation? YES or NO

Recent Messages:
{{recentMessages}}

Should the messages be processed for friendship evaluation? ` + booleanFooter;

async function handler(runtime: IAgentRuntime, message: Memory) {
    elizaLogger.log("Evaluating friendships");

    const { interestTopics, cringeTopics } =
        extractTopicsFromCharacter(runtime);

    // Get recent messages from the last 15 minutes
    const now = Date.now();

    const state = await runtime.composeState(message);

    // Check if we should process the messages
    const shouldProcessContext = composeContext({
        state,
        template: shouldProcessTemplate,
    });

    const shouldProcess = await generateTrueOrFalse({
        context: shouldProcessContext,
        modelClass: ModelClass.SMALL,
        runtime,
    });

    if (!shouldProcess) {
        elizaLogger.log("Skipping friendship evaluation");
        return [];
    }

    // Get current friendship scores
    const friendshipManager = new MemoryManager({
        runtime,
        tableName: "friendships",
    });

    const currentFriendships = await friendshipManager.getMemories({
        roomId: message.roomId,
        count: 100,
    });

    // Generate friendship changes using the template
    const context = composeContext({
        state: {
            ...state,
            interestTopics: interestTopics.join(", "),
            cringeTopics: cringeTopics.join(", "),
        },
        template: friendshipTemplate,
    });

    const friendshipChanges = await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    });

    if (!friendshipChanges?.length) return [];

    // Store updated friendship scores
    for (const change of friendshipChanges) {
        const existingFriendship = currentFriendships.find(
            (f) =>
                (f.content as unknown as { userId: string }).userId ===
                change.userId
        );

        const currentScore =
            (existingFriendship?.content as unknown as { score: number })
                ?.score || 0;
        const newScore = currentScore + change.scoreChange;

        await friendshipManager.createMemory(
            {
                userId: change.userId,
                agentId: runtime.agentId,
                roomId: message.roomId,
                content: {
                    text: `${runtime.character.name} has a new friendship score of ${newScore} with ${change.userId}`,
                    userId: change.userId,
                    score: newScore,
                    timestamp: now,
                },
            },
            true
        );
    }

    // Return processed changes with friendship level descriptions
    return friendshipChanges.map((change) => {
        const level =
            friendshipLevels.find((l) => l.minScore <= change.scoreChange) ||
            friendshipLevels[0];
        return {
            ...change,
            reason: level.description.replace(
                "{{agentName}}",
                runtime.character.name
            ),
        };
    });
}

export const friendshipEvaluator: Evaluator = {
    name: "EVALUATE_FRIENDSHIPS",
    similes: ["CHECK_FRIENDSHIP", "ANALYZE_RELATIONSHIPS"],
    alwaysRun: true,
    validate: async (
        runtime: IAgentRuntime,
        message: Memory
    ): Promise<boolean> => {
        if (message.content.text.length < 5) return false;
        return message.userId !== message.agentId;
    },
    description:
        "Evaluate and track friendship levels between the agent and other participants based on interactions and shared interests.",
    handler,
    examples: [
        {
            context: "Conversation about shared interests",
            messages: [
                {
                    user: "{{user1}}",
                    content: {
                        text: "I love how you approach personal development with such unique metaphors!",
                    },
                },
            ] as ActionExample[],
            outcome: `\`\`\`json
[
  {
    "userId": "{{user1}}",
    "scoreChange": 2,
    "reason": "Coach Pool considers this person a casual friend"
  }
]
\`\`\``,
        },
        {
            context: "Negative interaction",
            messages: [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Your coaching style is too chaotic and unprofessional.",
                    },
                },
            ] as ActionExample[],
            outcome: `\`\`\`json
[
  {
    "userId": "{{user1}}",
    "scoreChange": -1,
    "reason": "Coach Pool is cautious around this person"
  }
]
\`\`\``,
        },
    ],
};
