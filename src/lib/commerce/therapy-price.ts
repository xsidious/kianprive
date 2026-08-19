export function roundMoney(value: number) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/** 100% markup on product cost, then shipping split evenly across products (and by qty on each line). */
export function suggestedTherapyUnitPrice(input: {
  cost: number;
  shippingTotal: number;
  productCount: number;
  quantity: number;
}) {
  const markedUp = roundMoney(Math.max(0, input.cost) * 2);
  const products = Math.max(1, input.productCount);
  const qty = Math.max(1, input.quantity);
  const shippingShare = roundMoney(Math.max(0, input.shippingTotal) / products / qty);
  return roundMoney(markedUp + shippingShare);
}

export function shippingShareForLine(input: {
  shippingTotal: number;
  productCount: number;
  quantity: number;
  index: number;
}) {
  const products = Math.max(1, input.productCount);
  const qty = Math.max(1, input.quantity);
  const cents = Math.round(Math.max(0, input.shippingTotal) * 100);
  const base = Math.floor(cents / products);
  const remainder = cents - base * products;
  const lineCents = base + (input.index === products - 1 ? remainder : 0);
  return roundMoney(lineCents / 100 / qty);
}

export function suggestedTherapyLines<T extends { cost: number; quantity: number }>(
  lines: T[],
  shippingTotal: number,
): Array<T & { suggestedUnitPrice: number; shippingPerUnit: number; markedUp: number }> {
  return lines.map((line, index) => {
    const markedUp = roundMoney(Math.max(0, line.cost) * 2);
    const shippingPerUnit = shippingShareForLine({
      shippingTotal,
      productCount: lines.length,
      quantity: line.quantity,
      index,
    });
    return {
      ...line,
      markedUp,
      shippingPerUnit,
      suggestedUnitPrice: roundMoney(markedUp + shippingPerUnit),
    };
  });
}
