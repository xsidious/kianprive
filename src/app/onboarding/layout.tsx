import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/welcome");
  }
  if (session.user.memberOnboardingComplete !== false) {
    redirect("/dashboard");
  }
  return children;
}
