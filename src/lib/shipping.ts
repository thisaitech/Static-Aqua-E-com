/**
 * Calculate shipping charge based on subtotal
 * Rules:
 * - ₹1000 and above: Free shipping (₹0)
 * - ₹500 to ₹999: ₹200 shipping
 * - Below ₹500: ₹100 shipping
 */
export function calculateShipping(subtotal: number): number {
  if (subtotal >= 1000) {
    return 0; // Free shipping for orders ₹1000 and above
  } else if (subtotal >= 500) {
    return 200; // ₹200 shipping for orders ₹500 to ₹999
  } else {
    return 100; // ₹100 shipping for orders below ₹500
  }
}

/**
 * Calculate total amount including shipping
 */
export function calculateTotal(subtotal: number): {
  subtotal: number;
  shipping: number;
  total: number;
} {
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  
  return {
    subtotal,
    shipping,
    total,
  };
}

/**
 * Format price in Indian currency
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
