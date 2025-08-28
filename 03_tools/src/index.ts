import {OpenAI} from "openai";
import dotenv from "dotenv"

dotenv.config();

const openai = new OpenAI();



async function callOpenAI() {
    const context:OpenAI.ChatCompletionMessageParam[] = [
    {
    role:"system",
    content:"You are a helpfull assistant"
    },
    {
        role:"user",
        content:"Hey bro"
    }
]   
    const response = await openai.chat.completions.create({
        model:"gpt-3.5-turbo",
        messages:context
    })

    console.log(response); 
    console.log(response?.choices[0]?.message?.content);
    
}

callOpenAI()
