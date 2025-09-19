# Realistic Data Integration Guide

This guide helps you integrate the realistic sample datasets into the WasteWise application.

## Created Datasets

### 1. Coffee Shop Sales Data (`coffee-shop-sales/`)
- **sales_data.csv**: Transaction-level sales data with customer and product information
- **customer_data.csv**: Customer profiles with visit history and preferences  
- **product_data.csv**: Product catalog with pricing and inventory information

### 2. Restaurant Sales Data (`restaurant-sales-data/`)
- **sales_summary.csv**: Daily sales summaries by outlet
- **menu_items.csv**: Menu catalog with pricing and popularity metrics

### 3. Food Waste Management (`food-waste-management/`)
- **waste_logs.csv**: Detailed waste tracking with reasons and costs
- **inventory_data.csv**: Current inventory levels and stock management

### 4. Restaurant POS Data (`restaurant-pos-data/`)
- **transactions.csv**: Detailed POS transaction records
- **daily_sales.csv**: Daily sales summaries with payment method breakdown

### 5. Coffee Chain Sales (`coffee-chain-sales/`)
- **chain_sales.csv**: Multi-outlet sales performance data
- **outlet_data.csv**: Outlet information and operational details

## Integration Steps

### Step 1: Backup Existing Data
```bash
# Backup current demo data
cp -r datasets datasets_backup_$(date +%Y%m%d)
```

### Step 2: Replace Demo Files
```bash
# Replace coffee shop revenue data
cp datasets/kaggle/coffee-shop-sales/sales_data.csv datasets/coffee_shop_revenue.csv

# Replace customer data
cp datasets/kaggle/coffee-shop-sales/customer_data.csv datasets/customer.csv

# Replace product data
cp datasets/kaggle/coffee-shop-sales/product_data.csv datasets/product.csv

# Replace waste data
cp datasets/kaggle/food-waste-management/waste_logs.csv datasets/waste_data.csv

# Replace inventory data
cp datasets/kaggle/food-waste-management/inventory_data.csv datasets/inventory.csv
```

### Step 3: Update Database Population Scripts

#### Update `backend/populate-coffee-industry.js`:
- Replace hardcoded demo data with CSV file reading
- Use the new realistic data structure
- Update data relationships and foreign keys

#### Update `backend/populate-malaysian-fnb.js`:
- Integrate Malaysian-specific data from the new datasets
- Update supplier and outlet information
- Use realistic waste and sales data

#### Update `backend/database/populate-database.js`:
- Modify to read from CSV files instead of hardcoded data
- Update data transformation logic
- Ensure proper data type handling

### Step 4: Update Frontend Components

#### Update `frontend/src/components/UI/DemandForecasting.tsx`:
- Replace hardcoded forecast data with realistic values
- Use actual product names and categories from the new data
- Update trend calculations based on real data patterns

#### Update `frontend/src/supabaseClient.ts`:
- Update mock data to reflect the new realistic data structure
- Ensure trial period information is consistent
- Update sample analytics data

### Step 5: Data Quality Checks

1. **Verify Data Completeness**:
   - Check for missing values in critical fields
   - Ensure date formats are consistent
   - Validate numeric data ranges

2. **Test Data Relationships**:
   - Verify foreign key relationships
   - Check data consistency across tables
   - Test data integrity constraints

3. **Performance Testing**:
   - Test data loading performance
   - Verify query execution times
   - Check memory usage with larger datasets

### Step 6: Application Testing

1. **Database Population**:
   ```bash
   cd backend
   node populate-coffee-industry.js
   node populate-malaysian-fnb.js
   node database/populate-database.js
   ```

2. **Frontend Testing**:
   - Test data visualization components
   - Verify analytics calculations
   - Check UI responsiveness with new data

3. **Integration Testing**:
   - Test end-to-end data flow
   - Verify API endpoints with new data
   - Check real-time data updates

## Data Schema Mapping

| New Dataset | Application Table | Key Fields |
|-------------|------------------|------------|
| sales_data.csv | sales_pos_data | transaction_id, date, product_name, total_amount |
| customer_data.csv | users | customer_id, name, email, total_visits |
| product_data.csv | inventory_data | product_id, product_name, cost, selling_price |
| waste_logs.csv | waste_data | waste_id, item_name, quantity, reason, cost |
| outlet_data.csv | outlets | outlet_id, outlet_name, location, manager_name |

## Troubleshooting

### Common Issues:
1. **Date Format Mismatches**: Ensure all dates are in ISO format (YYYY-MM-DD)
2. **Missing Foreign Keys**: Verify all referenced IDs exist in parent tables
3. **Data Type Conflicts**: Check numeric fields for proper formatting
4. **Encoding Issues**: Ensure UTF-8 encoding for text fields

### Validation Queries:
```sql
-- Check data completeness
SELECT COUNT(*) FROM sales_pos_data WHERE date IS NULL;
SELECT COUNT(*) FROM waste_data WHERE item_name IS NULL;

-- Verify relationships
SELECT COUNT(*) FROM sales_pos_data s 
LEFT JOIN outlets o ON s.outlet_id = o.id 
WHERE o.id IS NULL;

-- Check data ranges
SELECT MIN(date), MAX(date) FROM sales_pos_data;
SELECT MIN(total_amount), MAX(total_amount) FROM sales_pos_data;
```

## Next Steps

1. **Data Enrichment**: Consider adding more historical data
2. **Real-time Integration**: Set up automated data updates
3. **Analytics Enhancement**: Implement advanced analytics with the new data
4. **Performance Optimization**: Optimize queries for larger datasets
5. **Data Governance**: Implement data quality monitoring

## Support

For issues with data integration:
1. Check the application logs for errors
2. Verify database connection and permissions
3. Test individual components with sample data
4. Review data transformation logic
5. Consult the application documentation
