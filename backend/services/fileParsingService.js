// fileParsingService.js - Parse CSV and PDF files for AI processing
import csv from 'csv-parser';
import { Readable } from 'stream';
import logger from '../utils/logger.js';
import aiAgentService from './aiAgentService.js';

/**
 * File Parsing Service
 * Handles CSV and PDF parsing with AI-powered analysis
 */
class FileParsingService {
  /**
   * Parse CSV file from buffer or text
   */
  async parseCSV(fileBuffer, options = {}) {
    try {
      const results = [];
      const stream = Readable.from(fileBuffer.toString());

      return new Promise((resolve, reject) => {
        stream
          .pipe(csv(options))
          .on('data', (data) => results.push(data))
          .on('end', () => {
            logger.info(`CSV parsed successfully: ${results.length} rows`);
            resolve(results);
          })
          .on('error', (error) => {
            logger.error('CSV parsing error', { error: error.message });
            reject(error);
          });
      });
    } catch (error) {
      logger.error('CSV parsing failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Parse PDF file (text extraction)
   * Note: For full PDF parsing, you may want to add pdf-parse npm package
   */
  async parsePDF(fileBuffer) {
    try {
      // For now, convert buffer to text (basic extraction)
      // TODO: Install pdf-parse for proper PDF extraction
      const text = fileBuffer.toString('utf-8');
      
      logger.info(`PDF parsed: ${text.length} characters`);
      
      return {
        text,
        length: text.length,
        pages: Math.ceil(text.length / 3000) // Estimate pages
      };
    } catch (error) {
      logger.error('PDF parsing failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Parse and analyze file with AI
   */
  async parseAndAnalyze(fileBuffer, fileType, feature, userId) {
    try {
      let parsedData;

      // Parse based on file type
      if (fileType === 'csv' || fileType === 'text/csv') {
        parsedData = await this.parseCSV(fileBuffer);
      } else if (fileType === 'pdf' || fileType === 'application/pdf') {
        parsedData = await this.parsePDF(fileBuffer);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Analyze with AI
      const analysis = await aiAgentService.processUploadedFile(
        feature,
        parsedData,
        fileType,
        userId
      );

      // Store parsed data in database for future reference
      if (feature === 'waste' && Array.isArray(parsedData)) {
        await this.storeWasteData(parsedData, userId, analysis);
      } else if (feature === 'inventory' && Array.isArray(parsedData)) {
        await this.storeInventoryData(parsedData, userId, analysis);
      } else if (feature === 'suppliers' && Array.isArray(parsedData)) {
        await this.storeSupplierData(parsedData, userId, analysis);
      }

      return {
        success: true,
        parsedData,
        analysis: analysis.analysis,
        recordCount: Array.isArray(parsedData) ? parsedData.length : 1,
        feature,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Parse and analyze failed', { fileType, feature, error: error.message });
      throw error;
    }
  }

  /**
   * Validate CSV structure for specific feature
   */
  validateCSVStructure(data, feature) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('CSV file is empty or invalid');
    }

    const expectedColumns = {
      waste: ['date', 'item', 'quantity', 'cost'],
      inventory: ['item_name', 'category', 'quantity', 'unit', 'cost_per_unit'],
      suppliers: ['supplier_name', 'contact', 'email', 'phone'],
      forecast: ['date', 'item', 'sales_quantity', 'revenue']
    };

    const required = expectedColumns[feature];
    if (!required) return true; // No validation for unknown features

    const columns = Object.keys(data[0]);
    const missing = required.filter(col => !columns.includes(col));

    if (missing.length > 0) {
      logger.warn(`CSV missing expected columns for ${feature}`, { missing });
      // Don't throw error, just warn - AI can still extract useful info
    }

    return true;
  }

  /**
   * Store waste data from CSV upload
   */
  async storeWasteData(data, userId, analysis) {
    // Implementation depends on your database schema
    // This is a placeholder for the logic
    logger.info(`Storing ${data.length} waste records for user ${userId}`);
    
    // TODO: Insert into waste_logs table
    // await supabase.from('waste_logs').insert(processedData);
  }

  /**
   * Store inventory data from CSV upload
   */
  async storeInventoryData(data, userId, analysis) {
    logger.info(`Storing ${data.length} inventory records for user ${userId}`);
    
    // TODO: Insert into inventory table
    // await supabase.from('inventory').upsert(processedData);
  }

  /**
   * Store supplier data from CSV upload
   */
  async storeSupplierData(data, userId, analysis) {
    logger.info(`Storing ${data.length} supplier records for user ${userId}`);
    
    // TODO: Insert into suppliers table
    // await supabase.from('suppliers').upsert(processedData);
  }

  /**
   * Extract structured data from unstructured text (using AI)
   */
  async extractStructuredData(text, feature, userId) {
    try {
      const systemPrompt = aiAgentService.getFeatureSystemPrompt(feature, { userId });

      const extractionPrompt = `${systemPrompt}

TASK: Extract structured data from the following text and convert it to the appropriate format.

TEXT:
${text}

OUTPUT: JSON array with relevant fields for ${feature} data.
For example, if this is waste data, extract: item name, quantity, cost, date, category.
Ensure all monetary values are in Malaysian Ringgit (RM).
`;

      const response = await askGemini(extractionPrompt);
      const structured = aiAgentService.parseJSONResponse(response);

      return {
        success: true,
        data: structured,
        source: 'ai_extraction',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Structured data extraction failed', { error: error.message });
      throw error;
    }
  }
}

export default new FileParsingService();

