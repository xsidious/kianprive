import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPortalHomeForRole } from "@/lib/auth-redirect";
import { canAccessMemberDashboard } from "@/lib/rbac";
import { MemberPortalNav } from "@/components/portal/MemberPortalNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  if (!canAccessMemberDashboard(session.user.role, session.user.portals)) {
    redirect(getPortalHomeForRole(session.user.role));
  }
  if (
    session.user.memberOnboardingComplete === false &&
    (session.user.role === "MEMBER" || session.user.role === "GUEST")
  ) {
    redirect("/onboarding");
  }

  return (
    <>
      <MemberPortalNav name={session.user.name} />
      {children}
    </>
  );
}
