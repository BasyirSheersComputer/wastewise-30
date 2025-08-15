# WasteWise CSV Template Instructions

## Overview
This document provides detailed instructions for using the WasteWise CSV templates to upload your business data. The templates are designed to help you quickly import your existing data into the WasteWise system for immediate analysis and insights.

## Available Templates

### 1. Inventory Template (inventory_template.csv)
**Purpose**: Track your current inventory levels, costs, and supplier information.

**Required Fields**:
- `item_name` (string): Name of the inventory item
- `category` (string): Item category (e.g., Ingredients, Equipment, Supplies)
- `current_stock` (number): Current quantity in stock
- `unit_cost` (decimal): Cost per unit
- `supplier_name` (string): Name of the supplier
- `expiry_date` (date): Expiration date (YYYY-MM-DD format)
- `reorder_point` (number): Minimum stock level before reordering

**Optional Fields**:
- `description` (string): Detailed description of the item
- `sku` (string): Stock Keeping Unit code
- `unit_measure` (string): Unit of measurement (kg, L, pieces, etc.)
- `location` (string): Storage location

**Data Format Examples**:
```csv
item_name,category,current_stock,unit_cost,supplier_name,expiry_date,reorder_point
Coffee Beans,Ingredients,50.5,12.50,ABC Coffee Supply,2024-12-31,20.0
Milk,Ingredients,25.0,3.20,Dairy Fresh Co,2024-01-15,10.0
```

### 2. Sales Data Template (sales_template.csv)
**Purpose**: Track daily sales transactions and revenue.

**Required Fields**:
- `date` (date): Transaction date (YYYY-MM-DD format)
- `item_name` (string): Name of the sold item
- `quantity_sold` (number): Quantity sold
- `unit_price` (decimal): Price per unit
- `total_revenue` (decimal): Total revenue for the transaction

**Optional Fields**:
- `location` (string): Sales location/store
- `staff_member` (string): Staff member who made the sale
- `customer_type` (string): Type of customer (Regular, Premium, etc.)
- `payment_method` (string): Payment method used

**Data Format Examples**:
```csv
date,item_name,quantity_sold,unit_price,total_revenue
2024-01-15,Latte,45,4.50,202.50
2024-01-15,Cappuccino,32,4.00,128.00
```

### 3. Waste Tracking Template (waste_template.csv)
**Purpose**: Monitor waste generation and associated costs.

**Required Fields**:
- `date` (date): Waste tracking date (YYYY-MM-DD format)
- `waste_type` (string): Type of waste (Food Waste - Prepared, Food Waste - Raw, Packaging Waste, Beverage Waste, Other Operational)
- `quantity_wasted` (number): Quantity of waste
- `unit_cost` (decimal): Cost per unit of wasted item
- `total_cost` (decimal): Total cost of waste

**Optional Fields**:
- `reason_code` (string): Reason for waste (Overproduction, Expired, Quality Issue, Spilled, etc.)
- `staff_member` (string): Staff member responsible
- `location` (string): Location where waste occurred
- `notes` (string): Additional notes about the waste

**Data Format Examples**:
```csv
date,waste_type,quantity_wasted,unit_cost,total_cost
2024-01-15,Food Waste - Prepared,2.5,4.50,11.25
2024-01-15,Food Waste - Raw,0.5,12.50,6.25
```

### 4. Supplier Data Template (supplier_template.csv)
**Purpose**: Manage supplier information and relationships.

**Required Fields**:
- `supplier_name` (string): Name of the supplier
- `contact_person` (string): Primary contact person
- `email` (string): Contact email address
- `phone` (string): Contact phone number
- `address` (string): Supplier address

**Optional Fields**:
- `payment_terms` (string): Payment terms (Net 30, Net 15, etc.)
- `delivery_schedule` (string): Delivery schedule
- `rating` (number): Supplier rating (1-5 scale)
- `notes` (string): Additional notes about the supplier

**Data Format Examples**:
```csv
supplier_name,contact_person,email,phone,address
ABC Coffee Supply,David Wilson,david@abccoffee.com,+1-555-0101,123 Coffee St
Dairy Fresh Co,Jane Smith,jane@dairyfresh.com,+1-555-0102,456 Milk Ave
```

## Data Format Guidelines

### Date Format
- Use YYYY-MM-DD format for all dates
- Example: 2024-01-15 for January 15, 2024

### Number Format
- Use decimal point (.) for decimal numbers
- Do not use commas for thousands separators
- Example: 1234.56 (not 1,234.56)

### Text Fields
- Use plain text without special formatting
- Avoid using commas within text fields (use semicolons if needed)
- Keep descriptions concise but informative

### Currency
- Enter amounts without currency symbols
- Use decimal point for cents
- Example: 12.50 (not $12.50 or $12,50)

## Validation Rules

### Inventory Template
- `current_stock` must be a positive number
- `unit_cost` must be a positive number
- `expiry_date` must be a valid date
- `reorder_point` must be a positive number

### Sales Data Template
- `quantity_sold` must be a positive number
- `unit_price` must be a positive number
- `total_revenue` must equal quantity_sold × unit_price
- `date` must be a valid date

### Waste Tracking Template
- `quantity_wasted` must be a positive number
- `unit_cost` must be a positive number
- `total_cost` must equal quantity_wasted × unit_cost
- `date` must be a valid date

### Supplier Template
- `email` must be a valid email format
- `rating` must be between 1 and 5 (if provided)

## Common Errors to Avoid

1. **Missing Required Fields**: Ensure all required fields are filled
2. **Incorrect Date Format**: Use YYYY-MM-DD format only
3. **Invalid Numbers**: Use decimal points, not commas
4. **Empty Rows**: Remove any completely empty rows
5. **Special Characters**: Avoid special characters in text fields
6. **Currency Symbols**: Do not include $, €, £ symbols in amounts
7. **Commas in Text**: Avoid commas within text fields

## Upload Process

1. **Download Template**: Click the download button for the template you need
2. **Fill Data**: Open the CSV file in Excel, Google Sheets, or any spreadsheet application
3. **Validate Data**: Check that all required fields are filled and data formats are correct
4. **Save File**: Save the file as CSV format
5. **Upload**: Use the upload interface to import your data
6. **Review**: Check the data preview before confirming the import

## Data Processing

Once uploaded, your data will be:
- **Validated**: Checked for format and completeness
- **Cleaned**: Duplicates removed, missing values handled
- **Analyzed**: Processed through AI algorithms for insights
- **Displayed**: Available immediately on your dashboard

## Support

If you encounter any issues with the templates or data upload:
1. Check this instruction document
2. Review the validation rules
3. Contact support through the Issue Reporting system
4. Use the sample data as a reference

## Sample Data

Each template includes sample data to help you understand the expected format. You can:
- Use the sample data as a starting point
- Modify the sample data with your actual information
- Delete sample rows and add your own data
- Keep the header row and replace data rows

## Best Practices

1. **Start Small**: Begin with a small dataset to test the process
2. **Backup Data**: Keep a backup of your original data
3. **Regular Updates**: Upload data regularly for accurate insights
4. **Consistent Formatting**: Use consistent naming and formatting
5. **Review Results**: Check the processed data for accuracy

## Next Steps

After successful data upload:
1. Review your dashboard for immediate insights
2. Check AI-generated recommendations
3. Explore different analytics views
4. Set up automated data connections if available
5. Configure alerts and notifications

---

**Note**: These templates are designed to work with the WasteWise system. For optimal results, ensure your data follows the specified formats and validation rules.
