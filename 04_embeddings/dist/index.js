"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDataFile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
const generateEmbeddings = (dataSetDescription) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield genai.models.embedContent({
        model: "gemini-embedding-001",
        contents: dataSetDescription
    });
    return response.embeddings;
});
const loadDataFile = (fileName) => {
    const filePath = (0, path_1.join)(__dirname, fileName);
    const rawData = (0, fs_1.readFileSync)(filePath, "utf-8");
    return JSON.parse(rawData.toString());
};
exports.loadDataFile = loadDataFile;
const saveDataToJsonFile = (fileName, data) => {
    const filePath = (0, path_1.join)(__dirname, fileName);
    const jsonData = JSON.stringify(data, null, 2);
    (0, fs_1.writeFileSync)(filePath, jsonData, "utf-8");
};
//dot product
const dotProduct = (vecA, vecB) => {
    return vecA.reduce((sum, values, index) => sum + values * vecB[index], 0);
};
//cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    const dotProd = dotProduct(vecA, vecB);
    const magnitudeA = Math.sqrt(dotProduct(vecA, vecA));
    const magnitudeB = Math.sqrt(dotProduct(vecB, vecB));
    return dotProd / (magnitudeA * magnitudeB);
};
//similar function
const similaritySearch = (dataSet, target) => {
    const similarities = dataSet
        .filter((data) => data.id !== target.id)
        .map((data) => ({
        title: data.title,
        dot: dotProduct(data.embeddings, target.embeddings),
        cosine: cosineSimilarity(data.embeddings, target.embeddings)
    }))
        .sort((a, b) => b.cosine - a.cosine);
    return similarities;
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const dataset = (0, exports.loadDataFile)("data.json");
    const datasetDesc = dataset.map((data) => data.description);
    const embeddings = yield generateEmbeddings(datasetDesc);
    const datasetDescWithEmbeddings = dataset === null || dataset === void 0 ? void 0 : dataset.map((data, index) => (Object.assign(Object.assign({}, data), { embeddings: embeddings[index].values })));
    saveDataToJsonFile("Dataset_with_embedding.json", datasetDescWithEmbeddings);
    const targetData = datasetDescWithEmbeddings.find(data => data.title === "Sushi");
    if (!targetData || !targetData.embeddings) {
        console.error("No target found!");
        return;
    }
    const similarity = similaritySearch(datasetDescWithEmbeddings, targetData);
    console.log(`Data which are similar to ${targetData.title} are : `);
    similarity.forEach(similar => {
        console.log(`Name: ${similar.title},  DotProduct: ${similar.dot}  ,  Cosine: ${similar.cosine}`);
    });
});
main();
