# Integration Testing Guide

## Overview
This guide explains how to test integrations with external systems (POS, ERP, CRM, WFM) using mock simulators that replicate Zus Coffee data patterns.

## Supported Integrations

### 1. StoreHub (POS)
- **Purpose**: Sales and inventory data synchronization
- **Data Types**: Sales transactions, inventory levels
- **Mock Simulator**: `MockStoreHubSimulator`

### 2. ERP Systems
- **Purpose**: Purchase orders, supplier management, inventory
- **Data Types**: Purchase orders, suppliers, inventory levels
- **Mock Simulator**: `MockERPSimulator`

### 3. Klaviyo (CRM)
- **Purpose**: Customer data, segments, loyalty metrics
- **Data Types**: Customers, segments, spending behavior, loyalty
- **Mock Simulator**: `MockKlaviyoSimulator`

### 4. Lark (WFM)
- **Purpose**: Staff scheduling, attendance, performance
- **Data Types**: Staff roster, schedules, attendance, performance
- **Mock Simulator**: `MockLarkSimulator`

## API Endpoints

### Initialize Integration
```http
POST /api/integration-test/:integrationType/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "storeId": "zus_pavilion_kl",
  "apiKey": "test_key"
}
```

### Sync Data
```http
POST /api/integration-test/:integrationType/sync/:dataType
Authorization: Bearer <token>
Content-Type: application/json

{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-07T23:59:59Z",
  "outletId": "outlet_001"
}
```

**Example Sync Endpoints:**
- `POST /api/integration-test/storehub/sync/sales`
- `POST /api/integration-test/storehub/sync/inventory`
- `POST /api/integration-test/erp/sync/purchase_orders`
- `POST /api/integration-test/klaviyo/sync/customers`
- `POST /api/integration-test/lark/sync/staff`

### Run Full Test
```http
POST /api/integration-test/:integrationType/test
Authorization: Bearer <token>
```

### Get Integration Status
```http
GET /api/integration-test/:integrationType/status
Authorization: Bearer <token>
```

### Get Sync Logs
```http
GET /api/integration-test/logs?limit=50&integrationType=storehub
Authorization: Bearer <token>
```

### Get Test Results
```http
GET /api/integration-test/test-results?limit=20&integrationType=storehub
Authorization: Bearer <token>
```

## Testing with Script

Run the comprehensive test script:

```bash
node backend/test-integrations.js
```

This will:
1. Initialize all integrations
2. Sync data from each system
3. Store data in database
4. Report test results

## Database Schema

### Integration Tables
- `integrations` - Integration configurations
- `integration_sync_logs` - Sync history
- `integration_test_results` - Test results
- `inventory_data` - Synced inventory
- `staff_schedules` - Synced schedules
- `staff_attendance` - Synced attendance

### Running Migrations

```sql
-- Run integration test tables migration
\i backend/database/migrations/create_integration_test_tables.sql
```

## Mock Data Patterns

### StoreHub (POS)
- **Peak Hours**: 7-9am, 12-2pm, 5-7pm
- **Transaction Volume**: 10-25 transactions/hour (peak), 3-11 (off-peak)
- **Products**: Coffee beverages, pastries, tea
- **Payment Methods**: Cash, Card, Touch 'n Go, GrabPay, Boost

### ERP
- **Purchase Orders**: 1-3 POs per day
- **Suppliers**: Coffee importers, dairy suppliers, bakery ingredients
- **Lead Times**: 3-7 days
- **Payment Terms**: Net 15-30

### Klaviyo (CRM)
- **Customer Segments**: VIP, Regular, Occasional, New, At Risk
- **Order Frequency**: 2-10 orders/month
- **Average Order Value**: RM 15-45
- **Loyalty Tiers**: Bronze, Silver, Gold, Platinum

### Lark (WFM)
- **Shift Types**: Morning (6-14h), Afternoon (13-21h), Evening (16-22h)
- **Staff Positions**: Barista, Cashier, Manager
- **Attendance Rate**: 85-100%
- **On-Time Rate**: 80-100%

## Integration Manager

The `IntegrationManager` routes requests to mock simulators (for testing) or real services (for production).

```javascript
import IntegrationManager from './services/integrationManager.js';

// Use mock simulators
const manager = new IntegrationManager({ useMock: true });

// Initialize integration
await manager.initializeIntegration(userId, 'storehub', credentials);

// Sync data
const result = await manager.syncData(userId, 'storehub', 'sales', options);

// Store synced data
await manager.storeSyncedData(userId, 'storehub', 'sales', result);
```

## Testing Checklist

- [ ] Initialize StoreHub integration
- [ ] Sync sales data (7 days)
- [ ] Sync inventory data
- [ ] Initialize ERP integration
- [ ] Sync purchase orders (30 days)
- [ ] Sync suppliers
- [ ] Initialize Klaviyo integration
- [ ] Sync customers (100 records)
- [ ] Sync segments
- [ ] Initialize Lark integration
- [ ] Sync staff roster
- [ ] Sync schedules (7 days)
- [ ] Sync attendance (7 days)
- [ ] Verify data in database
- [ ] Check sync logs
- [ ] Review test results

## Troubleshooting

### Sync Fails
- Check integration status: `GET /api/integration-test/:type/status`
- Review sync logs: `GET /api/integration-test/logs`
- Verify database connection
- Check RLS policies

### No Data Synced
- Verify date ranges in sync options
- Check mock simulator configuration
- Review error messages in sync logs

### Database Errors
- Ensure migrations are run
- Check RLS policies for user
- Verify table schemas match

## Production Migration

To switch from mock to real integrations:

```javascript
// In IntegrationManager
const manager = new IntegrationManager({ useMock: false });
```

Update integration credentials in the `integrations` table with real API keys and tokens.

## Related Documentation
- [StoreHub Integration Guide](./STOREHUB_INTEGRATION_GUIDE.md)
- [AI-UFE Implementation](../ai/AI_UFE_IMPLEMENTATION.md)
- [Database Schema](../../backend/database/schema.sql)

