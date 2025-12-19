'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Download, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_pincode: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    mrp: number;
    quantity: number;
  }>;
  subtotal: number;
  shipping_charge: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  razorpay_payment_id: string;
}

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      const data = await response.json();
      if (data.invoice) {
        setInvoice(data.invoice);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDownloadPDF = () => {
    // Trigger browser's print dialog which allows "Save as PDF"
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Invoice not found</p>
          <Link href="/orders">
            <Button>View Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb - Hide on print */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 print:hidden">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/orders" className="hover:text-primary-600 transition-colors">Orders</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800">Invoice</span>
        </nav>

        {/* Action Button - Hide on print */}
        <div className="flex justify-end mb-6 print:hidden">
          <Button onClick={handleDownloadPDF} size="lg">
            <Download className="w-5 h-5 mr-2" />
            Download as PDF
          </Button>
        </div>

        {/* Invoice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-8 md:p-12 print:shadow-none print:rounded-none"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-slate-200">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">INVOICE</h1>
              <p className="text-sm text-slate-500">Rainbow Aquarium</p>
              <p className="text-sm text-slate-500">Fish & Birds Paradise</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Invoice Number</p>
              <p className="text-xl font-bold text-primary-600">{invoice.invoice_number}</p>
              <p className="text-sm text-slate-500 mt-2">Date: {formatDate(invoice.invoice_date)}</p>
            </div>
          </div>

          {/* Bill To & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Bill To:</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <p className="font-medium text-slate-800">{invoice.customer_name}</p>
                <p>{invoice.billing_address}</p>
                <p>{invoice.billing_city}, {invoice.billing_state}</p>
                <p>PIN: {invoice.billing_pincode}</p>
                <p className="mt-2">Phone: {invoice.customer_phone}</p>
                <p>Email: {invoice.customer_email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Payment Information:</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <p>
                  <span className="font-medium">Payment Method:</span>{' '}
                  {invoice.payment_method === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                </p>
                <p>
                  <span className="font-medium">Payment Status:</span>{' '}
                  <span className={`font-semibold ${invoice.payment_status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                    {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                  </span>
                </p>
                {invoice.razorpay_payment_id && (
                  <p className="text-xs mt-2">
                    <span className="font-medium">Transaction ID:</span><br />
                    {invoice.razorpay_payment_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 text-sm font-semibold text-slate-700">Item</th>
                  <th className="text-center py-3 text-sm font-semibold text-slate-700">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-slate-700">Price</th>
                  <th className="text-right py-3 text-sm font-semibold text-slate-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover print:hidden"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{item.name}</p>
                          {item.mrp > item.price && (
                            <p className="text-xs text-slate-500">
                              MRP: <span className="line-through">{formatPrice(item.mrp)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 text-slate-600">{item.quantity}</td>
                    <td className="text-right py-4 text-slate-600">{formatPrice(item.price)}</td>
                    <td className="text-right py-4 font-semibold text-slate-800">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium">{formatPrice(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Charge:</span>
                <span className="font-medium">
                  {invoice.shipping_charge === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(invoice.shipping_charge)
                  )}
                </span>
              </div>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax:</span>
                  <span className="font-medium">{formatPrice(invoice.tax_amount)}</span>
                </div>
              )}
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatPrice(invoice.discount_amount)}</span>
                </div>
              )}
              <div className="border-t-2 border-slate-200 pt-3 flex justify-between text-lg font-bold">
                <span className="text-slate-800">Total:</span>
                <span className="text-primary-600">{formatPrice(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
            <p className="mb-2">Thank you for shopping with Rainbow Aqua!</p>
            <p>For any queries, contact us on WhatsApp: +91 98765 43210</p>
          </div>
        </motion.div>

        {/* Back Button - Hide on print */}
        <div className="mt-6 print:hidden">
          <Link href="/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
