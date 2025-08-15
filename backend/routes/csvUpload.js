import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkg from 'pg';
import CSVProcessingService from '../services/csvProcessingService.js';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const csvProcessingService = new CSVProcessingService();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// CSV Template validation schemas
const csvSchemas = {
  inventory: {
    required: ['item_name', 'category', 'current_stock', 'unit_cost', 'supplier_name', 'expiry_date', 'reorder_point'],
    optional: ['description', 'sku', 'unit_measure', 'location'],
    types: {
      item_name: 'string',
      category: 'string',
      current_stock: 'number',
      unit_cost: 'number',
      supplier_name: 'string',
      expiry_date: 'date',
      reorder_point: 'number',
      description: 'string',
      sku: 'string',
      unit_measure: 'string',
      location: 'string'
    }
  },
  sales: {
    required: ['date', 'item_name', 'quantity_sold', 'unit_price', 'total_revenue'],
    optional: ['location', 'staff_member', 'customer_type', 'payment_method'],
    types: {
      date: 'date',
      item_name: 'string',
      quantity_sold: 'number',
      unit_price: 'number',
      total_revenue: 'number',
      location: 'string',
      staff_member: 'string',
      customer_type: 'string',
      payment_method: 'string'
    }
  },
  waste: {
    required: ['date', 'waste_type', 'quantity_wasted', 'unit_cost', 'total_cost'],
    optional: ['reason_code', 'staff_member', 'location', 'notes'],
    types: {
      date: 'date',
      waste_type: 'string',
      quantity_wasted: 'number',
      unit_cost: 'number',
      total_cost: 'number',
      reason_code: 'string',
      staff_member: 'string',
      location: 'string',
      notes: 'string'
    }
  },
  supplier: {
    required: ['supplier_name', 'contact_person', 'email', 'phone', 'address'],
    optional: ['payment_terms', 'delivery_schedule', 'rating', 'notes'],
    types: {
      supplier_name: 'string',
      contact_person: 'string',
      email: 'string',
      phone: 'string',
      address: 'string',
      payment_terms: 'string',
      delivery_schedule: 'string',
      rating: 'number',
      notes: 'string'
    }
  }
};

// Helper function to validate CSV data
function validateCSVData(data, schema) {
  const errors = [];
  const validatedData = [];

  data.forEach((row, index) => {
    const rowErrors = [];
    
    // Check required fields
    schema.required.forEach(field => {
      if (!row[field] || row[field].toString().trim() === '') {
        rowErrors.push(`Missing required field: ${field}`);
      }
    });

    // Validate data types
    Object.keys(schema.types).forEach(field => {
      if (row[field] && row[field].toString().trim() !== '') {
        const value = row[field];
        const expectedType = schema.types[field];

        switch (expectedType) {
          case 'number':
            if (isNaN(parseFloat(value))) {
              rowErrors.push(`Invalid number format for ${field}: ${value}`);
            }
            break;
          case 'date':
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              rowErrors.push(`Invalid date format for ${field}: ${value}`);
            }
            break;
          case 'string':
            // String validation passed
            break;
        }
      }
    });

    if (rowErrors.length > 0) {
      errors.push({
        row: index + 2, // +2 because index starts at 0 and we skip header
        errors: rowErrors
      });
    } else {
      validatedData.push(row);
    }
  });

  return { errors, validatedData };
}

// Helper function to process and insert data
async function processAndInsertData(data, type, userId, outletId = null) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    switch (type) {
      case 'inventory':
        for (const row of data) {
          await client.query(`
            INSERT INTO inventory_data (
              user_id, outlet_id, item_name, category, current_stock, 
              unit_cost, supplier_name, expiry_date, reorder_point, 
              description, sku, unit_measure, location, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
            ON CONFLICT (user_id, item_name) 
            DO UPDATE SET 
              current_stock = EXCLUDED.current_stock,
              unit_cost = EXCLUDED.unit_cost,
              expiry_date = EXCLUDED.expiry_date,
              reorder_point = EXCLUDED.reorder_point,
              updated_at = NOW()
          `, [
            userId, outletId, row.item_name, row.category, parseFloat(row.current_stock),
            parseFloat(row.unit_cost), row.supplier_name, new Date(row.expiry_date),
            parseFloat(row.reorder_point), row.description || null, row.sku || null,
            row.unit_measure || 'kg', row.location || null, 'active'
          ]);
        }
        break;

      case 'sales':
        for (const row of data) {
          await client.query(`
            INSERT INTO sales_pos_data (
              user_id, outlet_id, transaction_date, item_name, quantity_sold,
              unit_price, total_revenue, location, staff_member, customer_type,
              payment_method, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
          `, [
            userId, outletId, new Date(row.date), row.item_name, parseFloat(row.quantity_sold),
            parseFloat(row.unit_price), parseFloat(row.total_revenue), row.location || null,
            row.staff_member || null, row.customer_type || null, row.payment_method || null
          ]);
        }
        break;

      case 'waste':
        for (const row of data) {
          await client.query(`
            INSERT INTO waste_logs (
              user_id, outlet_id, waste_date, item_name, waste_type,
              quantity_wasted, unit_cost, total_cost, reason, recorded_by,
              location, notes, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
          `, [
            userId, outletId, new Date(row.date), row.waste_type, row.waste_type,
            parseFloat(row.quantity_wasted), parseFloat(row.unit_cost), parseFloat(row.total_cost),
            row.reason_code || null, row.staff_member || null, row.location || null, row.notes || null
          ]);
        }
        break;

      case 'supplier':
        for (const row of data) {
          await client.query(`
            INSERT INTO supplier_data (
              user_id, supplier_name, contact_person, email, phone,
              address, payment_terms, delivery_schedule, rating, notes,
              status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            ON CONFLICT (user_id, supplier_name) 
            DO UPDATE SET 
              contact_person = EXCLUDED.contact_person,
              email = EXCLUDED.email,
              phone = EXCLUDED.phone,
              address = EXCLUDED.address,
              updated_at = NOW()
          `, [
            userId, row.supplier_name, row.contact_person, row.email, row.phone,
            row.address, row.payment_terms || null, row.delivery_schedule || null,
            row.rating ? parseFloat(row.rating) : null, row.notes || null, 'active'
          ]);
        }
        break;
    }

    await client.query('COMMIT');
    return { success: true, message: `${data.length} records processed successfully` };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Route to upload CSV file
router.post('/upload/:type', upload.single('csvFile'), async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user?.id; // Assuming authentication middleware sets req.user

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    if (!csvSchemas[type]) {
      return res.status(400).json({ error: 'Invalid CSV type. Supported types: inventory, sales, waste, supplier' });
    }

    const schema = csvSchemas[type];
    const results = [];
    const errors = [];

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Validate CSV data
          const validation = validateCSVData(results, schema);
          
          if (validation.errors.length > 0) {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            
            return res.status(400).json({
              error: 'CSV validation failed',
              details: validation.errors,
              totalErrors: validation.errors.length
            });
          }

          // Process and insert data
          const result = await processAndInsertData(validation.validatedData, type, userId);
          
          // Generate AI insights and recommendations
          let processingResult = null;
          try {
            processingResult = await csvProcessingService.processUploadedData(
              userId, 
              type, 
              validation.validatedData.length
            );
          } catch (processingError) {
            console.error('Error processing data for insights:', processingError);
            // Don't fail the upload if processing fails
          }
          
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            success: true,
            message: result.message,
            processedRecords: validation.validatedData.length,
            totalRecords: results.length,
            insights: processingResult?.insights || null,
            processingMessage: processingResult?.message || null
          });

        } catch (error) {
          // Clean up uploaded file
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          
          console.error('Error processing CSV:', error);
          res.status(500).json({
            error: 'Error processing CSV file',
            details: error.message
          });
        }
      })
      .on('error', (error) => {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        console.error('Error reading CSV:', error);
        res.status(500).json({
          error: 'Error reading CSV file',
          details: error.message
        });
      });

  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route to get CSV templates
router.get('/templates/:type', (req, res) => {
  const { type } = req.params;
  
  if (!csvSchemas[type]) {
    return res.status(400).json({ error: 'Invalid template type' });
  }

  const schema = csvSchemas[type];
  const headers = [...schema.required, ...schema.optional];
  
  // Create sample data
  const sampleData = {
    inventory: [
      {
        item_name: 'Coffee Beans',
        category: 'Ingredients',
        current_stock: '50.5',
        unit_cost: '12.50',
        supplier_name: 'ABC Coffee Supply',
        expiry_date: '2024-12-31',
        reorder_point: '20.0',
        description: 'Premium Arabica coffee beans',
        sku: 'CB-001',
        unit_measure: 'kg',
        location: 'Main Storage'
      }
    ],
    sales: [
      {
        date: '2024-01-15',
        item_name: 'Latte',
        quantity_sold: '45',
        unit_price: '4.50',
        total_revenue: '202.50',
        location: 'Main Store',
        staff_member: 'John Smith',
        customer_type: 'Regular',
        payment_method: 'Credit Card'
      }
    ],
    waste: [
      {
        date: '2024-01-15',
        waste_type: 'Food Waste - Prepared',
        quantity_wasted: '2.5',
        unit_cost: '4.50',
        total_cost: '11.25',
        reason_code: 'Overproduction',
        staff_member: 'John Smith',
        location: 'Kitchen',
        notes: 'Excess latte milk'
      }
    ],
    supplier: [
      {
        supplier_name: 'ABC Coffee Supply',
        contact_person: 'David Wilson',
        email: 'david@abccoffee.com',
        phone: '+1-555-0101',
        address: '123 Coffee St',
        payment_terms: 'Net 30',
        delivery_schedule: 'Weekly - Monday',
        rating: '4.5',
        notes: 'Premium coffee supplier'
      }
    ]
  };

  res.json({
    type,
    headers,
    required: schema.required,
    optional: schema.optional,
    sampleData: sampleData[type] || []
  });
});

// Route to validate CSV data without uploading
router.post('/validate/:type', upload.single('csvFile'), async (req, res) => {
  try {
    const { type } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    if (!csvSchemas[type]) {
      return res.status(400).json({ error: 'Invalid CSV type' });
    }

    const schema = csvSchemas[type];
    const results = [];

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Validate CSV data
        const validation = validateCSVData(results, schema);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          valid: validation.errors.length === 0,
          totalRecords: results.length,
          validRecords: validation.validatedData.length,
          errors: validation.errors,
          errorCount: validation.errors.length
        });
      })
      .on('error', (error) => {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
          error: 'Error reading CSV file',
          details: error.message
        });
      });

  } catch (error) {
    console.error('CSV validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

export default router;
