import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    {
      error:
        "New member accounts are created after a paid consultation and approval. Please book your consultation to begin.",
      nextStep: "/signup",
      consultationUrl: "/book-online?service=telemedicine",
      pricingUrl: "/pricing",
    },
    { status: 403 },
  );
}
