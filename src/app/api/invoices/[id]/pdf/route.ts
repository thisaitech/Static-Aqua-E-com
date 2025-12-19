import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Generate PDF for invoice
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = params.id; // This is actually the order ID

    // Fetch the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user owns this order
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if invoice exists, if not create one
    let { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (!invoice) {
      // Generate invoice number
      const { data: invoiceNumberData } = await supabase.rpc('generate_invoice_number');
      const invoiceNumber = invoiceNumberData || `INV-${Date.now()}`;

      // Create invoice
      const { data: newInvoice, error: createError } = await supabase
        .from('invoices')
        .insert({
          order_id: orderId,
          invoice_number: invoiceNumber,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          billing_address: order.shipping_address,
          billing_city: order.shipping_city,
          billing_state: order.shipping_state,
          billing_pincode: order.shipping_pincode,
          items: order.products,
          subtotal: order.subtotal,
          shipping_charge: order.shipping_charge,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: order.total_amount,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          razorpay_payment_id: order.razorpay_payment_id,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating invoice:', createError);
        return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
      }

      invoice = newInvoice;
    }

    // Generate HTML for PDF
    const html = generateInvoiceHTML(invoice, order);

    // For now, return HTML that can be printed as PDF
    // In production, you'd use a library like puppeteer or a PDF service
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${invoice.invoice_number}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}

function generateInvoiceHTML(invoice: any, order: any): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }

    .invoice {
      background: white;
      padding: 40px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0891b2;
    }

    .company-details h1 {
      color: #0891b2;
      font-size: 28px;
      margin-bottom: 5px;
    }

    .company-details p {
      color: #666;
      font-size: 14px;
    }

    .invoice-details {
      text-align: right;
    }

    .invoice-details h2 {
      font-size: 32px;
      color: #333;
      margin-bottom: 10px;
    }

    .invoice-details p {
      font-size: 14px;
      color: #666;
      margin: 3px 0;
    }

    .invoice-number {
      font-weight: bold;
      color: #0891b2;
    }

    .billing-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }

    .billing-details h3 {
      color: #0891b2;
      font-size: 16px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .billing-details p {
      font-size: 14px;
      color: #666;
      margin: 3px 0;
    }

    .billing-details .name {
      font-weight: bold;
      color: #333;
      font-size: 16px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    thead {
      background: #0891b2;
      color: white;
    }

    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
    }

    td {
      padding: 15px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }

    tbody tr:hover {
      background: #f9f9f9;
    }

    .item-name {
      font-weight: 500;
      color: #333;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .totals {
      margin-left: auto;
      width: 350px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      font-size: 14px;
    }

    .totals-row.subtotal {
      color: #666;
    }

    .totals-row.total {
      background: #0891b2;
      color: white;
      font-weight: bold;
      font-size: 18px;
      margin-top: 10px;
    }

    .payment-info {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }

    .payment-info h3 {
      color: #0891b2;
      font-size: 16px;
      margin-bottom: 10px;
    }

    .payment-info p {
      font-size: 14px;
      color: #666;
      margin: 5px 0;
    }

    .payment-status {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
    }

    .payment-status.completed {
      background: #dcfce7;
      color: #16a34a;
    }

    .payment-status.pending {
      background: #fef3c7;
      color: #d97706;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }

    .footer p {
      margin: 5px 0;
    }

    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #0891b2;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    .print-button:hover {
      background: #0e7490;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .invoice {
        box-shadow: none;
        padding: 20px;
      }

      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>

  <div class="invoice">
    <!-- Header -->
    <div class="header">
      <div class="company-details">
        <h1>Rainbow Aquarium</h1>
        <p>Fish & Birds Paradise</p>
        <p>Email: info@rainbowaqua.com</p>
        <p>Phone: +91 88707 77420</p>
      </div>
      <div class="invoice-details">
        <h2>INVOICE</h2>
        <p><span class="invoice-number">${invoice.invoice_number}</span></p>
        <p>Date: ${formatDate(invoice.created_at)}</p>
        <p>Order ID: ${order.id.substring(0, 8)}</p>
      </div>
    </div>

    <!-- Billing Section -->
    <div class="billing-section">
      <div class="billing-details">
        <h3>Bill To:</h3>
        <p class="name">${invoice.customer_name}</p>
        <p>${invoice.customer_email}</p>
        <p>${invoice.customer_phone}</p>
        <p>${invoice.billing_address}</p>
        <p>${invoice.billing_city}, ${invoice.billing_state}</p>
        <p>PIN: ${invoice.billing_pincode}</p>
      </div>
      <div class="billing-details">
        <h3>Payment Information:</h3>
        <p>Method: <strong>${invoice.payment_method}</strong></p>
        <p>Status: <span class="payment-status ${invoice.payment_status}">${invoice.payment_status.toUpperCase()}</span></p>
        ${invoice.razorpay_payment_id ? `<p>Transaction ID: ${invoice.razorpay_payment_id}</p>` : ''}
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-center">Quantity</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item: any) => `
          <tr>
            <td class="item-name">${item.name}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">${formatPrice(item.price)}</td>
            <td class="text-right">${formatPrice(item.price * item.quantity)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row subtotal">
        <span>Subtotal:</span>
        <span>${formatPrice(invoice.subtotal)}</span>
      </div>
      <div class="totals-row subtotal">
        <span>Shipping Charge:</span>
        <span>${invoice.shipping_charge === 0 ? 'FREE' : formatPrice(invoice.shipping_charge)}</span>
      </div>
      ${invoice.tax_amount > 0 ? `
        <div class="totals-row subtotal">
          <span>Tax:</span>
          <span>${formatPrice(invoice.tax_amount)}</span>
        </div>
      ` : ''}
      ${invoice.discount_amount > 0 ? `
        <div class="totals-row subtotal">
          <span>Discount:</span>
          <span>-${formatPrice(invoice.discount_amount)}</span>
        </div>
      ` : ''}
      <div class="totals-row total">
        <span>Total Amount:</span>
        <span>${formatPrice(invoice.total_amount)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This is a computer-generated invoice and does not require a signature.</p>
      <p>For any queries, please contact us at info@rainbowaqua.com</p>
    </div>
  </div>
</body>
</html>
  `;
}
