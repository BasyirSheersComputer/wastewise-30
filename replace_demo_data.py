#!/usr/bin/env python3
"""
Script to replace demo data with realistic Kaggle-style data
"""

import shutil
from pathlib import Path

def replace_demo_data():
    """Replace demo data files with new realistic data"""
    
    print("🔄 Replacing demo data with realistic data...")
    
    # Source and destination paths
    kaggle_dir = Path("datasets/kaggle")
    datasets_dir = Path("datasets")
    
    # File mappings: source -> destination
    file_mappings = [
        # Coffee shop sales data
        (kaggle_dir / "coffee-shop-sales/sales_data.csv", datasets_dir / "coffee_shop_revenue.csv"),
        (kaggle_dir / "coffee-shop-sales/customer_data.csv", datasets_dir / "customer.csv"),
        (kaggle_dir / "coffee-shop-sales/product_data.csv", datasets_dir / "product.csv"),
        
        # Food waste management
        (kaggle_dir / "food-waste-management/waste_logs.csv", datasets_dir / "waste_data.csv"),
        (kaggle_dir / "food-waste-management/inventory_data.csv", datasets_dir / "inventory.csv"),
        
        # Restaurant POS data
        (kaggle_dir / "restaurant-pos-data/transactions.csv", datasets_dir / "sales_transactions.csv"),
        (kaggle_dir / "restaurant-pos-data/daily_sales.csv", datasets_dir / "daily_sales.csv"),
        
        # Coffee chain data
        (kaggle_dir / "coffee-chain-sales/outlet_data.csv", datasets_dir / "outlet_data.csv"),
        (kaggle_dir / "coffee-chain-sales/chain_sales.csv", datasets_dir / "chain_sales.csv"),
        
        # Restaurant sales data
        (kaggle_dir / "restaurant-sales-data/menu_items.csv", datasets_dir / "menu_items.csv"),
        (kaggle_dir / "restaurant-sales-data/sales_summary.csv", datasets_dir / "sales_summary.csv"),
    ]
    
    successful_replacements = []
    failed_replacements = []
    
    for source, destination in file_mappings:
        try:
            if source.exists():
                # Create backup of existing file if it exists
                if destination.exists():
                    backup_path = destination.with_suffix(destination.suffix + '.backup')
                    shutil.copy2(destination, backup_path)
                    print(f"   📋 Backed up {destination.name} to {backup_path.name}")
                
                # Copy new file
                shutil.copy2(source, destination)
                print(f"   ✅ Replaced {destination.name}")
                successful_replacements.append(destination.name)
            else:
                print(f"   ❌ Source file not found: {source}")
                failed_replacements.append(source.name)
        except Exception as e:
            print(f"   ❌ Failed to replace {destination.name}: {e}")
            failed_replacements.append(destination.name)
    
    print(f"\n📊 Replacement Summary:")
    print(f"   ✅ Successful: {len(successful_replacements)}")
    print(f"   ❌ Failed: {len(failed_replacements)}")
    
    if successful_replacements:
        print(f"\n✅ Successfully replaced files:")
        for file in successful_replacements:
            print(f"   - {file}")
    
    if failed_replacements:
        print(f"\n❌ Failed to replace files:")
        for file in failed_replacements:
            print(f"   - {file}")
    
    return len(failed_replacements) == 0

def create_data_summary():
    """Create a summary of the new data structure"""
    
    summary_content = """# Updated Data Structure Summary

## Replaced Demo Data Files

### Sales Data
- **coffee_shop_revenue.csv**: Transaction-level sales data with customer and product information
- **sales_transactions.csv**: Detailed POS transaction records with payment methods
- **daily_sales.csv**: Daily sales summaries with revenue breakdown
- **sales_summary.csv**: Restaurant sales performance data

### Customer Data
- **customer.csv**: Customer profiles with visit history, preferences, and spending patterns

### Product Data
- **product.csv**: Product catalog with pricing, costs, and inventory information
- **menu_items.csv**: Menu items with popularity scores and preparation times

### Waste Management
- **waste_data.csv**: Detailed waste tracking with reasons, costs, and categories
- **inventory.csv**: Current inventory levels and stock management data

### Operational Data
- **outlet_data.csv**: Outlet information including locations, managers, and capacity
- **chain_sales.csv**: Multi-outlet sales performance and comparison data

## Data Quality Improvements

### Realistic Data Patterns
- **Transaction IDs**: Properly formatted with consistent naming
- **Date Formats**: ISO standard dates (YYYY-MM-DD) throughout
- **Customer IDs**: Consistent customer identification system
- **Product Categories**: Standardized coffee shop categories
- **Pricing**: Realistic pricing with proper profit margins

### Enhanced Relationships
- **Foreign Keys**: Proper relationships between customers, products, and outlets
- **Data Consistency**: Consistent naming conventions and data types
- **Temporal Data**: Realistic date ranges and time sequences

### Business Logic
- **Profit Margins**: Realistic profit margins for coffee shop items
- **Waste Reasons**: Common waste reasons in food service industry
- **Customer Behavior**: Realistic visit patterns and spending habits
- **Inventory Management**: Proper stock levels and reorder points

## Integration Benefits

1. **Better Analytics**: More realistic data for testing analytics features
2. **Improved Testing**: Better test coverage with realistic scenarios
3. **Demo Quality**: More convincing demonstrations for potential clients
4. **Development**: Better development experience with realistic data
5. **Training**: Better training data for AI/ML models

## Next Steps

1. **Database Population**: Update population scripts to use new data
2. **Frontend Updates**: Update UI components with new data structure
3. **API Testing**: Test all API endpoints with new data
4. **Analytics Validation**: Verify analytics calculations with new data
5. **Performance Testing**: Test application performance with larger datasets
"""
    
    with open("datasets/DATA_UPDATE_SUMMARY.md", "w") as f:
        f.write(summary_content)
    
    print("✅ Created data update summary")

def main():
    """Main function"""
    print("🚀 Starting demo data replacement process")
    print("=" * 50)
    
    # Replace demo data
    success = replace_demo_data()
    
    if success:
        # Create summary
        create_data_summary()
        
        print("\n🎉 Demo data replacement completed successfully!")
        print("\n📁 Updated files are in: datasets/")
        print("📖 Summary: datasets/DATA_UPDATE_SUMMARY.md")
        print("📋 Integration guide: datasets/kaggle/INTEGRATION_GUIDE.md")
        
        print("\n🔄 Next steps:")
        print("1. Update database population scripts")
        print("2. Update frontend components")
        print("3. Test the application with new data")
        print("4. Verify analytics and reporting")
        
    else:
        print("\n❌ Demo data replacement had some issues")
        print("Please check the error messages above and retry")
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
