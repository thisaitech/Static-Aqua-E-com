/**
 * Invoice PDF Generation Utility
 * Generates professional invoice PDFs using jsPDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_district: string;
  customer_pincode: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
}

export function generateInvoicePDF(invoice: InvoiceData) {
  const doc = new jsPDF();

  // Company details
  const companyName = 'Rainbow Aquarium';
  const companyAddress = 'Your Company Address';
  const companyPhone = '+91 98765 43210';
  const companyEmail = 'info@rainbowaqua.com';

  // Set font
  doc.setFont('helvetica');

  // Header - Company Name
  doc.setFontSize(24);
  doc.setTextColor(14, 165, 233); // Primary blue color
  doc.text(companyName, 20, 20);

  // Company details
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(companyAddress, 20, 28);
  doc.text(`Phone: ${companyPhone} | Email: ${companyEmail}`, 20, 33);

  // Invoice Title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 150, 20);

  // Invoice Number and Date
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Invoice #: ${invoice.invoice_number}`, 150, 28);
  doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}`, 150, 33);

  // Line separator
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 40, 190, 40);

  // Bill To Section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Bill To:', 20, 50);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(invoice.customer_name, 20, 57);
  doc.text(invoice.customer_email, 20, 62);
  doc.text(invoice.customer_phone, 20, 67);

  // Shipping Address
  const addressLines = doc.splitTextToSize(
    `${invoice.customer_address}, ${invoice.customer_city}, ${invoice.customer_district} - ${invoice.customer_pincode}`,
    80
  );
  doc.text(addressLines, 20, 72);

  // Payment Information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Payment Info:', 120, 50);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Method: ${invoice.payment_method}`, 120, 57);
  doc.text(`Status: ${invoice.payment_status}`, 120, 62);

  // Items Table
  const tableStartY = 95;

  // Prepare table data
  const tableData = invoice.items.map(item => [
    item.name,
    item.quantity.toString(),
    `₹${item.price.toFixed(2)}`,
    `₹${item.total.toFixed(2)}`
  ]);

  // Generate table
  autoTable(doc, {
    startY: tableStartY,
    head: [['Product', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [14, 165, 233], // Primary blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });

  // Get the Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 50;

  // Summary Section
  const summaryX = 130;
  let summaryY = finalY + 10;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  // Subtotal
  doc.text('Subtotal:', summaryX, summaryY);
  doc.text(`₹${invoice.subtotal.toFixed(2)}`, 185, summaryY, { align: 'right' });
  summaryY += 7;

  // Shipping
  doc.text('Shipping:', summaryX, summaryY);
  doc.text(`₹${invoice.shipping_cost.toFixed(2)}`, 185, summaryY, { align: 'right' });
  summaryY += 7;

  // Tax
  doc.text('Tax:', summaryX, summaryY);
  doc.text(`₹${invoice.tax_amount.toFixed(2)}`, 185, summaryY, { align: 'right' });
  summaryY += 7;

  // Line above total
  doc.setDrawColor(220, 220, 220);
  doc.line(summaryX, summaryY, 190, summaryY);
  summaryY += 7;

  // Total
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', summaryX, summaryY);
  doc.text(`₹${invoice.total_amount.toFixed(2)}`, 185, summaryY, { align: 'right' });

  // Footer
  const footerY = 270;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 105, footerY, { align: 'center' });
  doc.text('For any queries, please contact us at ' + companyEmail, 105, footerY + 5, { align: 'center' });

  // Bottom line
  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(0.5);
  doc.line(20, 280, 190, 280);

  return doc;
}

export function downloadInvoicePDF(invoice: InvoiceData) {
  const doc = generateInvoicePDF(invoice);
  doc.save(`Invoice-${invoice.invoice_number}.pdf`);
}

export function openInvoicePDF(invoice: InvoiceData) {
  const doc = generateInvoicePDF(invoice);
  doc.output('dataurlnewwindow');
}
