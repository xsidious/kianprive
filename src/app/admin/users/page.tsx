"use client";

import { useEffect, useState } from "react";

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  role: "GUEST" | "MEMBER" | "EDITOR" | "OPERATIONS" | "ADMIN";
  subscription?: { tier: "BASIC" | "PREMIUM"; status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELED" } | null;
};

const roles = ["GUEST", "MEMBER", "EDITOR", "OPERATIONS", "ADMIN"] as const;
const tiers = ["BASIC", "PREMIUM"] as const;
const subStatuses = ["INACTIVE", "ACTIVE", "PAST_DUE", "CANCELED"] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [status, setStatus] = useState("");

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const payload = (await res.json()) as { users: UserRecord[] };
    setUsers(payload.users);
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function createUser(formData: FormData) {
    setStatus("");
    const body = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      role: String(formData.get("role") || "MEMBER"),
      subscriptionTier: String(formData.get("subscriptionTier") || "BASIC"),
      subscriptionStatus: String(formData.get("subscriptionStatus") || "ACTIVE"),
    };
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(response.ok ? "User created." : "Failed to create user.");
    if (response.ok) await loadUsers();
  }

  async function updateUser(user: UserRecord) {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscription?.tier ?? "BASIC",
        subscriptionStatus: user.subscription?.status ?? "INACTIVE",
      }),
    });
    setStatus(response.ok ? "User updated." : "Failed to update user.");
    if (response.ok) await loadUsers();
  }

  async function deleteUser(id: string) {
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setStatus(response.ok ? "User deleted." : "Failed to delete user.");
    if (response.ok) await loadUsers();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1f1a15]">Users</h1>
        <p className="mt-2 text-[#6f6251]">Create, edit, and remove customer/admin accounts with subscriptions.</p>
      </div>

      <section className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
        <h2 className="text-xl text-[#1f1a15]">Create User</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            void createUser(new FormData(event.currentTarget));
          }}
        >
          <input name="name" placeholder="Name" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" />
          <input name="email" type="email" placeholder="Email" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <input name="password" placeholder="Password" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <select name="role" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3">
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <select name="subscriptionTier" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3">
            {tiers.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
          </select>
          <select name="subscriptionStatus" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3">
            {subStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white md:col-span-3">Create User</button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#d7b67666] bg-white">
        <table className="w-full text-left text-sm text-[#3b3024]">
          <thead className="bg-[#fff6e8]">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Subscription</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[#d7b67633] align-top">
                <td className="p-3">
                  <input
                    value={user.name ?? ""}
                    onChange={(event) => setUsers((prev) => prev.map((row) => row.id === user.id ? { ...row, name: event.target.value } : row))}
                    className="w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2"
                  />
                </td>
                <td className="p-3">
                  <input
                    value={user.email}
                    onChange={(event) => setUsers((prev) => prev.map((row) => row.id === user.id ? { ...row, email: event.target.value } : row))}
                    className="w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2"
                  />
                </td>
                <td className="p-3">
                  <select
                    value={user.role}
                    onChange={(event) => setUsers((prev) => prev.map((row) => row.id === user.id ? { ...row, role: event.target.value as UserRecord["role"] } : row))}
                    className="w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2"
                  >
                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <div className="grid gap-2">
                    <select
                      value={user.subscription?.tier ?? "BASIC"}
                      onChange={(event) => setUsers((prev) => prev.map((row) => row.id === user.id ? { ...row, subscription: { tier: event.target.value as "BASIC" | "PREMIUM", status: row.subscription?.status ?? "INACTIVE" } } : row))}
                      className="w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2"
                    >
                      {tiers.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
                    </select>
                    <select
                      value={user.subscription?.status ?? "INACTIVE"}
                      onChange={(event) => setUsers((prev) => prev.map((row) => row.id === user.id ? { ...row, subscription: { tier: row.subscription?.tier ?? "BASIC", status: event.target.value as UserRecord["subscription"]["status"] } } : row))}
                      className="w-full rounded-lg border border-[#b78d4b35] bg-[#fffaf4] p-2"
                    >
                      {subStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => void updateUser(user)} className="rounded-full border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]">Save</button>
                    <button onClick={() => void deleteUser(user.id)} className="rounded-full border border-[#d07b7b80] px-3 py-1.5 text-xs text-[#7c2c2c]">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}
    </div>
  );
}
