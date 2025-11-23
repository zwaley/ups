import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API Key not found");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const askGeminiTutor = async (question: string, context: string) => {
    const ai = getClient();
    if (!ai) return "Error: API Key missing.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Role: You are an expert Electrical Engineering Professor specializing in Critical Power Systems and UPS (Uninterruptible Power Supply).
            
            Context: The student is currently studying: ${context}.
            
            Task: Answer the student's question clearly, accurately, and concisely. Use analogies where appropriate. Focus on safety and technical correctness.
            
            Question: ${question}`,
            config: {
                systemInstruction: "Always prioritize safety warnings when discussing high voltage operations.",
                temperature: 0.3
            }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "抱歉，AI 助教暂时无法连接。请检查网络或稍后再试。";
    }
};

export const generateQuiz = async (context: string) => {
  const ai = getClient();
  if (!ai) return null;

  try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a single multiple-choice question about: ${context}. Return strictly JSON format.`,
        config: {
           responseMimeType: "application/json",
           responseSchema: {
             type: "OBJECT",
             properties: {
               question: { type: "STRING" },
               options: { type: "ARRAY", items: { type: "STRING" } },
               correctIndex: { type: "INTEGER" },
               explanation: { type: "STRING" }
             }
           }
        }
      });
      return JSON.parse(response.text);
  } catch (e) {
      console.error(e);
      return null;
  }
}
