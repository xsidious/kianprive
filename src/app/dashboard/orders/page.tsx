import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { getPortalHomeForRole } from "@/lib/auth-redirect";
import { prisma } from "@/lib/prisma";
import { patientOrderProgress } from "@/lib/orders/progress";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaSecondary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

function progressTone(tone: string) {
  if (tone === "done" || tone === "shipped") return "bg-[#ecfff3] text-[#1f7e45]";
  if (tone === "paid") return "bg-[#fff6e8] text-[#8f6f3e]";
  if (tone === "issue") return "bg-[#fdeeee] text-[#7c2c2c]";
  return "bg-[#f3f0ea] text-[#6f6251]";
}

export default async function MemberOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const roleHome = getPortalHomeForRole(session.user.role);
  if (roleHome !== "/dashboard") {
    redirect(roleHome);
  }

  const email = session.user.email?.trim();
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { quantity: true, title: true } },
      _count: { select: { messages: true } },
    },
  });

  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <EditorialEyebrow>MY ORDERS</EditorialEyebrow>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-[#1f1a15]">Orders &amp; progress</h1>
            <p className="mt-3 max-w-xl text-[#6f6251]">
              Track fulfillment, view shipping updates, and message our team about any order.
            </p>
          </div>
          <Link href="/dashboard" className={editorialCtaSecondary}>
            Back to dashboard
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          {orders.length === 0 ? (
            <div className={`${editorialPanel} p-8 text-sm text-[#6f6251]`}>
              No orders yet. Therapy orders appear here after you accept and pay.
            </div>
          ) : (
            orders.map((order) => {
              const progress = patientOrderProgress(order);
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className={`${editorialPanel} block p-5 transition hover:border-[#d4c4a8]`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="inline-flex items-center gap-2 text-xs tracking-[0.14em] text-[#8f6f3e]">
                        <PackageCheck size={14} /> {order.orderNumber}
                      </p>
                      <p className="mt-2 font-serif text-2xl text-[#1f1a15]">{progress.label}</p>
                      <p className="mt-1 text-sm text-[#6f6251]">{progress.detail}</p>
                      <p className="mt-2 text-xs text-[#8a7d6c]">
                        {new Date(order.createdAt).toLocaleDateString()} · {itemCount}{" "}
                        {itemCount === 1 ? "item" : "items"}
                        {order._count.messages
                          ? ` · ${order._count.messages} message${order._count.messages === 1 ? "" : "s"}`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${progressTone(progress.tone)}`}
                    >
                      Step {progress.step} of 4
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </EditorialSection>
    </div>
  );
}
