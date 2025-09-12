# United Payment Integration Setup

## Test Environment Setup

### 1. Environment Variables
Create a `.env` file in the project root with the following variables:

```env
# United Payment Authentication
UNITED_PAYMENT_EMAIL="support@unitedpayment.com"
UNITED_PAYMENT_PASSWORD="Testmerchant12!"
UNITED_PAYMENT_PARTNER_ID="your_partner_id"
UNITED_PAYMENT_ENV="development"

# Callback URLs (for local development)
UNITED_PAYMENT_CALLBACK_URL="http://localhost:3000/api/payment/callback"
UNITED_PAYMENT_SUCCESS_URL="http://localhost:3000/order-success"
UNITED_PAYMENT_FAILURE_URL="http://localhost:3000/checkout?payment=failed"
UNITED_PAYMENT_CANCEL_URL="http://localhost:3000/checkout?payment=cancelled"
UNITED_PAYMENT_DECLINE_URL="http://localhost:3000/checkout?payment=declined"
```

### 2. Getting Test Credentials
1. Contact United Payment to get test environment credentials
2. Request:
   - Username and Password for authentication
   - Partner ID
   - Test API documentation
3. Test IP addresses are available for Azerbaijan, Turkey, and Georgia

### 3. Authentication System
The system automatically handles authentication with United Payment:

- **Auto Login**: System logs in automatically using username/password
- **Token Management**: Tokens are cached and refreshed automatically
- **Token Expiry**: Tokens expire every hour and are refreshed automatically
- **Fallback**: If refresh fails, system attempts to login again

#### Authentication Endpoints:
- **Login**: `POST /api/payment/united-payment/auth`
- **Refresh Token**: `PUT /api/payment/united-payment/auth`
- **Token Status**: `GET /api/payment/united-payment/auth`

### 4. Test API Endpoints
- **Test API URL**: `https://test-vpos.unitedpayment.az`
- **Production API URL**: `https://vpos.unitedpayment.az`
- **Checkout Endpoint**: `/api/transactions/checkout`
- **Auth Endpoint**: `/api/auth/login`
- **Headers**: `x-auth-token: auto_generated_token`

### 5. Test Payment Flow
1. Go to checkout page
2. Select "Kart ilə ödəniş"
3. Submit order
4. System will automatically authenticate and redirect to United Payment test page
5. Complete test payment
6. Return to success page

### 6. Mock Mode (Development)
If no credentials are configured, the system runs in mock mode:
- Returns mock payment URL
- Simulates successful payment
- Redirects to success page with test data

## Production Setup

### 1. Production Environment Variables
```env
UNITED_PAYMENT_EMAIL="your_production_email"
UNITED_PAYMENT_PASSWORD="your_production_password"
UNITED_PAYMENT_PARTNER_ID="your_production_partner_id"
UNITED_PAYMENT_ENV="production"
```

### 2. Production URLs
Update callback URLs for production domain:
```env
UNITED_PAYMENT_CALLBACK_URL="https://yourdomain.com/api/payment/callback"
UNITED_PAYMENT_SUCCESS_URL="https://yourdomain.com/order-success"
UNITED_PAYMENT_FAILURE_URL="https://yourdomain.com/checkout?payment=failed"
UNITED_PAYMENT_CANCEL_URL="https://yourdomain.com/checkout?payment=cancelled"
UNITED_PAYMENT_DECLINE_URL="https://yourdomain.com/checkout?payment=declined"
```

### 3. Production API
- **Production API URL**: `https://vpos.unitedpayment.az`
- Same endpoints as test environment

## API Integration Details

### Request Format
```json
{
  "clientOrderId": "ORDER_123",
  "amount": 100,
  "language": "AZ",
  "successUrl": "https://yourdomain.com/order-success",
  "cancelUrl": "https://yourdomain.com/checkout?payment=cancelled",
  "declineUrl": "https://yourdomain.com/checkout?payment=declined",
  "description": "Sifariş #ORDER_123",
  "memberId": "user@example.com",
  "additionalInformation": "Order: ORDER_123",
  "email": "user@example.com",
  "phoneNumber": "+994501234567",
  "clientName": "John Doe",
  "currency": "944",
  "addcard": false,
  "partnerId": "your_partner_id"
}
```

### Response Format
```json
{
  "clientOrderId": "ORDER_123",
  "status": "Pending",
  "transactionType": "Purchase",
  "transactionId": 39918,
  "url": "https://tstpg.kapitalbank.az/index.jsp?ORDERID=798048&SESSIONID=..."
}
```

## Testing Checklist

- [ ] Test auth token configured
- [ ] Test payment flow works
- [ ] Callback handling works
- [ ] Order status updates correctly
- [ ] Success/failure pages display correctly
- [ ] Mock mode works without credentials

## Troubleshooting

### Common Issues
1. **"Configuration missing" error**: Check environment variables
2. **API errors**: Verify auth token and partner ID
3. **Callback not received**: Check callback URL configuration
4. **Order not updating**: Check database connection and order number format

### Logs
Check server logs for detailed error information:
- Payment creation errors
- API response details
- Callback processing logs
- Database update errors
