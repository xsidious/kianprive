import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { subscription: true },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl">Admin Panel</h1>
      <div className="mt-8 overflow-hidden rounded-2xl border border-[#d7b67666]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1b1611]">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Plan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[#d7b67633]">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.subscription?.tier ?? "BASIC"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
