import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key 缺失。请配置 process.env.API_KEY。");
  }
  return new GoogleGenAI({ apiKey });
};

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatResponse {
  text: string;
  sources: GroundingSource[];
}

/**
 * Chat with Gemini Pro for general advice and spiritual guidance.
 * Model: gemini-3-pro-preview
 */
export const sendChatMessage = async (
  message: string,
  history: { role: 'user' | 'model'; content: string }[]
): Promise<ChatResponse> => {
  try {
    const ai = getAIClient();
    
    // We construct a chat session manually or use generateContent with history.
    // For simplicity and to allow system instructions on each turn if needed, we'll use generateContent with a constructed prompt or chat.
    // Here we use chat for context retention.
    
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `你是“儒释道福报量化评分系统”的智慧助手。
        你的角色是基于儒家、佛家和道家的原则引导用户。
        请保持礼貌、深刻且务实。必须使用中文回答。
        在分析用户问题时，请参考“六度”（佛家）、“修齐治平”（儒家）或“道法自然”（道家）。
        `,
      },
      history: history.map(h => ({ role: h.role, parts: [{ text: h.content }] }))
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: message
    });

    return {
      text: result.text || "抱歉，我暂时无法回答。",
      sources: []
    };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

/**
 * Search with Gemini Flash for up-to-date information or fact-checking.
 * Model: gemini-3-flash-preview
 */
export const searchWithGemini = async (query: string): Promise<ChatResponse> => {
  try {
    const ai = getAIClient();
    const result: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources: GroundingSource[] = [];
    const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      text: result.text || "未找到相关结果。",
      sources: sources
    };

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};