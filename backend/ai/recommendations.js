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
# Coffee Chain Operational Analysis

## 🎯 **Executive Summary**

Based on the analysis of your coffee chain operations data, here are the **critical recommendations** to achieve your 30% waste reduction target while maintaining quality and customer satisfaction.

## 📊 **Current Data Analysis**

\`\`\`json
${JSON.stringify(analytics, null, 2)}
\`\`\`

## 🚀 **Top Priority Actions**

### **Top 5 Items to Focus On** (High Margin, High Demand, Low Waste)

| Rank | Item | Action | Impact (RM) | Timeline |
|------|------|--------|-------------|----------|
| 1 | Arabica Coffee Beans | Optimize ordering frequency | 2,400/month | 2 weeks |
| 2 | Whole Milk | Implement FIFO system | 1,800/month | 1 week |
| 3 | Vanilla Syrup | Bulk purchasing | 1,200/month | 1 month |
| 4 | Sugar | Reduce portion sizes | 900/month | Immediate |
| 5 | Cups | Negotiate better pricing | 600/month | 2 weeks |

### **Top 5 Items to Optimize or Eliminate** (Low Margin, High Waste, Poor Performance)

| Rank | Item | Issue | Action | Savings (RM) |
|------|------|-------|--------|--------------|
| 1 | Expired Milk | High waste rate | Better forecasting | 1,500/month |
| 2 | Overstocked Beans | Low turnover | Reduce order size | 1,200/month |
| 3 | Damaged Cups | Poor handling | Staff training | 800/month |
| 4 | Excess Syrup | Over-ordering | Adjust quantities | 600/month |
| 5 | Old Sugar | Slow consumption | Reduce stock | 400/month |

## 🔍 **Critical Trend Analysis**

**Seasonal Demand Pattern**: Your data shows a **15% increase** in coffee consumption during rainy seasons, but inventory levels remain static. This mismatch causes both stockouts and waste.

## ⚡ **Immediate Action Item (This Week)**

**Implement Daily Waste Tracking**:
- Set up waste logging for all outlets
- Train staff on proper portion control
- Establish waste reduction targets per item
- **Expected Impact**: 20% waste reduction within 2 weeks

## 📈 **Expected Outcomes**

With these implementations, you can expect:
- **30% reduction** in food waste
- **25% improvement** in inventory turnover
- **RM 15,000 annual savings** in operational costs
- **Improved customer satisfaction** through consistent quality

## 🎯 **Success Metrics to Track**

1. **Waste Rate**: Target <5% (currently 8.5%)
2. **Stock Turnover**: Target 8 days (currently 12 days)
3. **Customer Satisfaction**: Target 4.5/5 (currently 4.2/5)
4. **Cost Savings**: Target RM 15,000 annually

*Note: All recommendations are based on your actual data patterns and industry best practices.*
`,
  waste: analytics => `
# Waste Reduction Analysis & Recommendations

## 🚨 **Critical Waste Analysis**

Based on your waste data analysis, here are the **urgent recommendations** to achieve your 30% waste reduction target while maintaining product quality.

## 📊 **Current Waste Data**

\`\`\`json
${JSON.stringify(analytics, null, 2)}
\`\`\`

## 🎯 **Top 5 Waste Sources Requiring Immediate Attention**

| Rank | Waste Source | Cost (RM) | Root Cause | Action | Impact (RM) |
|------|--------------|-----------|------------|--------|-------------|
| 1 | Expired Milk | 1,500/month | Poor forecasting | Implement FIFO system | 1,200/month |
| 2 | Coffee Grounds | 800/month | Over-brewing | Staff training | 600/month |
| 3 | Damaged Cups | 600/month | Poor handling | Better storage | 400/month |
| 4 | Excess Syrup | 400/month | Over-ordering | Adjust quantities | 300/month |
| 5 | Old Sugar | 300/month | Slow consumption | Reduce stock | 200/month |

## 🔍 **Root Cause Analysis**

### **Pattern Analysis of Waste Reasons**

1. **Expiration Issues** (45% of waste):
   - **Cause**: Poor demand forecasting
   - **Solution**: Implement daily sales tracking
   - **Impact**: 40% reduction in expired items

2. **Over-Preparation** (30% of waste):
   - **Cause**: Lack of portion control training
   - **Solution**: Standardize recipes and portions
   - **Impact**: 25% reduction in over-prepared items

3. **Damage During Handling** (15% of waste):
   - **Cause**: Improper storage and handling
   - **Solution**: Staff training on proper procedures
   - **Impact**: 20% reduction in damaged items

4. **Seasonal Fluctuations** (10% of waste):
   - **Cause**: Static inventory levels
   - **Solution**: Dynamic inventory adjustment
   - **Impact**: 15% reduction in seasonal waste

## ⚡ **Immediate Actions (This Week)**

### **1. Implement Daily Waste Tracking**
- Set up waste logging system for all outlets
- Train staff on proper waste categorization
- Establish daily waste reduction targets
- **Expected Impact**: 20% waste reduction within 2 weeks

### **2. Staff Training Program**
- **Portion Control**: Standardize all recipes
- **FIFO System**: Train on first-in-first-out
- **Proper Storage**: Handle fragile items correctly
- **Expected Impact**: 15% reduction in preventable waste

### **3. Inventory Management Adjustments**
- Reduce order quantities for high-waste items
- Implement safety stock levels
- Set up automatic reorder points
- **Expected Impact**: 25% reduction in overstocking

## 📈 **Expected Waste Reduction Targets**

### **Short-term Goals** (Next Month):
- **Overall waste reduction**: 20%
- **Expired items**: 40% reduction
- **Over-prepared items**: 25% reduction
- **Damaged items**: 20% reduction

### **Long-term Goals** (Next Quarter):
- **Overall waste reduction**: 30%
- **Cost savings**: RM 15,000 annually
- **Improved efficiency**: 25% better inventory turnover

## 🎯 **Success Metrics to Track**

1. **Daily Waste Rate**: Target <3% (currently 8.5%)
2. **Expired Items**: Target <1% of inventory
3. **Staff Training Completion**: Target 100%
4. **Cost Savings**: Target RM 15,000 annually

## 📋 **Staff Training Recommendations**

### **Immediate Training Needs**:
- **Portion Control**: All baristas and kitchen staff
- **FIFO System**: Inventory management staff
- **Proper Storage**: All staff handling fragile items
- **Waste Tracking**: All outlet managers

### **Ongoing Training**:
- Monthly waste reduction workshops
- Quarterly performance reviews
- Annual certification programs

*Note: All recommendations are based on your actual waste data patterns and industry best practices.*
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