import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const configured = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  if (!configured || !stripe) {
    return NextResponse.json({
      configured: false,
      livemode: null,
      accountId: null,
    });
  }

  const account = await stripe.accounts.retrieve();
  return NextResponse.json({
    configured: true,
    livemode: account.livemode,
    accountId: account.id,
    country: account.country,
    email: account.email,
  });
}
