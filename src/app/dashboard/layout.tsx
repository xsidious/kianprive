import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPortalHomeForRole } from "@/lib/auth-redirect";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const home = getPortalHomeForRole(session.user.role);
  if (home !== "/dashboard") {
    redirect(home);
  }
  if (session.user.memberOnboardingComplete === false) {
    redirect("/onboarding");
  }

  return children;
}
