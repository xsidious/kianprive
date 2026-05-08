"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  price: number;
};

type Order = {
  id: string;
  orderNumber: string;
  email: string | null;
  status: "PENDING" | "PAID" | "PROCESSING" | "FULFILLED" | "DELIVERED" | "CANCELED" | "REFUNDED";
  paymentStatus: "UNPAID" | "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED" | "FAILED";
  fulfillmentStatus: "UNFULFILLED" | "PROCESSING" | "PARTIALLY_FULFILLED" | "FULFILLED" | "DELIVERED";
};

const productStatuses = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
const orderStatuses = ["PENDING", "PAID", "PROCESSING", "FULFILLED", "DELIVERED", "CANCELED", "REFUNDED"] as const;
const paymentStatuses = ["UNPAID", "PAID", "PARTIALLY_REFUNDED", "REFUNDED", "FAILED"] as const;
const fulfillmentStatuses = ["UNFULFILLED", "PROCESSING", "PARTIALLY_FULFILLED", "FULFILLED", "DELIVERED"] as const;

export default function AdminCommercePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");

  async function loadAll() {
    const [productsRes, ordersRes] = await Promise.all([fetch("/api/admin/commerce/products"), fetch("/api/admin/commerce/orders")]);
    if (productsRes.ok) {
      const payload = (await productsRes.json()) as { products: Product[] };
      setProducts(payload.products);
    }
    if (ordersRes.ok) {
      const payload = (await ordersRes.json()) as { orders: Order[] };
      setOrders(payload.orders);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function saveProduct(product: Product) {
    const response = await fetch(`/api/admin/commerce/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    setStatus(response.ok ? "Product updated." : "Failed to update product.");
    if (response.ok) await loadAll();
  }

  async function deleteProduct(id: string) {
    const response = await fetch(`/api/admin/commerce/products/${id}`, { method: "DELETE" });
    setStatus(response.ok ? "Product deleted." : "Failed to delete product.");
    if (response.ok) await loadAll();
  }

  async function saveOrder(order: Order) {
    const response = await fetch(`/api/admin/commerce/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    setStatus(response.ok ? "Order updated." : "Failed to update order.");
    if (response.ok) await loadAll();
  }

  async function deleteOrder(id: string) {
    const response = await fetch(`/api/admin/commerce/orders/${id}`, { method: "DELETE" });
    setStatus(response.ok ? "Order deleted." : "Failed to delete order.");
    if (response.ok) await loadAll();
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl text-[#1f1a15]">Commerce</h1>
          <div className="flex gap-2">
            <Link href="/shop" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Preview Shop</Link>
            <Link href="/admin/products" className="rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white">Manage Products</Link>
            <Link href="/admin/orders" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Manage Orders</Link>
          </div>
        </div>
        <p className="mb-4 text-sm text-[#6f6251]">Manage products with clear merchandising fields and save each item inline.</p>
        <div className="grid gap-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4 shadow-[0_18px_40px_-35px_rgba(66,45,14,0.45)]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs tracking-[0.15em] text-[#8f6f3e]">PRODUCT DETAILS</p>
                <p className="text-xs text-[#6f6251]">ID: {product.id.slice(0, 8)}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="text-xs font-medium uppercase tracking-[0.1em] text-[#7a6543] md:col-span-2">
                  Product Title
                  <input
                    value={product.title}
                    onChange={(event) => setProducts((prev) => prev.map((row) => row.id === product.id ? { ...row, title: event.target.value } : row))}
                    className="mt-1 w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm text-[#1f1a15]"
                  />
                </label>
                <label className="text-xs font-medium uppercase tracking-[0.1em] text-[#7a6543]">
                  Status
                  <select
                    value={product.status}
                    onChange={(event) => setProducts((prev) => prev.map((row) => row.id === product.id ? { ...row, status: event.target.value as Product["status"] } : row))}
                    className="mt-1 w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm text-[#1f1a15]"
                  >
                    {productStatuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium uppercase tracking-[0.1em] text-[#7a6543] md:col-span-2">
                  URL Slug
                  <input
                    value={product.slug}
                    onChange={(event) => setProducts((prev) => prev.map((row) => row.id === product.id ? { ...row, slug: event.target.value } : row))}
                    className="mt-1 w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm text-[#1f1a15]"
                  />
                </label>
                <label className="text-xs font-medium uppercase tracking-[0.1em] text-[#7a6543]">
                  Price (USD)
                  <input
                    type="number"
                    value={product.price}
                    onChange={(event) => setProducts((prev) => prev.map((row) => row.id === product.id ? { ...row, price: Number(event.target.value) } : row))}
                    className="mt-1 w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm text-[#1f1a15]"
                  />
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => void saveProduct(product)} className="rounded-full border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]">Save Product</button>
                <button onClick={() => void deleteProduct(product.id)} className="rounded-full border border-[#d07b7b80] px-3 py-1.5 text-xs text-[#7c2c2c]">Delete Product</button>
                <Link href="/shop" className="rounded-full border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]">Preview in Shop</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-2xl text-[#1f1a15]">Orders</h2>
        <p className="mb-4 text-sm text-[#6f6251]">Update fulfillment pipeline and transaction status from one place.</p>
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_130px_160px_170px_auto] md:items-end">
                <div>
                  <p className="text-lg text-[#1f1a15]">{order.orderNumber}</p>
                  <label className="mt-2 block text-xs font-medium uppercase tracking-[0.1em] text-[#7a6543]">
                    Customer Email
                    <input
                      value={order.email ?? ""}
                      onChange={(event) => setOrders((prev) => prev.map((row) => row.id === order.id ? { ...row, email: event.target.value } : row))}
                      className="mt-1 w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm text-[#1f1a15]"
                    />
                  </label>
                </div>
                <label className="text-xs font-medium uppercase tracking-[0.1em] text-[#7a6543]">
                  Order Status
                  <select value={order.status} onChange={(event) => setOrders((prev) => prev.map((row) => row.id === order.id ? { ...row, status: event.target.value as Order["status"] } : row))} className="mt-1 w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm text-[#1f1a15]">
                    {orderStatuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium uppercase tracking-[0.1em] text-[#7a6543]">
                  Payment Status
                  <select value={order.paymentStatus} onChange={(event) => setOrders((prev) => prev.map((row) => row.id === order.id ? { ...row, paymentStatus: event.target.value as Order["paymentStatus"] } : row))} className="mt-1 w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm text-[#1f1a15]">
                    {paymentStatuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium uppercase tracking-[0.1em] text-[#7a6543]">
                  Fulfillment Status
                  <select value={order.fulfillmentStatus} onChange={(event) => setOrders((prev) => prev.map((row) => row.id === order.id ? { ...row, fulfillmentStatus: event.target.value as Order["fulfillmentStatus"] } : row))} className="mt-1 w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2 text-sm text-[#1f1a15]">
                    {fulfillmentStatuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                  </select>
                </label>
                <div className="flex gap-2">
                  <button onClick={() => void saveOrder(order)} className="rounded-full border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]">Save Order</button>
                  <button onClick={() => void deleteOrder(order.id)} className="rounded-full border border-[#d07b7b80] px-3 py-1.5 text-xs text-[#7c2c2c]">Delete Order</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}
    </div>
  );
}
