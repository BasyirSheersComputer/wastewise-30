import { askGemini } from './gemini.js';

export async function getRecommendations(analytics) {
  const prompt = `
You are a restaurant business analyst. Given the following data:
- Top selling items: ${JSON.stringify(analytics.topSellingItems)}
- Local holidays: ${JSON.stringify(analytics.localHolidays)}
- Peak/trough seasons: ${JSON.stringify(analytics.seasons)}
- Staff training: ${JSON.stringify(analytics.staffTraining)}
- Supplier risk: ${JSON.stringify(analytics.supplierRisk)}
- Waste tracking: ${JSON.stringify(analytics.waste)}
- Compliance: ${JSON.stringify(analytics.compliance)}

Provide:
1. Forecasted most in-demand item for next week
2. Which items to stock up
3. Highest compliance risk areas
4. Undertrained staff
5. High-risk suppliers
6. Waste management suggestions
7. Any other high-value optimization ideas

Respond in concise bullet points.
`;
  return await askGemini(prompt);
} 