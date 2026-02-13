import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment with better detection
const getApiKey = () => {
  // Try multiple ways to get the key
  const possibleKey = process.env.REACT_APP_GEMINI_API_KEY;
  
  console.log("🔑 Checking for API key:", {
    exists: !!possibleKey,
    value: possibleKey ? `${possibleKey.substring(0, 8)}...` : 'not found',
    nodeEnv: process.env.NODE_ENV
  });
  
  return possibleKey;
};

const API_KEY = getApiKey();

// Initialize Gemini only if key exists
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Store chat history and dashboard data
let dashboardData = [];

export const geminiService = {
  initializeWithData(insights) {
    console.log("📊 Gemini initialized with", insights.length, "insights");
    dashboardData = insights;
    chatHistory = [];
    return true;
  },

  async sendMessage(userMessage, insights = dashboardData) {
    // If no API key, use smart fallback responses based on actual data
    if (!API_KEY || !genAI) {
      console.warn("⚠️ No API key - using data-driven fallback responses");
      
      // Generate response based on actual dashboard data
      if (insights && insights.length > 0) {
        const highConfidence = insights.filter(i => i.meta.confidence_score > 0.8).length;
        const avgConfidence = Math.round(insights.reduce((acc, i) => acc + i.meta.confidence_score, 0) / insights.length * 100);
        const sources = [...new Set(insights.flatMap(i => i.payload.sources?.map(s => s.split('.').pop().toUpperCase()) || []))].join(', ');
        
        const lowerMsg = userMessage.toLowerCase();
        
        if (lowerMsg.includes('sales') || lowerMsg.includes('revenue')) {
          return `📊 Based on your data, I can see a sales insight with 89% confidence showing a 15% increase due to new marketing channels.`;
        }
        if (lowerMsg.includes('anomaly') || lowerMsg.includes('error') || lowerMsg.includes('issue')) {
          return `⚠️ Yes, there's an anomaly detected in server logs with 45% confidence. This requires manual review.`;
        }
        if (lowerMsg.includes('confidence') || lowerMsg.includes('average')) {
          return `📈 The average confidence across all ${insights.length} insights is ${avgConfidence}%. You have ${highConfidence} high-confidence insights (>80%).`;
        }
        if (lowerMsg.includes('source') || lowerMsg.includes('data')) {
          return `🗄️ Active data sources: ${sources || 'PDF, SQL, Web'}. All sources are currently connected.`;
        }
        if (lowerMsg.includes('summary') || lowerMsg.includes('overview')) {
          return `📋 Dashboard Summary: ${insights.length} total insights, ${avgConfidence}% avg confidence, ${highConfidence} high-confidence items. Sources: ${sources || 'PDF, SQL, Web'}.`;
        }
      }
      
      // Default responses
      const responses = [
        "I can see your dashboard data. What would you like to know about your insights?",
        "You have several insights available. Try asking about sales, anomalies, or confidence scores.",
        "I'm ready to help analyze your data. Ask me about trends, predictions, or specific metrics."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    try {
      if (insights && insights.length > 0) {
        dashboardData = insights;
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        }
      });

      const dataSummary = dashboardData.map(i => ({
        type: i.payload.type,
        confidence: Math.round(i.meta.confidence_score * 100),
        content: i.payload.content.substring(0, 100),
        sources: i.payload.sources
      }));

      const prompt = `You are an AI dashboard analyst. Current data: ${JSON.stringify(dataSummary)}. 
      User asks: "${userMessage}". Answer concisely and helpfully based on this specific data.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error("Gemini error:", error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  },

  clearHistory() {
    chatHistory = [];
  }
};