import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataLoader {
  constructor() {
    this.datasetsPath = path.join(__dirname, '../../datasets');
    this.cache = new Map();
  }

  /**
   * Load and parse CSV file
   */
  loadCSV(filename) {
    try {
      const filePath = path.join(this.datasetsPath, filename);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filename}`);
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error(`Empty file: ${filename}`);
      }

      // Parse header
      const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      // Parse data rows
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const row = {};
        header.forEach((key, index) => {
          row[key] = values[index] || '';
        });
        return row;
      });

      logger.info(`Loaded ${data.length} records from ${filename}`);
      return { header, data };
    } catch (error) {
      logger.error(`Error loading CSV ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Get sales data for demand forecasting
   */
  getSalesData() {
    try {
      const salesData = this.loadCSV('coffee_shop_revenue.csv');
      
      // Transform sales data for forecasting
      const transformedData = salesData.data.map(row => ({
        date: row.date,
        time: row.time,
        productId: row.product_name, // Use product name instead of ID
        quantity: parseInt(row.quantity) || 0,
        amount: parseFloat(row.total_amount) || 0,
        outletId: row.outlet_id,
        customerId: row.customer_id
      }));

      // Group by date and product for daily demand
      const dailyDemand = {};
      transformedData.forEach(row => {
        const key = `${row.date}_${row.productId}`;
        if (!dailyDemand[key]) {
          dailyDemand[key] = {
            date: row.date,
            productId: row.productId,
            quantity: 0,
            revenue: 0
          };
        }
        dailyDemand[key].quantity += row.quantity;
        dailyDemand[key].revenue += row.amount;
      });

      return Object.values(dailyDemand);
    } catch (error) {
      logger.error('Error processing sales data:', error.message);
      return [];
    }
  }

  /**
   * Get product data for inventory optimization
   */
  getProductData() {
    try {
      const productData = this.loadCSV('product.csv');
      
      return productData.data.map(row => ({
        id: row.product_id,
        name: row.product_name,
        category: row.category,
        type: row.category,
        wholesalePrice: parseFloat(row.base_cost) || 0,
        retailPrice: parseFloat(row.selling_price) || 0,
        unit: 'unit',
        isPromo: false,
        isNew: false
      }));
    } catch (error) {
      logger.error('Error processing product data:', error.message);
      return [];
    }
  }

  /**
   * Get customer data for segmentation
   */
  getCustomerData() {
    try {
      const customerData = this.loadCSV('customer.csv');
      
      return customerData.data.map(row => ({
        id: parseInt(row.customer_id),
        name: row['customer_first-name'],
        email: row.customer_email,
        homeStore: parseInt(row.home_store),
        customerSince: row.customer_since,
        loyaltyCard: row.loyalty_card_number,
        birthdate: row.birthdate,
        gender: row.gender,
        birthYear: parseInt(row.birth_year)
      }));
    } catch (error) {
      logger.error('Error processing customer data:', error.message);
      return [];
    }
  }

  /**
   * Get outlet data
   */
  getOutletData() {
    try {
      const outletData = this.loadCSV('sales_outlet.csv');
      
      return outletData.data.map(row => ({
        id: parseInt(row.sales_outlet_id),
        type: row.sales_outlet_type,
        squareFeet: parseInt(row.store_square_feet),
        address: row.store_address,
        city: row.store_city,
        state: row.store_state_province,
        phone: row.store_telephone,
        postalCode: row.store_postal_code,
        longitude: parseFloat(row.store_longitude),
        latitude: parseFloat(row.store_latitude),
        manager: parseInt(row.manager) || null,
        neighborhood: row.Neighorhood
      }));
    } catch (error) {
      logger.error('Error processing outlet data:', error.message);
      return [];
    }
  }

  /**
   * Get revenue data for trend analysis
   */
  getRevenueData() {
    try {
      const revenueData = this.loadCSV('coffee_shop_revenue.csv');
      
      return revenueData.data.map(row => ({
        customersPerDay: parseInt(row.Number_of_Customers_Per_Day),
        avgOrderValue: parseFloat(row.Average_Order_Value),
        operatingHours: parseInt(row.Operating_Hours_Per_Day),
        employees: parseInt(row.Number_of_Employees),
        marketingSpend: parseFloat(row.Marketing_Spend_Per_Day),
        footTraffic: parseInt(row.Location_Foot_Traffic),
        dailyRevenue: parseFloat(row.Daily_Revenue)
      }));
    } catch (error) {
      logger.error('Error processing revenue data:', error.message);
      return [];
    }
  }

  /**
   * Get comprehensive dataset for testing
   */
  getComprehensiveData() {
    try {
      const salesData = this.getSalesData();
      const productData = this.getProductData();
      const customerData = this.getCustomerData();
      const outletData = this.getOutletData();
      const revenueData = this.getRevenueData();

      return {
        sales: salesData,
        products: productData,
        customers: customerData,
        outlets: outletData,
        revenue: revenueData,
        summary: {
          totalSales: salesData.length,
          totalProducts: productData.length,
          totalCustomers: customerData.length,
          totalOutlets: outletData.length,
          totalRevenueRecords: revenueData.length
        }
      };
    } catch (error) {
      logger.error('Error loading comprehensive data:', error.message);
      return null;
    }
  }
}

export default new DataLoader();
