import {ChromaClient} from "chromadb"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"
import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini";

dotenv.config()

//Initializing chroma client
const chromaClient = new ChromaClient({
    host:"localhost",
    port:8000,
})

//Initializing gemini embedding 
const embedder = new GoogleGeminiEmbeddingFunction({
  apiKey: process.env.GEMINI_API_KEY,
});


//function for get current chroma
async function init() {
    const collection = await chromaClient.getOrCreateCollection({
    name: "learnin_chroma",
    embeddingFunction: embedder,
    });
    return collection
}

//add message function
async function addMessage(id:string,text:string) {
    const collection = await init()
    await collection.add({
        ids:[id],
        documents:[text],
    })
    console.log(`Added Text: ${text}`);
    
}

//fuction to get similar text
async function getSimilarMessages(text:string,limit: number = 5) {
    const collection = await init()
    const result = await collection.query({
        queryTexts:[text],
        nResults:limit,
    })
    console.log(`Similar messages: ${result.documents[0]}`);
    return result.documents[0][0]
}


const main = async() =>{
    await addMessage("1","Hello how can i help you today!")
    await addMessage("2","Sure, I can book your appointment.")
    await addMessage("3","The weather is sunny and warm.")

    await getSimilarMessages("Can you book my movie tickets?")
}

main()


