# Integration Systems Summary

## Overview
Complete mock integration systems have been built to simulate connections to POS (StoreHub), ERP, CRM (Klaviyo), and WFM (Lark) systems. These simulators generate realistic data based on Zus Coffee patterns for testing the WasteWise AI platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Integration Manager                        │
│  Routes requests to Mock Simulators (test) or Real APIs    │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │               │
┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐ ┌─────▼──────┐
│ StoreHub    │ │ ERP       │ │ Klaviyo     │ │ Lark      │
│ (POS)       │ │ (Orders)  │ │ (CRM)       │ │ (WFM)     │
│             │ │           │ │             │ │           │
│ - Sales     │ │ - POs     │ │ - Customers │ │ - Staff   │
│ - Inventory │ │ - Suppliers│ │ - Segments │ │ - Schedules│
│             │ │ - Inventory│ │ - Loyalty  │ │ - Attendance│
└─────────────┘ └───────────┘ └────────────┘ └───────────┘
```

## Files Created

### Mock Simulators
1. **`backend/services/mock/mockStoreHubSimulator.js`**
   - Simulates StoreHub POS system
   - Generates sales transactions with peak/off-peak patterns
   - Provides inventory data

2. **`backend/services/mock/mockERPSimulator.js`**
   - Simulates ERP system (NetSuite pattern)
   - Generates purchase orders, supplier data
   - Provides inventory levels from warehouse

3. **`backend/services/mock/mockKlaviyoSimulator.js`**
   - Simulates Klaviyo CRM
   - Generates customer profiles, segments
   - Provides loyalty metrics and spending behavior

4. **`backend/services/mock/mockLarkSimulator.js`**
   - Simulates Lark/Feishu WFM
   - Generates staff schedules, attendance
   - Provides performance metrics

### Core Services
5. **`backend/services/integrationManager.js`**
   - Manages all integrations
   - Routes to mock or real services
   - Handles data transformation and storage

### Routes
6. **`backend/routes/integrationTest.js`**
   - API endpoints for testing integrations
   - Initialize, sync, test endpoints
   - Logs and results endpoints

### Database
7. **`backend/database/migrations/create_integration_test_tables.sql`**
   - Creates tables for integration data
   - Sync logs, test results
   - Staff schedules, attendance

### Testing
8. **`backend/test-integrations.js`**
   - Comprehensive test script
   - Tests all integrations
   - Reports results

### Documentation
9. **`docs/integrations/INTEGRATION_TESTING_GUIDE.md`**
   - Complete testing guide
   - API reference
   - Troubleshooting

## Database Schema Updates

### New Tables
- `integration_sync_logs` - Track sync operations
- `integration_test_results` - Store test results
- `inventory_data` - Synced inventory (if not exists)
- `staff_schedules` - Synced schedules from WFM
- `staff_attendance` - Synced attendance records

### Enhanced Tables
- `integrations` - Already exists, used for configs
- `sales_pos_data` - Receives synced sales
- `customers` - Receives synced customer data
- `staff` - Receives synced staff data

## API Endpoints

Base URL: `/api/integration-test`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/:type/initialize` | POST | Initialize integration |
| `/:type/sync (:dataType)` | POST | Sync data from integration |
| `/:type/test` | POST | Run full integration test |
| `/:type/status` | GET | Get integration status |
| `/logs` | GET | Get sync logs |
| `/test-results` | GET | Get test results |

## Data Patterns

### StoreHub (POS)
- **Peak Hours**: 7-9am, 12-2pm, 5-7pm
- **Transactions**: 10-25/hour (peak), 3-11/hour (off-peak)
- **Products**: Coffee beverages, pastries, tea
- **Payment**: Cash, Card, Touch 'n Go, GrabPay, Boost

### ERP
- **POs**: 1-3 per day
- **Suppliers**: Coffee importers, dairy, bakery ingredients
- **Lead Times**: 3-7 days
- **Payment Terms**: Net 15-30

### Klaviyo (CRM)
- **Segments**: VIP, Regular, Occasional, New, At Risk
- **Frequency**: 2-10 orders/month
- **AOV**: RM 15-45
- **Tiers**: Bronze, Silver, Gold, Platinum

### Lark (WFM)
- **Shifts**: Morning (6-14h), Afternoon (13-21h), Evening (16-22h)
- **Positions**: Barista, Cashier, Manager
- **Attendance**: 85-100%
- **On-Time**: 80-100%

## Usage Example

```javascript
import IntegrationManager from './services/integrationManager.js';

const manager = new IntegrationManager({ useMock: true });

// Initialize StoreHub
await manager.initializeIntegration(userId, 'storehub', {
  storeId: 'zus_pavilion_kl',
  apiKey: 'test_key'
});

// Sync sales data
const sales = await manager.syncData(userId, 'storehub', 'sales', {
  startDate: '2024-01-01',
  endDate: '2024-01-07'
});

// Store in database
await manager.storeSyncedData(userId, 'storehub', 'sales', sales);
```

## Testing

```bash
# Run comprehensive tests
node backend/test-integrations.js

# Via API
POST /api/integration-test/storehub/test
POST /api/integration-test/erp/test
POST /api/integration-test/klaviyo/test
POST /api/integration-test/lark/test
```

## Integration with AI-UFE

These integrations feed data into the AI Unified Forecasting Engine:

- **StoreHub** → Sales data → Demand forecasting
- **ERP** → Inventory/POs → Supply chain optimization
- **Klaviyo** → Customer data → Customer insights
- **Lark** → Staff data → Labor scheduling optimization

## Next Steps

1. **Run Database Migrations**
   ```sql
   \i backend/database/migrations/create_integration_test_tables.sql
   ```

2. **Test Integrations**
   ```bash
   node backend/test-integrations.js
   ```

3. **Verify Data Storage**
   - Check `sales_pos_data` table
   - Check `inventory_data` table
   - Check `customers` table
   - Check `staff` table

4. **Review Sync Logs**
   ```http
   GET /api/integration-test/logs
   ```

5. **Production Migration**
   - Switch `useMock: false` in IntegrationManager
   - Update credentials in `integrations` table
   - Test with real APIs

## Related Files
- [Integration Testing Guide](./INTEGRATION_TESTING_GUIDE.md)
- [StoreHub Integration](./STOREHUB_INTEGRATION_GUIDE.md)
- [AI-UFE Implementation](../ai/AI_UFE_IMPLEMENTATION.md)

