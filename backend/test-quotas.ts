import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testModel(modelName: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  console.log(`Checking ${modelName}...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello");
    console.log(`✅ ${modelName} works:`, result.response.text().substring(0, 50));
    return true;
  } catch (error: any) {
    console.error(`❌ ${modelName} failed:`, error.message || error);
    return false;
  }
}

async function run() {
  const models = ["gemini-flash-latest", "gemini-pro-latest", "gemini-1.0-pro"];
  for (const m of models) {
    if (await testModel(m)) break;
  }
}

run();
