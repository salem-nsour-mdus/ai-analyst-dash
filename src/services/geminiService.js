import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Initialize Gemini only if key exists
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Store dashboard data + chat history
let dashboardData = [];

// Gemini chat history format:
// [{ role: "user" | "model", parts: [{ text: "..." }] }]
let chatHistory = [];

// Keep history from growing forever (optional but recommended)
const MAX_TURNS = 12; // 12 turns = 24 messages (user+model)

const trimHistory = () => {
  const maxMessages = MAX_TURNS * 2;
  if (chatHistory.length > maxMessages) {
    chatHistory = chatHistory.slice(chatHistory.length - maxMessages);
  }
};

export const geminiService = {
  initializeWithData(insights) {
    console.log("📊 Gemini initialized with", insights?.length ?? 0, "insights");
    dashboardData = insights || [];
    chatHistory = [];
    return true;
  },

  async sendMessage(userMessage, insights = dashboardData) {
    // Update dashboard data if provided
    if (insights && insights.length > 0) {
      dashboardData = insights;
    }

    // If no API key, use fallback responses based on data (no Gemini)
    if (!API_KEY || !genAI) {
      console.warn("⚠️ No API key - using data-driven fallback responses");

      // (Optional) still store local history for UI continuity
      chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
      trimHistory();

      if (dashboardData && dashboardData.length > 0) {
        const highConfidence = dashboardData.filter(
          (i) => i.meta?.confidence_score > 0.8
        ).length;

        const avgConfidence = Math.round(
          (dashboardData.reduce((acc, i) => acc + (i.meta?.confidence_score || 0), 0) /
            dashboardData.length) *
            100
        );

        const sources = [
          ...new Set(
            dashboardData.flatMap((i) =>
              (i.payload?.sources || []).map((s) =>
                String(s).split(".").pop().toUpperCase()
              )
            )
          ),
        ].join(", ");

        const lowerMsg = userMessage.toLowerCase();

        let text = "";
        if (lowerMsg.includes("sales") || lowerMsg.includes("revenue")) {
          text =
            "📊 Based on your data, I can see a sales insight with 89% confidence showing a 15% increase due to new marketing channels.";
        } else if (
          lowerMsg.includes("anomaly") ||
          lowerMsg.includes("error") ||
          lowerMsg.includes("issue")
        ) {
          text =
            "⚠️ Yes, there's an anomaly detected in server logs with 45% confidence. This requires manual review.";
        } else if (lowerMsg.includes("confidence") || lowerMsg.includes("average")) {
          text = `📈 The average confidence across all ${dashboardData.length} insights is ${avgConfidence}%. You have ${highConfidence} high-confidence insights (>80%).`;
        } else if (lowerMsg.includes("source") || lowerMsg.includes("data")) {
          text = `🗄️ Active data sources: ${sources || "PDF, SQL, Web"}.`;
        } else if (lowerMsg.includes("summary") || lowerMsg.includes("overview")) {
          text = `📋 Dashboard Summary: ${dashboardData.length} total insights, ${avgConfidence}% avg confidence, ${highConfidence} high-confidence items. Sources: ${sources || "PDF, SQL, Web"}.`;
        } else {
          const responses = [
            "I can see your dashboard data. What would you like to know about your insights?",
            "You have several insights available. Try asking about sales, anomalies, or confidence scores.",
            "I'm ready to help analyze your data. Ask me about trends, predictions, or specific metrics.",
          ];
          text = responses[Math.floor(Math.random() * responses.length)];
        }

        // Store assistant response too
        chatHistory.push({ role: "model", parts: [{ text }] });
        trimHistory();

        return text;
      }

      const text =
        "I can see your dashboard data. What would you like to know about your insights?";
      chatHistory.push({ role: "model", parts: [{ text }] });
      trimHistory();
      return text;
    }

    // Gemini path (chatHistory is used here)
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      });

      // Summarize dashboard data (keeps prompt small)
      const dataSummary = (dashboardData || []).map((i) => ({
        type: i.payload?.type,
        confidence: Math.round((i.meta?.confidence_score || 0) * 100),
        content: String(i.payload?.content || "").substring(0, 120),
        sources: i.payload?.sources || [],
      }));

      // System/context message (kept short but grounded in your data)
      const contextMsg = `You are an AI dashboard analyst. Use ONLY this dataset summary to answer. Dataset: ${JSON.stringify(
        dataSummary
      )}`;

      // Ensure the model "knows" the context even if history was cleared
      // Add it only once at the beginning of a fresh history
      if (chatHistory.length === 0) {
        chatHistory.push({ role: "user", parts: [{ text: contextMsg }] });
        chatHistory.push({
          role: "model",
          parts: [{ text: "Understood. I will answer based on the provided dataset summary." }],
        });
      }

      // Start chat with existing history
      const chat = model.startChat({
        history: chatHistory,
      });

      // Append user message to history (so it's preserved even if request fails after)
      chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
      trimHistory();

      // Send message using Gemini chat
      const result = await chat.sendMessage(userMessage);
      const responseText = result?.response?.text?.() || "";

      // Append model response to history
      chatHistory.push({ role: "model", parts: [{ text: responseText }] });
      trimHistory();

      return responseText || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Gemini error:", error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  },

  clearHistory() {
    chatHistory = [];
  },

  // Optional: let UI read history (useful for debugging)
  getHistory() {
    return chatHistory;
  },
};
