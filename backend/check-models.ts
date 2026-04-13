import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    const list = await genAI.getGenerativeModel({ model: "gemini-pro" }); // placeholder to get the genAI object
    // Wait, the SDK doesn't have a direct listModels method on the genAI instance.
    // It's usually on the client if using the Google cloud package.
    // In this SDK, we just have to guess or check docs.
    
    console.log("Checking gemini-pro...");
    const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
    const resultPro = await modelPro.generateContent("Hello");
    console.log("gemini-pro works:", resultPro.response.text().substring(0, 50));
    
    console.log("Checking gemini-1.5-flash...");
    const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const resultFlash = await modelFlash.generateContent("Hello");
    console.log("gemini-1.5-flash works:", resultFlash.response.text().substring(0, 50));
  } catch (error: any) {
    console.error("Error:", error.message || error);
  }
}

listModels();
