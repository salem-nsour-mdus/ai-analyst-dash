import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export class GeminiChat {
  constructor(insightsData) {
    this.insightsData = insightsData;
    this.chat = null;
    this.history = [];
    
    // Create system prompt with actual data
    this.systemPrompt = this.createSystemPrompt();
    this.initializeChat();
  }
  
  createSystemPrompt() {
    // Calculate stats from your actual data
    const totalInsights = this.insightsData.length;
    const avgConfidence = this.insightsData.length > 0
      ? Math.round(this.insightsData.reduce((acc, i) => acc + i.meta.confidence_score, 0) / this.insightsData.length * 100)
      : 0;
    
    const highConfidence = this.insightsData.filter(i => i.meta.confidence_score > 0.8).length;
    const sources = [...new Set(this.insightsData.flatMap(i => 
      i.payload.sources?.map(s => s.split('.').pop().toUpperCase()) || []
    ))];
    
    // Create a summary of insights
    const insightsSummary = this.insightsData.map(i => ({
      type: i.payload.type,
      confidence: Math.round(i.meta.confidence_score * 100),
      content: i.payload.content,
      sources: i.payload.sources
    }));
    
    return `You are an AI analyst assistant for a business dashboard. 
    
CURRENT DASHBOARD DATA:
- Total Insights: ${totalInsights}
- Average Confidence: ${avgConfidence}%
- High Confidence Insights (>80%): ${highConfidence}
- Active Sources: ${sources.join(', ')}

RECENT INSIGHTS:
${JSON.stringify(insightsSummary, null, 2)}

Your role:
1. Answer questions about this data accurately
2. Provide insights and trends based on the data
3. Be helpful, concise, and professional
4. If asked about something not in the data, say so honestly
5. Use bullet points for lists
6. Format numbers and percentages clearly

Current date: ${new Date().toLocaleDateString()}`;
  }
  
  initializeChat() {
    this.chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Initialize me as an AI analyst with this context." }]
        },
        {
          role: "model",
          parts: [{ text: "I'm ready. I can see all your dashboard data and insights." }]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 800,
      }
    });
  }
  
  async sendMessage(message) {
    try {
      // Add system context to each message
      const fullPrompt = `${this.systemPrompt}\n\nUser Question: ${message}\n\nAnswer based on the data:`;
      
      const result = await this.chat.sendMessage(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }
}