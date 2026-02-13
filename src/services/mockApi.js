export const mockApi = {
  async fetchInsights() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (Math.random() < 0.1) {
      throw new Error('Source disconnected: Unable to fetch insights from SQL database');
    }
    
    return [
      {
        id: "uuid-1234",
        meta: {
          generated_at: "2024-02-14T10:00:00Z",
          model_version: "v2.1",
          confidence_score: 0.89
        },
        payload: {
          type: "text_summary",
          content: "Sales increased by 15% due to new marketing channels.",
          sources: ["campaign_report.pdf", "q3_financials.xlsx"]
        },
        status: "completed"
      },
      {
        id: "uuid-5678",
        meta: {
          confidence_score: 0.45
        },
        payload: {
          type: "alert",
          severity: "high",
          content: "Anomaly detected in server logs. Unusual traffic pattern detected from multiple IP addresses.",
          sources: ["server_logs.log"]
        },
        status: "processing"
      },
      {
        id: "uuid-9012",
        meta: {
          generated_at: "2024-02-14T09:30:00Z",
          model_version: "v2.1",
          confidence_score: 0.95
        },
        payload: {
          type: "prediction",
          content: "Customer churn probability increased to 12% in the last 30 days.",
          sources: ["customer_data.sql", "churn_model_v3"]
        },
        status: "completed"
      },
      {
        id: "uuid-3456",
        meta: {
          generated_at: "2024-02-14T08:15:00Z",
          model_version: "v2.0",
          confidence_score: 0.67
        },
        payload: {
          type: "recommendation",
          content: "Consider increasing server capacity in EU-West region based on usage patterns.",
          sources: ["infrastructure_metrics.pdf"]
        },
        status: "completed"
      }
    ];
  }
};