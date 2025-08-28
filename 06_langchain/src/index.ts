import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
});

async function main() {
  const respone = await model.invoke("What is the capital of India");
  console.log(respone.content);
  
}

main()
