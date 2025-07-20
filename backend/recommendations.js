import { askGemini } from './gemini.js';

const prompts = {
  dashboard: analytics => `
Role: You are a seasoned F&B cost-control analyst.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics)}
Task:
1. Rank the top 5 SKUs or dishes that deserve more focus (high margin & high demand).
2. Rank the top 5 SKUs or processes to eliminate or down-weight (low margin, high spoilage, staff bottlenecks).
3. Explain the one most important cross-cutting trend you notice (≤150 words).
4. Suggest one quick win action we can take this week.
Output: Return a Markdown table with columns: Rank | Item | Why Focus/Eliminate | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  demand: analytics => `
Role: You are a seasoned F&B cost-control analyst.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics)}
Task:
1. List the top 5 SKUs or dishes with the highest forecasted demand next week.
2. Highlight any items at risk of overstock or understock.
3. Suggest one action to optimize demand planning for the next 7 days.
Output: Markdown table: Rank | Item | Demand Driver | Risk/Opportunity | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  inventory: analytics => `
Role: You are a seasoned F&B cost-control analyst.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics)}
Task:
1. List the top 5 items at risk of expiry or overstock.
2. Recommend items to reorder or reduce.
3. Suggest one quick win to improve inventory turnover this week.
Output: Markdown table: Rank | Item | Risk/Opportunity | Action | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  menu: analytics => `
Role: You are a seasoned F&B cost-control analyst.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics)}
Task:
1. Rank the top 5 menu items to promote (high margin, high demand).
2. Rank the top 5 to eliminate or rework (low margin, high waste).
3. Suggest one menu change for immediate impact.
Output: Markdown table: Rank | Item | Why Focus/Eliminate | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  compliance: analytics => `
Role: You are a seasoned F&B cost-control analyst.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics)}
Task:
1. List the top 5 compliance risks or overdue actions.
2. Suggest one action to improve compliance this week.
Output: Markdown table: Rank | Risk/Action | Why Important | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  training: analytics => `
Role: You are a seasoned F&B cost-control analyst.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics)}
Task:
1. List the top 5 staff training gaps or bottlenecks.
2. Suggest one training action for immediate impact.
Output: Markdown table: Rank | Staff/Module | Why Focus | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  supplier: analytics => `
Role: You are a seasoned F&B cost-control analyst.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics)}
Task:
1. List the top 5 supplier risks or opportunities.
2. Suggest one supplier action for immediate impact.
Output: Markdown table: Rank | Supplier | Risk/Opportunity | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  waste: analytics => `
Role: You are a seasoned F&B cost-control analyst.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics)}
Task:
1. List the top 5 sources of waste (by item or process).
2. Suggest one action to reduce waste this week.
Output: Markdown table: Rank | Source | Why Focus | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
};

export async function getRecommendations(analytics, section = 'dashboard') {
  const promptFn = prompts[section] || prompts['dashboard'];
  const prompt = promptFn(analytics);
  return await askGemini(prompt);
}

export { prompts }; 