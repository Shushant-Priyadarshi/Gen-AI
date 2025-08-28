import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv"

dotenv.config()

type Dataset =  {
    id:number
    title:string
    description:string
    tags:string[]
    embeddings?:number[]
}

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateEmbeddings = async (dataSetDescription: string[]) => {
  const response = await genai.models.embedContent({
    model: "gemini-embedding-001",
    contents: dataSetDescription
  });
 return response.embeddings;
};

export const loadDataFile = (fileName: string): unknown => {
  const filePath = join(__dirname, fileName);
  const rawData = readFileSync(filePath, "utf-8");
  return JSON.parse(rawData.toString());
};

const saveDataToJsonFile = (fileName:string, data:any) =>{
    const filePath = join(__dirname, fileName)
    const jsonData = JSON.stringify(data,null,2)
    writeFileSync(filePath,jsonData,"utf-8")
}

//dot product
const dotProduct = (vecA:number[], vecB:number[]) => {
    return vecA.reduce((sum,values,index) => sum + values * vecB[index], 0)
}

//cosine similarity

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  const dotProd = dotProduct(vecA, vecB);
  const magnitudeA = Math.sqrt(dotProduct(vecA, vecA));
  const magnitudeB = Math.sqrt(dotProduct(vecB, vecB));
  return dotProd / (magnitudeA * magnitudeB);
};



//similar function
const similaritySearch = (dataSet:Dataset[], target:Dataset) =>{
    const similarities = dataSet
    .filter((data) => data.id !== target.id)
    .map((data) => ({
        title:data.title,
        dot:dotProduct(data.embeddings!, target.embeddings!),
        cosine:cosineSimilarity(data.embeddings!, target.embeddings!)
    }))
    .sort((a,b) => b.cosine - a.cosine)
    return similarities
}

const main = async () => {
  const dataset = loadDataFile("data.json") as Dataset[];
  const datasetDesc  = dataset.map((data) => data.description)
  const embeddings = await generateEmbeddings(datasetDesc)

  const datasetDescWithEmbeddings = dataset?.map((data,index) => ({
    ...data,
    embeddings:embeddings![index].values
  }))

  saveDataToJsonFile("Dataset_with_embedding.json", datasetDescWithEmbeddings)

  const targetData = datasetDescWithEmbeddings.find(data => data.title === "Sushi")
  if(!targetData || !targetData.embeddings){
    console.error("No target found!")
    return
  }
  
  const similarity = similaritySearch(datasetDescWithEmbeddings,targetData)
  console.log( `Data which are similar to ${targetData.title} are : `)
  similarity.forEach(similar => {
    console.log(`Name: ${similar.title},  DotProduct: ${similar.dot}  ,  Cosine: ${similar.cosine}`);
    
  })

};

main()



