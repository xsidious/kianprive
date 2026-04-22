import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sub = await getUserSubscription(session.user.id);
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl">Welcome back, {session.user.name ?? "Member"}</h1>
      <p className="mt-4 text-[#e9deca]">Role: {session.user.role}</p>
      <p className="text-[#e9deca]">Subscription: {sub?.tier ?? "BASIC"} / {sub?.status ?? "INACTIVE"}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="rounded-full border border-[#d7b67680] px-5 py-2" href="/dashboard/subscription">View Subscription</Link>
        <Link className="rounded-full border border-[#d7b67680] px-5 py-2" href="/dashboard/profile">Profile Settings</Link>
        <Link className="rounded-full bg-[#d7b676] px-5 py-2 text-black" href="/icoone-training">Go to Icoone Training</Link>
      </div>
    </div>
  );
}
