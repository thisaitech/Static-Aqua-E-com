# Razorpay Payment Flow Documentation

## Complete Payment Flow

### 1. User Journey

```
User adds products to cart
    ↓
Goes to checkout
    ↓
Fills shipping details (Step 1: Shipping)
    ↓
Selects payment method (Step 2: Payment)
    - Razorpay (UPI, Cards, NetBanking, Wallets)
    - Cash on Delivery
    ↓
Reviews order (Step 3: Confirm)
    ↓
Clicks "Place Order"
```

---

## 2. Technical Flow - Razorpay Payment

### Step-by-Step Process

#### **Phase 1: Order Initialization**

```javascript
1. User clicks "Place Order" button
   ↓
2. System validates authentication
   - Checks Supabase auth.getUser()
   - If not logged in → Show "Please login" alert
   ↓
3. System prepares order data
   {
     customer_name, customer_email, customer_phone,
     shipping_address, shipping_city, shipping_state, shipping_pincode,
     products: [{id, name, image, price, mrp, quantity}],
     subtotal, shipping_charge, total_amount,
     payment_method: 'razorpay',
     razorpay_order_id: null
   }
   ↓
4. Creates order in database (POST /api/orders)
   - Saves order with status: 'placed'
   - Saves payment_status: 'pending'
   - Returns order.id
```

**File:** `src/app/checkout/page.tsx` (Lines 145-196)

---

#### **Phase 2: Razorpay Order Creation**

```javascript
5. System creates Razorpay order (POST /api/razorpay/create-order)
   ↓
6. Backend (API Route):
   - Validates user authentication
   - Creates Razorpay order using Razorpay SDK
   - Parameters:
     * amount: total * 100 (in paise)
     * currency: 'INR'
     * receipt: 'receipt_{orderId}'
     * notes: { orderId: database_order_id }
   ↓
7. Razorpay API returns:
   {
     id: 'order_xxxxxxxxxxxx',
     amount: 230000,
     currency: 'INR',
     receipt: 'receipt_xxx'
   }
```

**Files:**
- Frontend: `src/app/checkout/page.tsx` (Lines 50-70)
- Backend: `src/app/api/razorpay/create-order/route.ts`

---

#### **Phase 3: Razorpay Checkout Modal**

```javascript
8. Initialize Razorpay checkout with options:
   {
     key: RAZORPAY_KEY_ID,
     amount: razorpayOrder.amount,
     currency: 'INR',
     name: 'Rainbow Aqua',
     description: 'Order Payment',
     order_id: razorpayOrder.id,
     handler: paymentSuccessHandler,
     prefill: { name, email, contact },
     theme: { color: '#3b82f6' },
     modal: { ondismiss: dismissHandler }
   }
   ↓
9. Razorpay modal opens with payment options:
   ✓ UPI Apps
     - Google Pay
     - PhonePe
     - Paytm
     - BHIM
     - Amazon Pay
   ✓ Credit/Debit Cards
     - Visa
     - Mastercard
     - RuPay
     - American Express
   ✓ NetBanking
     - All major banks
   ✓ Wallets
     - Paytm Wallet
     - PhonePe Wallet
     - Amazon Pay Wallet
   ✓ EMI Options (if applicable)
   ↓
10. User selects payment method and completes payment
```

**File:** `src/app/checkout/page.tsx` (Lines 72-138)

---

#### **Phase 4: Payment Success & Verification**

```javascript
11. On successful payment, Razorpay returns:
    {
      razorpay_order_id: 'order_xxxxxxxxxxxx',
      razorpay_payment_id: 'pay_xxxxxxxxxxxx',
      razorpay_signature: 'generated_signature_hash'
    }
    ↓
12. Frontend calls verification API (POST /api/razorpay/verify-payment)
    ↓
13. Backend verification process:
    a. Generate signature using HMAC SHA256:
       - Data: razorpay_order_id + "|" + razorpay_payment_id
       - Secret: RAZORPAY_KEY_SECRET

    b. Compare generated signature with received signature
       - If match → Payment is genuine ✓
       - If mismatch → Payment is fraudulent ✗

    c. Update order in database:
       - razorpay_order_id
       - razorpay_payment_id
       - razorpay_signature
       - payment_status: 'completed'
       - order_status: 'confirmed'
```

**Files:**
- Frontend: `src/app/checkout/page.tsx` (Lines 80-96)
- Backend: `src/app/api/razorpay/verify-payment/route.ts`

---

#### **Phase 5: Invoice Generation**

```javascript
14. After successful verification:
    - Call invoice API (POST /api/invoices)
    - Backend:
      * Fetches order details from database
      * Generates unique invoice number (INV-YYYYMMDD-XXXX)
      * Creates invoice record with:
        - Order details
        - Customer information
        - Payment information
        - Invoice items
    ↓
15. Invoice saved to database
    {
      invoice_number: 'INV-20250117-0001',
      order_id: order.id,
      customer_name, customer_email, customer_phone,
      items: products array,
      subtotal, shipping_charge, total_amount,
      payment_method: 'razorpay',
      payment_status: 'completed',
      razorpay_payment_id
    }
```

**Files:**
- Frontend: `src/app/checkout/page.tsx` (Lines 98-112)
- Backend: `src/app/api/invoices/route.ts`

---

#### **Phase 6: Order Completion**

```javascript
16. Clear shopping cart
    ↓
17. Redirect to order success page
    - URL: /order-success?orderId={order.id}
    ↓
18. Show order confirmation with:
    - Order number
    - Payment status
    - Invoice number
    - Estimated delivery
```

**File:** `src/app/checkout/page.tsx` (Lines 114-115)

---

## 3. Alternative Flow - Cash on Delivery

```javascript
If user selects COD:
1. Create order in database
   - payment_method: 'cod'
   - payment_status: 'pending'
   ↓
2. Skip Razorpay payment flow
   ↓
3. Generate invoice immediately
   ↓
4. Clear cart and redirect to success page
```

**File:** `src/app/checkout/page.tsx` (Lines 202-220)

---

## 4. Error Handling

### Payment Cancellation
```javascript
User closes Razorpay modal → ondismiss handler
    ↓
- Stop loading spinner
- Show alert: "Payment cancelled. Your order is saved..."
- Order remains in database with status 'pending'
- User can retry payment later
```

### Payment Verification Failure
```javascript
If signature verification fails:
    ↓
- Show alert: "Payment verification failed. Please contact support."
- Order status remains 'pending'
- Payment ID saved for manual verification
```

### Order Creation Failure
```javascript
If database order creation fails:
    ↓
- Show detailed error message
- Log error to console
- Stop the payment flow
- User can retry
```

---

## 5. Database Schema

### Orders Table
```sql
orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_pincode TEXT,
  products JSONB,
  subtotal DECIMAL(10,2),
  shipping_charge DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  payment_method TEXT,
  payment_status TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  order_status TEXT,
  created_at TIMESTAMP
)
```

### Invoices Table
```sql
invoices (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  invoice_number TEXT UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB,
  subtotal DECIMAL(10,2),
  shipping_charge DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  payment_method TEXT,
  payment_status TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMP
)
```

---

## 6. API Endpoints

### 1. Create Order
- **Endpoint:** `POST /api/orders`
- **Auth:** Required (Supabase)
- **Input:** Order details
- **Output:** Created order with ID

### 2. Create Razorpay Order
- **Endpoint:** `POST /api/razorpay/create-order`
- **Auth:** Required (Supabase)
- **Input:** `{ amount, currency, receipt, notes }`
- **Output:** `{ order: { id, amount, currency } }`

### 3. Verify Payment
- **Endpoint:** `POST /api/razorpay/verify-payment`
- **Auth:** Required (Supabase)
- **Input:** `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }`
- **Output:** `{ success: true, verified: true }`

### 4. Generate Invoice
- **Endpoint:** `POST /api/invoices`
- **Auth:** Required (Supabase)
- **Input:** `{ orderId }`
- **Output:** `{ invoice: { invoice_number, ... } }`

---

## 7. Environment Variables

```bash
# Frontend & Backend
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Backend Only
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

---

## 8. Security Features

1. **Payment Verification**
   - HMAC SHA256 signature verification
   - Prevents payment tampering

2. **Authentication**
   - All API routes check Supabase authentication
   - Row-level security on database

3. **Server-Side Processing**
   - Razorpay secret key never exposed to client
   - Payment verification happens server-side

4. **Order Integrity**
   - Order created before payment
   - Payment linked to specific order
   - Prevents duplicate payments

---

## 9. User Experience Features

1. **Pre-filled Information**
   - Name, email, phone auto-filled in Razorpay modal
   - Faster checkout experience

2. **Multiple Payment Options**
   - UPI, Cards, NetBanking, Wallets
   - User chooses preferred method

3. **Payment Status**
   - Real-time feedback
   - Clear error messages
   - Success confirmation

4. **Invoice Generation**
   - Automatic invoice creation
   - Unique invoice number
   - Linked to order

---

## 10. Testing

### Test Mode (Current Setup)
- Using test keys: `rzp_test_RrVPw4temWVxGs`
- Test card: 4111 1111 1111 1111
- Test UPI: success@razorpay
- No real money transactions

### Production Setup
- Replace test keys with live keys
- Enable live mode in Razorpay dashboard
- Test thoroughly before going live

---

## 11. Monitoring & Logs

### Frontend Console Logs
- Order creation status
- Payment initiation
- Verification results
- Invoice generation

### Backend Logs
- API errors
- Payment verification failures
- Database operation errors

---

## 12. Future Enhancements

1. **Payment Retry**
   - Allow users to retry failed payments
   - Resume incomplete orders

2. **Webhook Integration**
   - Handle async payment notifications
   - Update order status automatically

3. **Refunds**
   - API endpoint for refund processing
   - Admin panel for refund management

4. **Payment Analytics**
   - Track payment success rates
   - Monitor payment methods usage
   - Revenue analytics

---

## Support & Documentation

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay API Reference: https://razorpay.com/docs/api/
- Test Credentials: https://razorpay.com/docs/payments/payments/test-card-details/
