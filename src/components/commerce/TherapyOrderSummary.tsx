type LineItem = {
  title: string;
  quantity: number;
  lineTotal: number;
};

type Props = {
  items: LineItem[];
  subtotal?: number;
  shippingTotal?: number;
  total: number;
  className?: string;
  heading?: string;
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export function TherapyOrderSummary({
  items,
  subtotal: subtotalProp,
  shippingTotal: shippingProp,
  total,
  className = "",
  heading = "Order summary",
}: Props) {
  const subtotal =
    subtotalProp ?? items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingTotal =
    shippingProp ??
    (total > subtotal + 0.009 ? Math.max(0, total - subtotal) : 0);

  return (
    <section className={`rounded-2xl border border-[#e7dcc8] bg-white/80 p-5 shadow-sm backdrop-blur-sm ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">{heading}</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="flex justify-between gap-3 text-sm">
            <span className="text-[#2b2218]">
              {item.title} <span className="text-[#8f6f3e]">× {item.quantity}</span>
            </span>
            <span className="shrink-0 font-medium text-[#1f1a15]">{money(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-2 border-t border-[#efe4d4] pt-4 text-sm text-[#6f6251]">
        <div className="flex items-center justify-between">
          <span>Products subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        {shippingTotal > 0.009 ? (
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{money(shippingTotal)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-[#efe4d4] pt-3 font-serif text-lg text-[#1f1a15]">
          <span>Total due</span>
          <span className="text-2xl">{money(total)}</span>
        </div>
      </div>
    </section>
  );
}
