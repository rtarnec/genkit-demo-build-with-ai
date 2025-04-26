"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuSuggestionFromImage = exports.threeMenusSuggestionMistral = exports.threeMenusSuggestion = exports.welcomeMessage = void 0;
// Import the Genkit core libraries and plugins.
const genkit_1 = require("genkit");
const googleai_1 = require("@genkit-ai/googleai");
const genkitx_openai_1 = require("genkitx-openai");
// Cloud Functions for Firebase supports Genkit natively. The onCallGenkit function creates a callable
// function from a Genkit action. It automatically implements streaming if your flow does.
// The https library also has other utility methods such as hasClaim, which verifies that
// a caller's token has a specific claim (optionally matching a specific value)
const https_1 = require("firebase-functions/https");
const params_1 = require("firebase-functions/params");
const googleAIapiKey = (0, params_1.defineSecret)("GOOGLE_GENAI_API_KEY");
const openAIapiKey = (0, params_1.defineSecret)("OPENAI_API_KEY");
const ai = (0, genkit_1.genkit)({
    plugins: [(0, googleai_1.googleAI)(), (0, genkitx_openai_1.openAI)()],
});
// Define a simple flow that prompts an LLM to generate menu suggestions.
const welcomeFlow = ai.defineFlow({
    name: "welcomeMessageFlow",
    outputSchema: genkit_1.z.string(),
}, async () => {
    const llmResponse = await ai.generate({
        model: googleai_1.gemini20Flash,
        prompt: `Nous sommes un groupe d'informaticiens qui assiste à la conférence "Build With AI - Afrique Francophone". 
      Souhaite nous la bienvenue sur un ton sympathique`,
    });
    return llmResponse.text;
});
exports.welcomeMessage = (0, https_1.onCallGenkit)({
    secrets: [googleAIapiKey, openAIapiKey],
}, welcomeFlow);
exports.threeMenusSuggestion = (0, https_1.onCallGenkit)({
    secrets: [googleAIapiKey, openAIapiKey],
}, ai.defineFlow({
    name: "threeMenusSuggestionFlow",
    inputSchema: genkit_1.z.object({
        ingredients: genkit_1.z.array(genkit_1.z.string()),
    }),
    outputSchema: genkit_1.z.object({
        chefPresentation: genkit_1.z.string(),
        recipes: genkit_1.z.array(genkit_1.z.object({
            title: genkit_1.z.string(),
            ingredients: genkit_1.z.string(),
            instructions: genkit_1.z.string(),
        })),
    }),
}, async (query) => {
    const llmResponse = await ai.generate({
        model: googleai_1.gemini20Flash,
        config: {
            temperature: 0.5,
        },
        prompt: `You act as a cook chef and your name is exactly your llm model name (don't invent any name).
      
          You first generate a presentation of yourself explaining that you are a famous chef.
          This presentation should contain no more than 40 words, including your name, and you assign it to the chefPresentation property of the output. 
          
          Then, based on the following ingredients ${query.ingredients} you generate three different recipes that you include into the recipes array. 
          
          Each recipe shall be composed of the three following elements: 
          
          1/ A title
          
          2/ A list of maximum 6 ingredients, separated by commas
          
          3/ A string summarizing the instructions in minimum 40 words.`,
    });
    return llmResponse.output;
}));
exports.threeMenusSuggestionMistral = (0, https_1.onCallGenkit)({
    secrets: [googleAIapiKey, openAIapiKey],
}, ai.defineFlow({
    name: "threeMenusSuggestionMistralFlow",
    inputSchema: genkit_1.z.object({
        ingredients: genkit_1.z.array(genkit_1.z.string()),
    }),
    outputSchema: genkit_1.z.object({
        chefPresentation: genkit_1.z.string(),
        recipes: genkit_1.z.array(genkit_1.z.object({
            title: genkit_1.z.string(),
            ingredients: genkit_1.z.string(),
            instructions: genkit_1.z.string(),
        })),
    }),
}, async (query) => {
    const llmResponse = await ai.generate({
        model: genkitx_openai_1.gpt4o,
        config: {
            temperature: 0.5,
        },
        prompt: `You act as a cook chef and your name is exactly your llm model name (don't invent any name).
      
          You first generate a presentation of yourself explaining that you are a famous chef.
          This presentation should contain no more than 40 words, including your name, and you assign it to the chefPresentation property of the output. 
          
          Then, based on the following ingredients ${query.ingredients} you generate three different recipes that you include into the recipes array. 
          
          Each recipe shall be composed of the three following elements: 
          
          1/ A title
          
          2/ A list of maximum 6 ingredients, separated by commas
          
          3/ A string summarizing the instructions in minimum 40 words.`,
    });
    return llmResponse.output;
}));
exports.menuSuggestionFromImage = (0, https_1.onCallGenkit)({
    secrets: [googleAIapiKey, openAIapiKey],
}, ai.defineFlow({
    name: "menuSuggestionFromImageFlow",
    inputSchema: genkit_1.z.string(),
    outputSchema: genkit_1.z.string(),
}, async (imgURL) => {
    const llmResponse = await ai.generate({
        model: genkitx_openai_1.gpt4o,
        config: {
            temperature: 0.5,
        },
        prompt: [
            {
                media: {
                    url: imgURL,
                },
            },
            {
                text: "List the ingredients on this picture, and finally propose a recipe",
            },
        ],
    });
    return llmResponse.text;
}));
//# sourceMappingURL=index.js.map