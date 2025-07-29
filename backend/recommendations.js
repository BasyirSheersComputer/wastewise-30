import { askAI } from './ai-service.js';
import { 
  getTopSellingItems, 
  getWasteStats, 
  getStaffTraining, 
  getSupplierRisk, 
  getComplianceStats, 
  getLocalHolidays, 
  getSeasons 
} from './db.js';

// Database data fetchers for each section
const dataFetchers = {
  dashboard: async () => {
    const [topSellingItems, waste, staffTraining, supplierRisk, compliance] = await Promise.all([
      getTopSellingItems(),
      getWasteStats(),
      getStaffTraining(),
      getSupplierRisk(),
      getComplianceStats(),
    ]);
    return {
      topSellingItems,
      waste,
      staffTraining,
      supplierRisk,
      compliance,
      timestamp: new Date().toISOString()
    };
  },
  
  waste: async () => {
    const wasteData = await getWasteStats();
    const topItems = await getTopSellingItems();
    return {
      wasteData,
      topItems,
      wasteByCategory: wasteData.reduce((acc, item) => {
        const category = item.category || 'Other';
        acc[category] = (acc[category] || 0) + (item.quantity || 0);
        return acc;
      }, {}),
      wasteByReason: wasteData.reduce((acc, item) => {
        const reason = item.reason || 'Unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {}),
      timestamp: new Date().toISOString()
    };
  },
  
  supplier: async () => {
    const supplierData = await getSupplierRisk();
    const topItems = await getTopSellingItems();
    return {
      suppliers: supplierData,
      topItems,
      supplierPerformance: supplierData.map(s => ({
        name: s.name,
        risk: s.risk,
        orders: s.total_orders,
        lastDelivery: s.last_delivery
      })),
      timestamp: new Date().toISOString()
    };
  },
  
  menu: async () => {
    const topItems = await getTopSellingItems();
    const waste = await getWasteStats();
    return {
      topItems,
      waste,
      menuPerformance: topItems.map(item => ({
        item: item.inventory_id,
        quantity: item.quantity,
        waste: waste.filter(w => w.item_id === item.inventory_id).length
      })),
      timestamp: new Date().toISOString()
    };
  },
  
  training: async () => {
    const staffData = await getStaffTraining();
    const compliance = await getComplianceStats();
    return {
      staff: staffData,
      compliance,
      trainingGaps: staffData.filter(s => !s.completed),
      completionRate: staffData.filter(s => s.completed).length / staffData.length,
      timestamp: new Date().toISOString()
    };
  },
  
  compliance: async () => {
    const compliance = await getComplianceStats();
    const waste = await getWasteStats();
    const staff = await getStaffTraining();
    return {
      compliance,
      waste,
      staff,
      highRiskAreas: compliance.filter(c => c.risk === 'high'),
      timestamp: new Date().toISOString()
    };
  },
  
  inventory: async () => {
    const topItems = await getTopSellingItems();
    const waste = await getWasteStats();
    return {
      inventory: topItems,
      waste,
      lowStockItems: topItems.filter(item => item.quantity < 10),
      highWasteItems: waste.filter(item => item.quantity > 5),
      timestamp: new Date().toISOString()
    };
  },
  
  demand: async () => {
    const topItems = await getTopSellingItems();
    const holidays = await getLocalHolidays();
    const seasons = await getSeasons();
    return {
      demand: topItems,
      holidays,
      seasons,
      peakItems: topItems.slice(0, 5),
      timestamp: new Date().toISOString()
    };
  }
};

const prompts = {
  dashboard: analytics => `
Role: You are a seasoned F&B cost-control analyst.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics, null, 2)}
Task:
1. Rank the top 5 SKUs or dishes that deserve more focus (high margin & high demand).
2. Rank the top 5 SKUs or processes to eliminate or down-weight (low margin, high spoilage, staff bottlenecks).
3. Explain the one most important cross-cutting trend you notice (≤150 words).
4. Suggest one quick win action we can take this week.
Output: Return a Markdown table with columns: Rank | Item | Why Focus/Eliminate | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  waste: analytics => `
Role: You are a seasoned F&B cost-control analyst specializing in waste reduction.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics, null, 2)}
Task:
1. List the top 5 sources of waste (by item or process).
2. Suggest one action to reduce waste this week.
3. Identify any patterns in waste reasons or categories.
4. Recommend inventory adjustments based on waste data.
Output: Return a Markdown table with columns: Rank | Source | Why Focus | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  supplier: analytics => `
Role: You are a seasoned F&B cost-control analyst specializing in supplier management.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics, null, 2)}
Task:
1. List the top 5 supplier risks or opportunities.
2. Suggest one supplier action for immediate impact.
3. Identify suppliers with performance issues.
4. Recommend supplier consolidation or diversification strategies.
Output: Return a Markdown table with columns: Rank | Supplier | Risk/Opportunity | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  menu: analytics => `
Role: You are a seasoned F&B cost-control analyst specializing in menu optimization.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics, null, 2)}
Task:
1. Rank the top 5 menu items to promote (high margin, high demand).
2. Rank the top 5 to eliminate or rework (low margin, high waste).
3. Suggest one menu change for immediate impact.
4. Identify items with high waste but good demand.
Output: Return a Markdown table with columns: Rank | Item | Why Focus/Eliminate | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  training: analytics => `
Role: You are a seasoned F&B cost-control analyst specializing in staff training.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics, null, 2)}
Task:
1. List the top 5 staff training gaps or bottlenecks.
2. Suggest one training action for immediate impact.
3. Identify staff members needing urgent training.
4. Recommend training priorities based on compliance risks.
Output: Return a Markdown table with columns: Rank | Staff/Module | Why Focus | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  compliance: analytics => `
Role: You are a seasoned F&B cost-control analyst specializing in compliance.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics, null, 2)}
Task:
1. List the top 5 compliance risks or overdue actions.
2. Suggest one action to improve compliance this week.
3. Identify areas with high compliance risk.
4. Recommend compliance monitoring improvements.
Output: Return a Markdown table with columns: Rank | Risk/Action | Why Important | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  inventory: analytics => `
Role: You are a seasoned F&B cost-control analyst specializing in inventory management.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics, null, 2)}
Task:
1. List the top 5 items at risk of expiry or overstock.
2. Recommend items to reorder or reduce.
3. Suggest one quick win to improve inventory turnover this week.
4. Identify items with high waste but low demand.
Output: Return a Markdown table with columns: Rank | Item | Risk/Opportunity | Action | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`,
  demand: analytics => `
Role: You are a seasoned F&B cost-control analyst specializing in demand forecasting.
Context: We operate 12 outlets and aim to cut food waste by ≥30%.
Data: ${JSON.stringify(analytics, null, 2)}
Task:
1. List the top 5 SKUs or dishes with the highest forecasted demand next week.
2. Highlight any items at risk of overstock or understock.
3. Suggest one action to optimize demand planning for the next 7 days.
4. Consider seasonal and holiday factors in demand.
Output: Markdown table: Rank | Item | Demand Driver | Risk/Opportunity | 7-Day Impact Estimate (RM)
Tone/Depth: Concise and numeric.
`
};

/**
 * Enhanced recommendations agent that:
 * 1. Fetches relevant database data for the specific section
 * 2. Uses Gemini as primary AI provider
 * 3. Falls back to ChatGPT if Gemini fails
 * 4. Returns structured recommendations
 */
export async function getRecommendations(section = 'dashboard', provider = 'gemini') {
  try {
    // 1. Fetch relevant data for the section
    const dataFetcher = dataFetchers[section] || dataFetchers['dashboard'];
    const analytics = await dataFetcher();
    
    // 2. Get the appropriate prompt for the section
    const promptFn = prompts[section] || prompts['dashboard'];
    const prompt = promptFn(analytics);
    
    // 3. Try Gemini first, fallback to ChatGPT
    let recommendations;
    try {
      recommendations = await askAI(prompt, 'gemini');
    } catch (error) {
      console.log('Gemini failed, trying ChatGPT:', error.message);
      recommendations = await askAI(prompt, 'chatgpt');
    }
    
    return {
      section,
      analytics,
      recommendations,
      timestamp: new Date().toISOString(),
      provider: recommendations.includes('Error') ? 'chatgpt' : 'gemini'
    };
    
  } catch (error) {
    console.error('Recommendations error:', error);
    return {
      section,
      error: error.message,
      recommendations: 'Unable to generate recommendations at this time.',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get recommendations for multiple sections
 */
export async function getMultiSectionRecommendations(sections = ['dashboard']) {
  const results = await Promise.allSettled(
    sections.map(section => getRecommendations(section))
  );
  
  return results.map((result, index) => ({
    section: sections[index],
    ...(result.status === 'fulfilled' ? result.value : { error: result.reason?.message })
  }));
}

export { prompts, dataFetchers }; 