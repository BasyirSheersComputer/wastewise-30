import { GoogleGenerativeAI } from '@google/genai';
import OpenAI from 'openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RetrievalQAChain } from 'langchain/chains';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PromptTemplate } from 'langchain/prompts';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export class AIAgentService {
  constructor(database, cache, analytics) {
    this.database = database;
    this.cache = cache;
    this.analytics = analytics;
    
    // Initialize AI models
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.chatModel = new ChatOpenAI({ 
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4',
      temperature: 0.7
    });
    
    // Initialize embeddings
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    
    // Initialize vector store
    this.vectorStore = null;
    this.ragChain = null;
    
    // Strategic reasoning components
    this.strategicContext = {
      businessGoals: [],
      constraints: [],
      opportunities: [],
      risks: []
    };
    
    this.agentCapabilities = {
      dataAnalysis: true,
      strategicPlanning: true,
      wasteOptimization: true,
      costAnalysis: true,
      trendPrediction: true,
      recommendationEngine: true
    };
  }

  async initialize() {
    logger.info('🤖 Initializing AI Agent Service...');
    
    try {
      // Initialize vector store with business data
      await this.initializeVectorStore();
      
      // Initialize RAG chain
      await this.initializeRAGChain();
      
      // Load strategic context
      await this.loadStrategicContext();
      
      logger.info('✅ AI Agent Service initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize AI Agent Service:', error);
      throw error;
    }
  }

  async initializeVectorStore() {
    logger.info('📚 Initializing vector store...');
    
    try {
      // Get business documents and data
      const documents = await this.getBusinessDocuments();
      
      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });
      
      const docs = await textSplitter.createDocuments(documents);
      
      // Create vector store
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        this.embeddings
      );
      
      logger.info(`✅ Vector store initialized with ${docs.length} documents`);
    } catch (error) {
      logger.error('❌ Failed to initialize vector store:', error);
      throw error;
    }
  }

  async initializeRAGChain() {
    logger.info('🔗 Initializing RAG chain...');
    
    try {
      const promptTemplate = new PromptTemplate({
        template: `You are a strategic business intelligence AI agent specializing in restaurant waste management and cost optimization.

Context: {context}

Question: {question}

Please provide a comprehensive analysis with:
1. Strategic insights based on the data
2. Actionable recommendations
3. Risk assessment
4. Cost-benefit analysis
5. Implementation timeline

Answer:`,
        inputVariables: ['context', 'question']
      });
      
      this.ragChain = RetrievalQAChain.fromLLM(
        this.chatModel,
        this.vectorStore.asRetriever(),
        { prompt: promptTemplate }
      );
      
      logger.info('✅ RAG chain initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize RAG chain:', error);
      throw error;
    }
  }

  async getBusinessDocuments() {
    // This would typically load from database, files, or external sources
    const documents = [
      {
        content: `Restaurant waste management best practices include:
        - Real-time inventory tracking
        - Predictive ordering based on historical data
        - Staff training on waste reduction
        - Supplier management and quality control
        - Regular waste audits and analysis
        - Menu optimization based on waste patterns
        - Cost-benefit analysis of waste reduction initiatives`,
        metadata: { type: 'best_practices', category: 'waste_management' }
      },
      {
        content: `Strategic cost optimization in F&B:
        - Food cost should be 25-35% of total revenue
        - Labor cost should be 25-30% of total revenue
        - Waste cost should be less than 5% of food cost
        - Regular menu engineering based on profitability
        - Seasonal ingredient planning
        - Bulk purchasing strategies
        - Cross-utilization of ingredients`,
        metadata: { type: 'cost_optimization', category: 'financial' }
      },
      {
        content: `AI-powered analytics for restaurant optimization:
        - Demand forecasting using machine learning
        - Real-time inventory optimization
        - Predictive waste analysis
        - Dynamic pricing strategies
        - Customer behavior analysis
        - Supply chain optimization
        - Performance benchmarking`,
        metadata: { type: 'ai_analytics', category: 'technology' }
      }
    ];
    
    return documents;
  }

  async loadStrategicContext() {
    logger.info('🎯 Loading strategic context...');
    
    try {
      // Load business goals from database
      const goals = await this.database.query(
        'SELECT * FROM business_goals WHERE active = true'
      );
      
      this.strategicContext.businessGoals = goals.rows || [];
      
      // Load constraints and opportunities
      const constraints = await this.database.query(
        'SELECT * FROM business_constraints WHERE active = true'
      );
      
      this.strategicContext.constraints = constraints.rows || [];
      
      logger.info('✅ Strategic context loaded successfully');
    } catch (error) {
      logger.warn('⚠️ Could not load strategic context from database, using defaults');
      this.strategicContext = {
        businessGoals: [
          { id: 1, goal: 'Reduce food waste by 30%', priority: 'high' },
          { id: 2, goal: 'Optimize inventory costs', priority: 'medium' },
          { id: 3, goal: 'Improve staff efficiency', priority: 'medium' }
        ],
        constraints: [
          { id: 1, constraint: 'Budget limitations', impact: 'high' },
          { id: 2, constraint: 'Staff training time', impact: 'medium' },
          { id: 3, constraint: 'Supplier relationships', impact: 'medium' }
        ]
      };
    }
  }

  async processQuery(query, context = {}) {
    logger.info(`🤖 Processing AI query: ${query.substring(0, 50)}...`);
    
    try {
      // Enhance query with strategic context
      const enhancedQuery = await this.enhanceQueryWithContext(query, context);
      
      // Process with RAG chain
      const ragResponse = await this.ragChain.call({
        question: enhancedQuery
      });
      
      // Apply strategic reasoning
      const strategicAnalysis = await this.applyStrategicReasoning(
        ragResponse.text,
        context
      );
      
      // Generate actionable insights
      const insights = await this.generateInsights(
        strategicAnalysis,
        context
      );
      
      const response = {
        query: query,
        response: ragResponse.text,
        strategicAnalysis: strategicAnalysis,
        insights: insights,
        confidence: this.calculateConfidence(ragResponse, strategicAnalysis),
        timestamp: new Date().toISOString(),
        context: context
      };
      
      // Cache the response
      await this.cache.set(`ai_response_${Date.now()}`, response, 3600);
      
      logger.info('✅ AI query processed successfully');
      return response;
      
    } catch (error) {
      logger.error('❌ Failed to process AI query:', error);
      throw error;
    }
  }

  async enhanceQueryWithContext(query, context) {
    const businessGoals = this.strategicContext.businessGoals
      .map(goal => goal.goal)
      .join(', ');
    
    const constraints = this.strategicContext.constraints
      .map(constraint => constraint.constraint)
      .join(', ');
    
    return `${query}

Strategic Context:
- Business Goals: ${businessGoals}
- Constraints: ${constraints}
- Restaurant Context: ${context.restaurantId || 'General'}
- Time Period: ${context.timePeriod || 'Current'}

Please provide strategic insights considering these factors.`;
  }

  async applyStrategicReasoning(ragResponse, context) {
    logger.info('🎯 Applying strategic reasoning...');
    
    try {
      const strategicPrompt = `
Based on the following analysis:
${ragResponse}

And considering our strategic context:
- Business Goals: ${this.strategicContext.businessGoals.map(g => g.goal).join(', ')}
- Constraints: ${this.strategicContext.constraints.map(c => c.constraint).join(', ')}

Provide strategic reasoning that includes:
1. Alignment with business goals
2. Risk assessment
3. Resource requirements
4. Implementation strategy
5. Success metrics
6. Timeline recommendations
`;

      const strategicResponse = await this.chatModel.predict(strategicPrompt);
      
      return {
        reasoning: strategicResponse,
        alignment: this.assessGoalAlignment(ragResponse),
        risks: this.identifyRisks(ragResponse),
        opportunities: this.identifyOpportunities(ragResponse)
      };
      
    } catch (error) {
      logger.error('❌ Failed to apply strategic reasoning:', error);
      throw error;
    }
  }

  async generateInsights(strategicAnalysis, context) {
    logger.info('💡 Generating actionable insights...');
    
    try {
      const insightsPrompt = `
Based on the strategic analysis:
${JSON.stringify(strategicAnalysis, null, 2)}

Generate actionable insights including:
1. Immediate actions (this week)
2. Short-term initiatives (next month)
3. Long-term strategies (next quarter)
4. Key performance indicators
5. Resource allocation recommendations
6. Success criteria
`;

      const insightsResponse = await this.chatModel.predict(insightsPrompt);
      
      return {
        immediate: this.extractImmediateActions(insightsResponse),
        shortTerm: this.extractShortTermInitiatives(insightsResponse),
        longTerm: this.extractLongTermStrategies(insightsResponse),
        kpis: this.extractKPIs(insightsResponse),
        resources: this.extractResourceAllocation(insightsResponse)
      };
      
    } catch (error) {
      logger.error('❌ Failed to generate insights:', error);
      throw error;
    }
  }

  assessGoalAlignment(analysis) {
    const goals = this.strategicContext.businessGoals;
    const alignment = {};
    
    goals.forEach(goal => {
      const relevance = this.calculateRelevance(analysis, goal.goal);
      alignment[goal.goal] = {
        relevance: relevance,
        impact: relevance > 0.7 ? 'high' : relevance > 0.4 ? 'medium' : 'low'
      };
    });
    
    return alignment;
  }

  identifyRisks(analysis) {
    const riskKeywords = ['risk', 'danger', 'threat', 'vulnerability', 'challenge'];
    const risks = [];
    
    riskKeywords.forEach(keyword => {
      if (analysis.toLowerCase().includes(keyword)) {
        risks.push({
          type: keyword,
          description: 'Identified in analysis',
          severity: 'medium'
        });
      }
    });
    
    return risks;
  }

  identifyOpportunities(analysis) {
    const opportunityKeywords = ['opportunity', 'potential', 'benefit', 'advantage', 'improvement'];
    const opportunities = [];
    
    opportunityKeywords.forEach(keyword => {
      if (analysis.toLowerCase().includes(keyword)) {
        opportunities.push({
          type: keyword,
          description: 'Identified in analysis',
          potential: 'medium'
        });
      }
    });
    
    return opportunities;
  }

  calculateRelevance(analysis, goal) {
    const analysisWords = analysis.toLowerCase().split(' ');
    const goalWords = goal.toLowerCase().split(' ');
    
    let matches = 0;
    goalWords.forEach(word => {
      if (analysisWords.includes(word)) {
        matches++;
      }
    });
    
    return matches / goalWords.length;
  }

  extractImmediateActions(insights) {
    // Extract immediate actions from insights
    const actions = [];
    const lines = insights.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('immediate') || line.toLowerCase().includes('this week')) {
        actions.push(line.trim());
      }
    });
    
    return actions;
  }

  extractShortTermInitiatives(insights) {
    const initiatives = [];
    const lines = insights.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('short-term') || line.toLowerCase().includes('next month')) {
        initiatives.push(line.trim());
      }
    });
    
    return initiatives;
  }

  extractLongTermStrategies(insights) {
    const strategies = [];
    const lines = insights.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('long-term') || line.toLowerCase().includes('next quarter')) {
        strategies.push(line.trim());
      }
    });
    
    return strategies;
  }

  extractKPIs(insights) {
    const kpis = [];
    const lines = insights.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('kpi') || line.toLowerCase().includes('metric')) {
        kpis.push(line.trim());
      }
    });
    
    return kpis;
  }

  extractResourceAllocation(insights) {
    const resources = [];
    const lines = insights.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('resource') || line.toLowerCase().includes('budget') || line.toLowerCase().includes('allocation')) {
        resources.push(line.trim());
      }
    });
    
    return resources;
  }

  calculateConfidence(ragResponse, strategicAnalysis) {
    // Calculate confidence based on response quality and strategic alignment
    let confidence = 0.5; // Base confidence
    
    // Factor in response length and quality
    if (ragResponse.text.length > 200) confidence += 0.2;
    if (strategicAnalysis.reasoning.length > 100) confidence += 0.2;
    
    // Factor in strategic alignment
    const alignment = strategicAnalysis.alignment;
    const highAlignmentCount = Object.values(alignment)
      .filter(a => a.impact === 'high').length;
    
    confidence += (highAlignmentCount / Object.keys(alignment).length) * 0.1;
    
    return Math.min(confidence, 1.0);
  }

  async getAgentCapabilities() {
    return {
      capabilities: this.agentCapabilities,
      strategicContext: this.strategicContext,
      models: {
        gemini: 'Available',
        openai: 'Available',
        embeddings: 'Available'
      }
    };
  }

  async updateStrategicContext(newContext) {
    this.strategicContext = { ...this.strategicContext, ...newContext };
    await this.cache.set('strategic_context', this.strategicContext);
    logger.info('✅ Strategic context updated');
  }

  async stop() {
    logger.info('🛑 Stopping AI Agent Service...');
    // Cleanup resources if needed
  }
} 