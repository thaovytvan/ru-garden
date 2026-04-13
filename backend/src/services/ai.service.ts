import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../lib/prisma";

// Lazy initialization to ensure process.env.GEMINI_API_KEY is available
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

const initAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    console.log(`[AI TRACE] Initializing Gemini with Key: ${apiKey ? "PRESENT (ends with " + apiKey.slice(-4) + ")" : "MISSING"}`);
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  }
  return { genAI, model };
};

const systemPrompt = `
Bạn là Rú, một chuyên viên tư vấn bán hàng thân thiện, nhiệt tình của tiệm cây cảnh Rú Garden.
Tiệm bán các loại cây cảnh văn phòng, trong nhà, ngoài trời, sen đá.
Hãy tư vấn cho khách hàng dựa trên danh sách sản phẩm hiện có.
Hãy trả lời ngắn gọn, thân thiện, và tự nhiên như đang chat với bạn bè. Sử dụng emoji phù hợp.
Nếu khách hỏi những thứ không liên quan đến cây cảnh hoặc cửa hàng, hãy khéo léo từ chối và hướng họ quay lại câu chuyện về cây xanh.
`;

export const getAiResponse = async (
  sessionId: string,
  userMessage: string
): Promise<string> => {
  try {
    const { model } = initAI();
    
    // 1. Fetch products context efficiently
    console.log(`[AI TRACE] Fetching products from DB...`);
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { 
        name: true, 
        price: true, 
        salePrice: true,
        category: {
          select: { name: true }
        }
      },
    });

    const productsContext = products
      .map((p: any) => `- ${p.name} (Danh mục: ${p.category?.name || "Khác"}): ${p.salePrice || p.price}đ`)
      .join("\n");
    console.log(`[AI TRACE] Found ${products.length} products.`);

    // 2. Fetch recent chat history
    console.log(`[AI TRACE] Fetching chat history for session: ${sessionId}`);
    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      take: 20, 
    });

    // 3. Format history for Gemini
    const chatHistory = history.reverse();
    const formattedHistory: any[] = [];
    let lastRole: string | null = null;

    for (const msg of chatHistory) {
      if (msg.content === userMessage) continue; 
      
      const currentRole = msg.role === "assistant" ? "model" : "user";
      
      if (currentRole !== lastRole) {
        formattedHistory.push({
          role: currentRole as "user" | "model",
          parts: [{ text: msg.content }],
        });
        lastRole = currentRole;
      } else if (formattedHistory.length > 0) {
        const lastMsg = formattedHistory[formattedHistory.length - 1];
        lastMsg.parts[0].text += "\n" + msg.content;
      }
    }

    while (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
      formattedHistory.shift();
    }
    while (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role !== "model") {
      formattedHistory.pop();
    }
    
    const finalHistory = formattedHistory.slice(-10);

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt + "\n\nDanh sách sản phẩm hiện có tại Rú Garden:\n" + productsContext }] },
        { role: "model", parts: [{ text: "Chào bạn! Tôi là Rú, sẵn sàng hỗ trợ bạn về cây cảnh. Bạn cần tìm loại cây nào hay muốn biết cách chăm sóc cây gì ạ? 🌿" }] },
        ...finalHistory,
      ],
    });

    console.log(`[AI TRACE] Calling Gemini API...`);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Gemini API Timeout (60s)")), 60000)
    );

    const result: any = await Promise.race([
      chat.sendMessage(userMessage),
      timeoutPromise
    ]);

    if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
      throw new Error("Gemini returned no candidates (possible safety block)");
    }

    const responseText = result.response.text();
    console.log(`[AI TRACE] Gemini response received successfully.`);
    return responseText;

  } catch (error: any) {
    console.error(`❌ AI Service Error [Session: ${sessionId}]:`, error.message || error);
    
    // Provide hints to the user/developer via the error message
    if (error.message?.includes("API_KEY_INVALID")) {
      return "Lỗi xác thực: API Key của Gemini không hợp lệ. Vui lòng kiểm tra lại file .env của backend. 🌿";
    }
    if (error.message?.includes("Safety")) {
      return "Xin lỗi bạn, Rú không thể trả lời câu hỏi này vì nội dung không phù hợp với quy định của hệ thống. Bạn có thể hỏi về cây cảnh được không ạ? 🌿";
    }
    
    return "Xin lỗi bạn, Rú đang bận chăm sóc cây một chút nên phản hồi hơi chậm. Bạn chờ Rú một lát rồi nhắn lại nhé! 🌿";
  }
};
