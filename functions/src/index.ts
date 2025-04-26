// Import the Genkit core libraries and plugins.
// z = Zod, une librarie TypeScript-first de validation de schema
import { genkit, z } from "genkit";

import { googleAI, gemini20Flash } from "@genkit-ai/googleai";
import { gpt4o, openAI } from "genkitx-openai";

// Cloud Functions for Firebase supports Genkit natively. The onCallGenkit function creates a callable
// function from a Genkit action. 
import { onCallGenkit } from "firebase-functions/https";


import { defineSecret } from "firebase-functions/params";
const googleAIapiKey = defineSecret("GOOGLE_GENAI_API_KEY");
const openAIapiKey = defineSecret("OPENAI_API_KEY");


// On déclare une instance Genkit
const ai = genkit({
  plugins: [googleAI(), openAI()],
});

// DEMO 1

// Define a simple flow that prompts an LLM to generate a Welcome message
const welcomeFlow = ai.defineFlow(
  {
    name: "welcomeMessageFlow",
    outputSchema: z.string(),  
  },
  async () => {
    const llmResponse = await ai.generate({
      model: gemini20Flash,
      prompt: `Nous sommes un groupe d'informaticiens qui assiste à la conférence "Build With AI - Afrique Francophone". 
      Souhaite nous la bienvenue sur un ton sympathique`,
    });
    return llmResponse.text;
  }
);

export const welcomeMessage = onCallGenkit(
  {
    secrets: [googleAIapiKey, openAIapiKey],
  },
  welcomeFlow
);


// DEMO 2

export const threeMenusSuggestion = onCallGenkit(
  {
    secrets: [googleAIapiKey, openAIapiKey],
  },
  ai.defineFlow(
    {
      name: "threeMenusSuggestionFlow",
      inputSchema: z.object({
        ingredients: z.array(z.string()),
      }),
      outputSchema: z.object({
        chefPresentation: z.string(),
        recipes: z.array(
          z.object({
            title: z.string(),
            ingredients: z.string(),
            instructions: z.string(),
          })
        ),
      }),
    },
    async (query) => {
      const llmResponse = await ai.generate({
        model: gemini20Flash,
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
    }
  )
);


// DEMO 3

export const menuSuggestionFromImage = onCallGenkit(
  {
    secrets: [googleAIapiKey, openAIapiKey],
  },
  ai.defineFlow(
    {
      name: "menuSuggestionFromImageFlow",
      inputSchema: z.string(),
      outputSchema: z.string(),
    },
    async (imgURL) => {
      const llmResponse = await ai.generate({
        model: gpt4o,
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
    }
  )
);
