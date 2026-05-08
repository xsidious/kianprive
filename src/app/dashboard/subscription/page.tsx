import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription";

export default async function DashboardSubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const sub = await getUserSubscription(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl text-[#1f1a15]">Your Subscription</h1>
      <div className="mt-8 rounded-3xl border border-[#d7b67666] bg-white p-6 text-[#2b2218]">
        <p>Tier: {sub?.tier ?? "BASIC"}</p>
        <p className="mt-2">Status: {sub?.status ?? "INACTIVE"}</p>
        <p className="mt-2">Renewal: {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "N/A"}</p>
      </div>
    </div>
  );
}
