/**
 * Calculate shipping charge based on subtotal
 * Rules:
 * - ₹500-699: ₹100 shipping
 * - ₹700-999: ₹200 shipping
 * - ₹1000+: Free shipping
 * - Below ₹500: Not applicable (minimum order might be required)
 */
export function calculateShipping(subtotal: number): number {
  if (subtotal >= 1000) {
    return 0; // Free shipping
  } else if (subtotal >= 700) {
    return 200;
  } else if (subtotal >= 500) {
    return 100;
  }
  return 0; // For orders below ₹500
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
