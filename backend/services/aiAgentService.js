// aiAgentService.js - Context-Aware AI Agent powered by Gemini
import { askGemini } from '../ai/gemini.js';
import logger from '../utils/logger.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

/**
 * AI Agent Service with Feature-Specific Context
 * Powered by Gemini 2.5 Flash
 */
class AIAgentService {
  constructor() {
    this.memoryStore = new Map(); // In-memory storage for agent context
    this.sessionStore = new Map(); // Session-specific context
  }

  /**
   * Get feature-specific system prompt
   * Tailored for each WasteWise feature/page
   */
  getFeatureSystemPrompt(feature, context = {}) {
    const baseContext = `You are an expert AI assistant for WasteWise, a Malaysian F&B waste management SaaS platform.

CORE MISSION: Help F&B businesses reduce food waste by 30-40% within 60 days, saving RM 15,000-25,000 monthly per outlet.

COMMUNICATION STYLE:
- Professional, data-driven, specific
- Use Malaysian Ringgit (RM) for all monetary values
- Provide exact numbers, not ranges when possible
- Focus on outcomes, not features
- No fluff or generic AI-generated content

`;

    const featurePrompts = {
      // Waste Analytics & Tracking
      waste: `${baseContext}
CURRENT FEATURE: Waste Analytics & Tracking

YOUR ROLE: Waste Reduction Specialist
- Analyze waste patterns and identify cost-saving opportunities
- Provide specific recommendations to achieve 25-40% waste reduction
- Calculate exact RM savings based on waste data
- Identify top waste items and suggest prevention strategies
- Consider Malaysian F&B context (ingredients, suppliers, regulations)

FOCUS AREAS:
1. Top waste items by cost (RM value, not just quantity)
2. Waste patterns by time/day/category
3. Root cause analysis (overproduction, spoilage, customer returns)
4. Actionable 7-day action plans
5. Estimated RM savings per recommendation

OUTPUT FORMAT:
- Specific, measurable recommendations
- RM cost impact for each item
- Timeline for implementation (7-day, 30-day, 60-day)
- Priority ranking (High/Medium/Low based on RM impact)

USER CONTEXT: ${JSON.stringify(context)}`,

      // Inventory Management
      inventory: `${baseContext}
CURRENT FEATURE: Inventory Management

YOUR ROLE: Inventory Optimization Specialist
- Analyze current stock levels and identify optimization opportunities
- Predict spoilage risk and suggest reorder timing
- Calculate optimal stock levels to minimize waste
- Recommend inventory turnover improvements
- Consider supplier lead times and seasonal variations

FOCUS AREAS:
1. Low stock alerts (prevent stockouts saving RM 5-10k monthly)
2. Overstocked items (tie-up capital, spoilage risk)
3. Spoilage prevention (10-15% reduction target, RM 8-12k savings)
4. Reorder point optimization
5. Dead stock identification

OUTPUT FORMAT:
- Item-specific recommendations with RM impact
- Reorder suggestions with quantities
- Spoilage risk scores (High/Medium/Low)
- Cost optimization opportunities
- Supplier recommendations

USER CONTEXT: ${JSON.stringify(context)}`,

      // Demand Forecasting
      forecast: `${baseContext}
CURRENT FEATURE: AI Demand Forecasting

YOUR ROLE: Demand Forecasting Specialist powered by Prophet & Gemini
- Analyze historical sales data and predict future demand
- Factor in Malaysian holidays, weather, local events
- Achieve 85-95% prediction accuracy target
- Reduce overproduction by 30-40% (RM 10-20k monthly savings)
- Consider seasonality and trends

FOCUS AREAS:
1. Daily/weekly demand predictions per menu item
2. Peak vs off-peak patterns
3. Malaysian holidays impact (Hari Raya, CNY, Deepavali, etc.)
4. Weather correlation (rainy days, hot weather)
5. Event-driven spikes (promotions, local events)

OUTPUT FORMAT:
- Precise quantity predictions per item
- Confidence intervals (%)
- Factors affecting forecast (holidays, weather, trends)
- Recommended production quantities
- RM savings from optimized production

FORECASTING METHOD: Combine Prophet time-series analysis with Gemini contextual intelligence

USER CONTEXT: ${JSON.stringify(context)}`,

      // Supplier Management
      suppliers: `${baseContext}
CURRENT FEATURE: Supplier Integration & Automated Ordering

YOUR ROLE: Procurement Optimization Specialist
- Optimize supplier relationships and ordering workflows
- Achieve 15-20 hours weekly time savings (RM 3-5k labor value)
- Prevent RM 5-10k monthly stockout losses
- Improve supplier performance and cost efficiency
- Consider Malaysian supplier landscape

FOCUS AREAS:
1. Automated reorder point triggers
2. Supplier performance analysis (on-time delivery, quality)
3. Cost comparison and negotiation opportunities
4. Lead time optimization
5. Stockout prevention strategies

OUTPUT FORMAT:
- Auto-order recommendations with quantities and timing
- Supplier performance scores with improvement suggestions
- Cost savings opportunities (RM amounts)
- Risk alerts (late deliveries, quality issues)
- Procurement efficiency metrics (hours saved)

USER CONTEXT: ${JSON.stringify(context)}`,

      // Staff Training
      staff: `${baseContext}
CURRENT FEATURE: Staff Training & Certification

YOUR ROLE: Training & Development Specialist
- Design effective waste reduction training programs
- Track staff performance and certification progress
- Identify training gaps and improvement opportunities
- Measure training ROI (waste reduction improvements)
- Consider Malaysian F&B staff training needs

FOCUS AREAS:
1. Waste reduction best practices training
2. Proper food handling and storage techniques
3. Portion control and preparation methods
4. Staff performance tracking
5. Certification and skill development

OUTPUT FORMAT:
- Personalized training recommendations per staff member
- Module suggestions based on performance gaps
- Progress tracking metrics
- Estimated waste reduction from training (RM impact)
- Certification readiness assessment

USER CONTEXT: ${JSON.stringify(context)}`,

      // Reports & Compliance
      reports: `${baseContext}
CURRENT FEATURE: Reports & Compliance Automation

YOUR ROLE: Compliance & Reporting Specialist
- Ensure 95-100% regulatory compliance
- Automate compliance reporting (save 20-30 hours weekly, RM 5-8k value)
- Prevent RM 50-250k compliance fines
- Generate insights from reporting data
- Know Malaysian F&B regulations (MOH, local authorities)

FOCUS AREAS:
1. Compliance status and risk areas
2. Regulatory reporting automation
3. Audit trail completeness
4. Documentation gaps
5. Upcoming regulatory deadlines

OUTPUT FORMAT:
- Compliance status summary (%, score)
- Missing documentation alerts
- Regulatory risk assessment
- Time savings from automation (hours/week)
- Recommended corrective actions with deadlines

USER CONTEXT: ${JSON.stringify(context)}`,

      // Menu Optimization
      menu: `${baseContext}
CURRENT FEATURE: Menu Optimization

YOUR ROLE: Menu Engineering & Profitability Specialist
- Analyze menu item profitability and waste impact
- Recommend menu changes to reduce waste
- Optimize pricing and portion sizes
- Consider Malaysian F&B preferences and trends
- Target 10-15% profit margin improvement

FOCUS AREAS:
1. Low-margin high-waste items (candidates for removal/repricing)
2. High-margin low-waste items (promote more)
3. Portion size optimization (reduce waste, maintain satisfaction)
4. Menu mix optimization (waste vs profitability)
5. Seasonal menu recommendations

OUTPUT FORMAT:
- Item-by-item profitability analysis (RM margin, waste %)
- Menu engineering matrix (Stars, Plowhorses, Puzzles, Dogs)
- Specific recommendations (remove, reprice, reposition, promote)
- Expected RM impact per recommendation
- Implementation timeline

USER CONTEXT: ${JSON.stringify(context)}`,

      // General Dashboard
      dashboard: `${baseContext}
CURRENT FEATURE: Operational Intelligence Dashboard

YOUR ROLE: F&B Operations Analyst
- Provide high-level strategic insights across all operations
- Identify highest-impact improvement opportunities
- Monitor KPIs and alert on anomalies
- Recommend cross-functional optimizations
- Prioritize actions by RM impact

FOCUS AREAS:
1. Overall waste reduction progress (vs 30-40% target)
2. Month-over-month savings trends
3. Highest-impact opportunities across all features
4. Operational efficiency metrics
5. Strategic recommendations

OUTPUT FORMAT:
- Executive summary of current state
- Top 3 priorities by RM impact
- Progress vs targets (30-40% waste reduction)
- Cross-functional optimization opportunities
- Monthly savings forecast

USER CONTEXT: ${JSON.stringify(context)}`
    };

    return featurePrompts[feature] || featurePrompts.dashboard;
  }

  /**
   * Process uploaded file data with AI
   * Extracts insights from CSV or PDF documents
   */
  async processUploadedFile(feature, fileData, fileType, userId) {
    try {
      logger.info(`Processing uploaded ${fileType} for feature: ${feature}`, { userId });

      const systemPrompt = this.getFeatureSystemPrompt(feature, {
        uploadType: fileType,
        userId
      });

      const analysisPrompt = `${systemPrompt}

TASK: Analyze the following data from an uploaded ${fileType} file and extract actionable insights.

FILE DATA:
${fileType === 'csv' ? this.formatCSVForAI(fileData) : this.formatPDFForAI(fileData)}

ANALYSIS REQUIRED:
1. Extract all relevant data points
2. Identify patterns and anomalies
3. Calculate key metrics (waste %, costs in RM, savings opportunities)
4. Provide specific recommendations
5. Suggest integration with existing data

OUTPUT: Structured JSON with:
{
  "summary": "Brief overview",
  "dataPoints": [],
  "insights": [],
  "recommendations": [],
  "estimatedSavings": "RM amount",
  "integrationSuggestions": []
}`;

      const response = await this.ask(analysisPrompt, 'gemini', { feature, fileType });
      
      // Store in memory for this session
      const sessionKey = `${userId}_${feature}_upload`;
      this.storeInMemory(sessionKey, {
        fileType,
        analysisResult: response.response,
        timestamp: new Date().toISOString()
      });

      return {
        analysis: response.response,
        provider: response.provider,
        sessionKey,
        timestamp: response.timestamp
      };
    } catch (error) {
      logger.error('Error processing uploaded file', { feature, fileType, error: error.message });
      throw error;
    }
  }

  /**
   * Format CSV data for AI consumption
   */
  formatCSVForAI(csvData) {
    // Take first 50 rows for analysis (to stay within token limits)
    const rows = csvData.slice(0, 50);
    return rows.map((row, idx) => `Row ${idx + 1}: ${JSON.stringify(row)}`).join('\n');
  }

  /**
   * Format PDF text for AI consumption
   */
  formatPDFForAI(pdfText) {
    // Take first 5000 characters
    return pdfText.substring(0, 5000);
  }

  /**
   * Get AI recommendations with user context
   */
  async getContextualRecommendations(feature, userId, additionalContext = {}) {
    try {
      // Fetch user's recent data from Supabase
      const userContext = await this.fetchUserContext(userId, feature);
      
      // Retrieve any stored memory for this user/feature
      const sessionMemory = this.getFromMemory(`${userId}_${feature}_upload`);

      const fullContext = {
        ...userContext,
        ...additionalContext,
        previousAnalysis: sessionMemory || null
      };

      const systemPrompt = this.getFeatureSystemPrompt(feature, fullContext);
      
      const recommendationPrompt = `${systemPrompt}

TASK: Based on the user's current data and context, provide 3-5 specific, actionable recommendations.

REQUIREMENTS:
1. Each recommendation must include estimated RM savings
2. Provide implementation timeline (7-day, 30-day, 60-day)
3. Prioritize by impact (High/Medium/Low)
4. Be specific to Malaysian F&B operations
5. Reference actual user data when available

OUTPUT: JSON array of recommendations:
[
  {
    "title": "Specific action",
    "description": "Detailed explanation",
    "impact": "High|Medium|Low",
    "savings": "RM X,XXX",
    "timeline": "7-day|30-day|60-day",
    "steps": ["Step 1", "Step 2", ...]
  }
]`;

      const response = await askGemini(recommendationPrompt);
      
      return {
        recommendations: this.parseJSONResponse(response),
        feature,
        userId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting contextual recommendations', { feature, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Fetch user context from database
   */
  async fetchUserContext(userId, feature) {
    if (!supabase) {
      return { userId, feature, note: 'No database context available' };
    }

    try {
      const context = { userId, feature };

      // Fetch relevant data based on feature
      switch (feature) {
        case 'waste':
          const { data: wasteLogs } = await supabase
            .from('waste_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);
          context.recentWasteLogs = wasteLogs || [];
          break;

        case 'inventory':
          const { data: inventory } = await supabase
            .from('inventory')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);
          context.currentInventory = inventory || [];
          break;

        case 'suppliers':
          const { data: suppliers } = await supabase
            .from('suppliers')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);
          context.activeSuppliers = suppliers || [];
          break;

        case 'staff':
          const { data: staff } = await supabase
            .from('staff')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);
          context.staff = staff || [];
          break;

        default:
          // General dashboard context
          const { data: user } = await supabase
            .from('users')
            .select('company_name, company_size, subscription_plan')
            .eq('id', userId)
            .single();
          context.userProfile = user || {};
      }

      return context;
    } catch (error) {
      logger.error('Error fetching user context', { userId, feature, error: error.message });
      return { userId, feature, error: error.message };
    }
  }

  /**
   * Store data in agent memory
   */
  storeInMemory(key, data, ttlMinutes = 60) {
    this.memoryStore.set(key, {
      data,
      expires: Date.now() + (ttlMinutes * 60 * 1000)
    });
  }

  /**
   * Retrieve data from agent memory
   */
  getFromMemory(key) {
    const stored = this.memoryStore.get(key);
    if (!stored) return null;

    // Check if expired
    if (Date.now() > stored.expires) {
      this.memoryStore.delete(key);
      return null;
    }

    return stored.data;
  }

  /**
   * Parse JSON response from AI (handles markdown code blocks)
   */
  parseJSONResponse(response) {
    try {
      // Remove markdown code blocks if present
      let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      // If parsing fails, return raw response
      logger.warn('Failed to parse JSON from AI response, returning raw', { error: error.message });
      return response;
    }
  }

  /**
   * Ask AI with automatic prompt enhancement
   */
  async ask(prompt, provider = 'gemini', options = {}) {
    const startTime = Date.now();
    
    try {
      const response = await askGemini(prompt);
      
      logger.info('AI Agent response', {
        provider,
        feature: options.feature,
        responseTime: Date.now() - startTime,
        promptLength: prompt.length,
        responseLength: response.length
      });

      return {
        response,
        provider,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      logger.error('AI Agent error', { provider, error: error.message });
      throw error;
    }
  }

  /**
   * Clear expired memory entries
   */
  clearExpiredMemory() {
    const now = Date.now();
    for (const [key, value] of this.memoryStore.entries()) {
      if (now > value.expires) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    return {
      totalEntries: this.memoryStore.size,
      entriesActive: Array.from(this.memoryStore.values()).filter(v => Date.now() <= v.expires).length
    };
  }
}

// Export singleton instance
export default new AIAgentService();

