import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCommercePage() {
  const [products, orders] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 25,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl text-[#1f1a15]">Commerce</h1>
          <Link href="/admin/commerce/products/new" className="rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white">
            Add Product
          </Link>
        </div>
        <div className="grid gap-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg text-[#1f1a15]">{product.title}</p>
                  <p className="text-sm text-[#6f6251]">{product.slug}</p>
                </div>
                <div className="text-right text-sm text-[#8f6f3e]">
                  <p>{product.status}</p>
                  <p>${product.price.toString()}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl text-[#1f1a15]">Recent Orders</h2>
        <div className="grid gap-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg text-[#1f1a15]">{order.orderNumber}</p>
                  <p className="text-sm text-[#6f6251]">{order.email ?? "No email"}</p>
                </div>
                <div className="text-right text-sm text-[#8f6f3e]">
                  <p>{order.status}</p>
                  <p>{order.paymentStatus}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
