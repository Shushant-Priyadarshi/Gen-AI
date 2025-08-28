import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import input from "prompt-sync";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// 👇 Proper type for Gemini context
type ContextItem = {
  role: "user" | "model";
  parts: { text: string }[];
}

const context: ContextItem[] = [
  
  {
    role: "user",
    parts: [{ text: "You are a helpful assistant." }],
  },
];



// 👇 Chat function to send context and receive response
async function chatCompletions(): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash", 
    contents: context,
  });

  if (
    !response.candidates ||
    response.candidates.length === 0 ||
    !response.candidates[0].content ||
    !response.candidates[0].content.parts ||
    response.candidates[0].content.parts.length === 0 ||
    !response.candidates[0].content.parts[0].text
  ) {
    throw new Error("No valid response from Gemini model.");
  }

  const responseText = response?.candidates[0]?.content?.parts[0]?.text;

  // Save model response to context
  context.push({
    role: "model",
    parts: [{ text: responseText }],
  });

  return responseText;
}

// 👇 Main REPL-style chat loop
async function callGPT() {
  const prompt = input();

  while (true) {
    const userMessage = prompt("You: ");
    if (userMessage.toLowerCase() === "exit") {
      console.log("Exiting chat...");
      break;
    }

    // Save user message to context
    context.push({
      role: "user",
      parts: [{ text: userMessage }] ,
    });

    const aiResponse = await chatCompletions();
    console.log(`AI: ${aiResponse}`);
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    

  }
}

callGPT();





