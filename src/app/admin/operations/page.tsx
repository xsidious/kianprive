"use client";

import Link from "next/link";

export default function AdminOperationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-[#1f1a15]">Admin Operations</h1>
      <p className="text-[#6f6251]">Operational actions are now organized into dedicated pages.</p>

      <section className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
        <h2 className="text-xl text-[#1f1a15]">Go To Specific Workflows</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/products" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Products (Create/Edit)</Link>
          <Link href="/admin/orders" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Orders (Fulfill/Track)</Link>
          <Link href="/admin/communications" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Communications (Email)</Link>
          <Link href="/admin/retreats" className="rounded-full border border-[#b78d4b80] bg-white px-4 py-2 text-sm text-[#3b3024]">Retreats</Link>
        </div>
      </section>
    </div>
  );
}
