# StoreHub Integration Guide
## WasteWise AI - POS Integration Implementation

**Document Type:** Integration Guide  
**Version:** 1.0  
**Date:** December 2024  
**Integration:** StoreHub POS System

---

## Overview

This guide documents the StoreHub POS integration for WasteWise AI, enabling automatic synchronization of sales and inventory data from StoreHub to WasteWise.

### Features

- ✅ **Sales Data Sync**: Automatic synchronization of transaction data
- ✅ **Inventory Sync**: Real-time inventory level updates
- ✅ **Webhook Support**: Real-time updates via webhooks
- ✅ **Authentication**: Secure API credential management
- ✅ **Error Handling**: Robust retry logic and error recovery

---

## Prerequisites

1. **StoreHub Account**: Active StoreHub POS account
2. **API Access**: StoreHub API credentials (Store ID, API Key, API Secret)
3. **WasteWise Account**: Active WasteWise subscription
4. **Network Access**: Access to StoreHub API endpoints

---

## Setup Instructions

### Step 1: Get StoreHub API Credentials

1. Log in to your StoreHub dashboard
2. Navigate to **Settings** → **Integrations** → **API Access**
3. Generate API credentials:
   - **Store ID**: Your unique store identifier
   - **API Key**: Public API key
   - **API Secret**: Secret key (keep secure)

### Step 2: Initialize Integration in WasteWise

**API Endpoint:** `POST /api/integrations/storehub/initialize`

**Request:**
```json
{
  "storeId": "your-store-id",
  "apiKey": "your-api-key",
  "apiSecret": "your-api-secret"
}
```

**Response:**
```json
{
  "success": true,
  "integration": {
    "id": "uuid",
    "user_id": "uuid",
    "integration_type": "storehub",
    "status": "active",
    "config": {
      "syncSales": true,
      "syncInventory": true,
      "syncFrequency": "realtime"
    }
  }
}
```

### Step 3: Configure Webhook (Optional)

For real-time updates, configure StoreHub webhooks:

1. In StoreHub dashboard: **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/integrations/storehub/webhook`
3. Select events:
   - `sale.created`
   - `sale.updated`
   - `inventory.updated`
   - `stock.updated`

---

## API Endpoints

### Initialize Integration
```
POST /api/integrations/storehub/initialize
```

### Sync Sales Data
```
POST /api/integrations/storehub/sync/sales
Body: {
  "startDate": "2024-01-01", // Optional, defaults to 30 days ago
  "endDate": "2024-12-31",   // Optional, defaults to today
  "outletId": "outlet-uuid"  // Optional, specific outlet
}
```

### Sync Inventory Data
```
POST /api/integrations/storehub/sync/inventory
Body: {
  "outletId": "outlet-uuid"  // Optional
}
```

### Get Integration Status
```
GET /api/integrations/storehub/status
```

### List All Integrations
```
GET /api/integrations
```

### Deactivate Integration
```
DELETE /api/integrations/storehub
```

---

## Data Mapping

### Sales Data Mapping

| StoreHub Field | WasteWise Field | Notes |
|----------------|-----------------|-------|
| `transactionId` | `transaction_id` | Unique transaction ID |
| `date` | `transaction_date` | Date of transaction |
| `time` | `transaction_time` | Time of transaction |
| `productName` | `product_name` | Product/item name |
| `category` | `category` | Product category |
| `quantity` | `quantity` | Quantity sold |
| `unitPrice` | `unit_price` | Price per unit |
| `totalAmount` | `total_amount` | Total transaction amount |
| `customerId` | `customer_id` | Customer identifier |
| `paymentMethod` | `payment_method` | Payment type |

### Inventory Data Mapping

| StoreHub Field | WasteWise Field | Notes |
|----------------|-----------------|-------|
| `name` | `item_name` | Product name |
| `category` | `category` | Product category |
| `stock` | `current_stock` | Current inventory level |
| `unit` | `unit` | Unit of measurement |
| `costPrice` | `cost_per_unit` | Cost per unit |
| `minStock` | `min_stock` | Minimum stock level |
| `maxStock` | `max_stock` | Maximum stock level |
| `supplier` | `supplier` | Supplier name |

---

## Webhook Events

### Sale Created/Updated
```json
{
  "event": "sale.created",
  "data": {
    "storeId": "store-id",
    "transactionId": "txn-123",
    "date": "2024-12-15",
    "time": "14:30:00",
    "productName": "Coffee",
    "category": "Beverages",
    "quantity": 2,
    "unitPrice": 15.00,
    "totalAmount": 30.00,
    "customerId": "cust-456",
    "paymentMethod": "Cash",
    "outletId": "outlet-789"
  }
}
```

### Inventory Updated
```json
{
  "event": "inventory.updated",
  "data": {
    "storeId": "store-id",
    "productName": "Coffee Beans",
    "stock": 100,
    "unit": "kg",
    "outletId": "outlet-789"
  }
}
```

---

## Error Handling

### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `INVALID_CREDENTIALS` | API credentials are invalid | Verify StoreHub credentials |
| `API_TIMEOUT` | Request timed out | Check network connection |
| `RATE_LIMIT` | Too many requests | Wait and retry |
| `WEBHOOK_SIGNATURE_INVALID` | Webhook signature verification failed | Check webhook secret |

### Retry Logic

The integration automatically retries failed requests:
- **Retry Attempts**: 3 attempts
- **Retry Delay**: Exponential backoff (1s, 2s, 4s)
- **Skip Retry**: 4xx client errors (bad request, auth errors)

---

## Security

### Credential Storage

- API secrets are encrypted before storage
- Credentials are stored in `integrations` table with RLS policies
- Only authenticated users can access their own integrations

### Webhook Security

- Webhook signatures are verified using HMAC-SHA256
- Configure webhook secret in environment variables
- Invalid signatures are rejected

---

## Monitoring

### Check Integration Status

```bash
GET /api/integrations/storehub/status
```

**Response:**
```json
{
  "success": true,
  "connected": true,
  "status": "active",
  "lastSync": "2024-12-15T10:30:00Z",
  "configuredAt": "2024-12-01T08:00:00Z"
}
```

### View Sync History

Check `integrations.config.lastSyncAt` for last sync timestamp.

---

## Troubleshooting

### Integration Not Syncing

1. Verify credentials: `GET /api/integrations/storehub/status`
2. Check StoreHub API access
3. Review error logs in WasteWise dashboard
4. Test API connection manually

### Webhook Not Receiving Events

1. Verify webhook URL is correct
2. Check webhook signature configuration
3. Ensure webhook events are enabled in StoreHub
4. Check server logs for webhook requests

### Data Mismatches

1. Check data mapping (see Data Mapping section)
2. Verify StoreHub data format
3. Review transformation logic
4. Check for duplicate transactions

---

## Best Practices

1. **Regular Syncs**: Set up scheduled syncs for historical data
2. **Webhook Configuration**: Enable webhooks for real-time updates
3. **Monitor Status**: Regularly check integration status
4. **Error Handling**: Set up alerts for sync failures
5. **Data Validation**: Verify synced data accuracy periodically

---

## Support

For issues or questions:
- Check logs: WasteWise dashboard → Integrations → Logs
- Contact support: support@wastewise.ai
- StoreHub Support: https://care.storehub.com

---

## Related Documents

- [Integrations API Reference](../api/INTEGRATIONS_API.md)
- [StoreHub API Documentation](https://api.storehub.com/docs)
- [Database Schema](../database/schema.sql)

---

**Last Updated:** December 2024  
**Version:** 1.0

