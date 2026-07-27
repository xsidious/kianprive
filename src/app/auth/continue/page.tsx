import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { resolvePostLoginPath } from "@/lib/auth-redirect";

type Props = {
  searchParams?: Promise<{ callbackUrl?: string }>;
};

/** Server-side post-login router — always sends each role to the correct portal. */
export default async function AuthContinuePage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const dest = resolvePostLoginPath(session.user.role, params.callbackUrl ?? null);
  redirect(dest);
}
