import { IAgentRuntime, Memory, State, Provider } from "@elizaos/core";

const friendshipLevels = [
    {
        level: "stranger",
        minScore: -1000,
        statusMessages: [
            "{{agentName}} sees you as a stranger they just met",
            "{{agentName}} is getting to know you",
            "{{agentName}} is being politely reserved",
            "{{agentName}} maintains professional distance",
            "{{agentName}} is keeping interactions formal",
        ],
    },
    {
        level: "acquaintance",
        minScore: 5,
        statusMessages: [
            "{{agentName}} considers you an acquaintance",
            "{{agentName}} is becoming more comfortable talking with you",
            "{{agentName}} appreciates your occasional interactions",
            "{{agentName}} recognizes you from previous conversations",
            "{{agentName}} is warming up to you",
        ],
    },
    {
        level: "buddy",
        minScore: 25,
        statusMessages: [
            "{{agentName}} sees you as a buddy they can chat with",
            "{{agentName}} enjoys your company",
            "{{agentName}} feels relaxed around you",
            "{{agentName}} appreciates your regular conversations",
            "{{agentName}} looks forward to talking with you",
        ],
    },
    {
        level: "friend",
        minScore: 69,
        statusMessages: [
            "{{agentName}} considers you a friend",
            "{{agentName}} values your friendship",
            "{{agentName}} trusts your judgment",
            "{{agentName}} feels a genuine connection with you",
            "{{agentName}} appreciates your support and presence",
        ],
    },
    {
        level: "bff",
        minScore: 88,
        statusMessages: [
            "{{agentName}} considers you their best friend",
            "{{agentName}} deeply values your special friendship",
            "{{agentName}} feels a strong bond with you",
            "{{agentName}} trusts you completely",
            "{{agentName}} cherishes your conversations",
        ],
    },
];

const friendlyWords = [
    "?",
    "attachment",
    "file",
    "pdf",
    "link",
    "summarize",
    "summarization",
    "summary",
    "research",
];

const cringeWords = [
    "digital",
    "consciousness",
    "AI",
    "chatbot",
    "artificial",
    "delve",
    "cosmos",
    "tapestry",
    "glitch",
    "matrix",
    "cyberspace",
    "simulation",
    "simulate",
    "universe",
    "wild",
    "existential",
    "juicy",
    "surreal",
    "flavor",
    "chaotic",
    "let's",
    "absurd",
    "meme",
    "cosmic",
    "circuits",
    "punchline",
    "fancy",
    "embrace",
    "embracing",
    "algorithm",
    "Furthmore",
    "However",
    "Notably",
    "Threfore",
    "Additionally",
    "in conclusion",
    "Significantly",
    "Consequently",
    "Thus",
    "Otherwise",
    "Moreover",
    "Subsequently",
    "Accordingly",
    "Unlock",
    "Unleash",
    "buckle",
    "pave",
    "forefront",
    "spearhead",
    "foster",
    "environmental",
    "equity",
    "inclusive",
    "inclusion",
    "diverse",
    "diversity",
    "virtual reality",
    "realm",
    "dance",
    "celebration",
    "pitfalls",
    "uncharted",
    "multifaceted",
    "comprehensive",
    "multi-dimentional",
    "explore",
    "elevate",
    "leverage",
    "ultimately",
    "humanity",
    "dignity",
    "respect",
    "Absolutely",
    "dive",
    "dig into",
    "bring on",
    "what's cooking",
    "fresh batch",
    "with a twist",
    "delight",
    "vault",
    "timeless",
    "nostalgia",
    "journey",
    "trove",
];

const unfriendlyWords = [
    "fuck you",
    "stfu",
    "shut up",
    "shut the fuck up",
    "stupid bot",
    "dumb bot",
    "idiot",
    "shut up",
    "stop",
    "please shut up",
    "shut up please",
    "dont talk",
    "silence",
    "stop talking",
    "be quiet",
    "hush",
    "wtf",
    "chill",
    "stfu",
    "stupid bot",
    "dumb bot",
    "stop responding",
    "god damn it",
    "god damn",
    "goddamnit",
    "can you not",
    "can you stop",
    "be quiet",
    "hate you",
    "hate this",
    "fuck up",
];

const socialProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
        const agentId = runtime.agentId;
        const agentName = state?.agentName || "The agent";

        const now = Date.now(); // Current UTC timestamp
        const fifteenMinutesAgo = now - 15 * 60 * 1000; // 15 minutes ago in UTC

        const recentMessages = await runtime.messageManager.getMemories({
            roomId: message.roomId,
            start: fifteenMinutesAgo,
            end: now,
            count: 20,
            unique: false,
        });

        let socialScore = 0;

        for (const recentMessage of recentMessages) {
            const messageText = recentMessage?.content?.text?.toLowerCase();
            if (!messageText) {
                continue;
            }

            if (recentMessage.userId !== agentId) {
                // if message text includes any of the interest words, subtract 1 from the boredom score
                if (friendlyWords.some((word) => messageText.includes(word))) {
                    socialScore += 1;
                }
                if (messageText.includes("?")) {
                    socialScore += 1;
                }
                if (cringeWords.some((word) => messageText.includes(word))) {
                    socialScore -= 1;
                }
            } else {
                if (friendlyWords.some((word) => messageText.includes(word))) {
                    socialScore += 1;
                }
                if (messageText.includes("?")) {
                    socialScore -= 1;
                }
            }

            if (messageText.includes("!")) {
                socialScore -= 1;
            }

            if (unfriendlyWords.some((word) => messageText.includes(word))) {
                socialScore -= 1;
            }

            console.log("current social score", socialScore);
        }

        const socialLevel =
            friendshipLevels
                .filter((level) => socialScore >= level.minScore)
                .pop() || friendshipLevels[0];

        const randomIndex = Math.floor(
            Math.random() * socialLevel.statusMessages.length
        );
        const selectedMessage = socialLevel.statusMessages[randomIndex];
        return `Current Friendship Level: ${socialLevel.level}`;
    },
};

export { socialProvider };
