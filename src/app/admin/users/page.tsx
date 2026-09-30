"use client";

import { Fragment, useEffect, useState, type FormEvent } from "react";
import { MemberProfileFields } from "@/components/account/MemberProfileFields";
import { memberProfileFromRecord, type MemberProfileDraft } from "@/lib/account/member-profile";

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  role: "GUEST" | "MEMBER" | "EDITOR" | "OPERATIONS" | "ADMIN" | "PARTNER" | "AMBASSADOR" | "PROVIDER";
  subscription?: { tier: "BASIC" | "PREMIUM"; status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELED" } | null;
  profile?: Partial<MemberProfileDraft> | null;
};

const roles = ["GUEST", "MEMBER", "EDITOR", "OPERATIONS", "ADMIN", "PARTNER", "AMBASSADOR", "PROVIDER"] as const;
const tiers = ["BASIC", "PREMIUM"] as const;
const subStatuses = ["INACTIVE", "ACTIVE", "PAST_DUE", "CANCELED"] as const;

const emptyCreateForm = {
  name: "",
  email: "",
  password: "",
  role: "MEMBER",
  subscriptionTier: "BASIC",
  subscriptionStatus: "ACTIVE",
};

const fieldClass = "rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-3";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);

  async function loadUsers(search = query, role = roleFilter) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (role !== "ALL") params.set("role", role);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    if (!res.ok) return;
    const payload = (await res.json()) as { users: UserRecord[] };
    setUsers(payload.users);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadUsers(query, roleFilter);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query, roleFilter]);

  useEffect(() => {
    if (!createOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !creating) setCreateOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [createOpen, creating]);

  function openCreate() {
    setCreateForm(emptyCreateForm);
    setCreateMessage("");
    setCreateOpen(true);
  }

  function closeCreate() {
    if (creating) return;
    setCreateOpen(false);
    setCreateForm(emptyCreateForm);
    setCreateMessage("");
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateMessage("");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setCreateMessage(payload?.error || "Failed to create user.");
      setCreating(false);
      return;
    }
    setCreating(false);
    setCreateMessage("User created.");
    setStatus("User created.");
    setCreateForm(emptyCreateForm);
    await loadUsers();
    window.setTimeout(() => {
      setCreateOpen(false);
      setCreateMessage("");
    }, 900);
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
        profile: memberProfileFromRecord({ ...user.profile, name: user.name ?? user.profile?.name ?? "" }),
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl text-[#1f1a15]">Users</h1>
          <p className="mt-2 text-[#6f6251]">Search members, then add, edit, or remove accounts.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-sm bg-[#b78d4b] px-5 py-2.5 text-sm text-white"
        >
          Add user
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search members by name or email"
          className={`${fieldClass} min-w-[240px] flex-1`}
        />
        <button
          type="button"
          className="rounded-sm border border-[#b78d4b80] px-4 py-2 text-sm text-[#3b3024]"
          onClick={() => {
            const rows = users.filter((user) => user.role === "MEMBER" && user.subscription?.status === "ACTIVE");
            const lines = rows.map((user) => user.email).filter(Boolean);
            void navigator.clipboard.writeText(lines.join("\n"));
            setStatus(`Copied ${lines.length} active member emails.`);
          }}
        >
          Copy active emails
        </button>
        <button
          type="button"
          className="rounded-sm border border-[#b78d4b80] px-4 py-2 text-sm text-[#3b3024]"
          onClick={() => {
            const rows = users.filter((user) => user.role === "MEMBER" && user.subscription?.status === "ACTIVE");
            const lines = rows.map((user) => user.profile?.phone?.trim()).filter((phone): phone is string => Boolean(phone));
            void navigator.clipboard.writeText(lines.join("\n"));
            setStatus(`Copied ${lines.length} active member phone numbers.`);
          }}
        >
          Copy active phones
        </button>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className={fieldClass}
        >
          <option value="ALL">All roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <section className="overflow-hidden rounded-sm border border-[#d7b67666] bg-white">
        <table className="w-full text-left text-sm text-[#3b3024]">
          <thead className="bg-[#fff6e8]">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Subscription</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-[#6f6251]">
                  No members match that search.
                </td>
              </tr>
            ) : null}
            {users.map((user) => (
              <Fragment key={user.id}>
              <tr className="border-t border-[#d7b67633] align-top">
                <td className="p-3">
                  <input
                    value={user.name ?? ""}
                    onChange={(event) => setUsers((prev) => prev.map((row) => row.id === user.id ? { ...row, name: event.target.value, profile: { ...memberProfileFromRecord(row.profile), ...row.profile, name: event.target.value } } : row))}
                    className="w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2"
                  />
                </td>
                <td className="p-3">
                  <input
                    value={user.email}
                    onChange={(event) => setUsers((prev) => prev.map((row) => row.id === user.id ? { ...row, email: event.target.value } : row))}
                    className="w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2"
                  />
                </td>
                <td className="p-3">
                  <input
                    value={user.profile?.phone ?? ""}
                    onChange={(event) =>
                      setUsers((prev) =>
                        prev.map((row) =>
                          row.id === user.id
                            ? { ...row, profile: { ...memberProfileFromRecord(row.profile), ...row.profile, phone: event.target.value } }
                            : row,
                        ),
                      )
                    }
                    placeholder="Phone"
                    className="w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2"
                  />
                </td>
                <td className="p-3">
                  <select
                    value={user.role}
                    onChange={(event) => setUsers((prev) => prev.map((row) => row.id === user.id ? { ...row, role: event.target.value as UserRecord["role"] } : row))}
                    className="w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2"
                  >
                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <div className="grid gap-2">
                    <select
                      value={user.subscription?.tier ?? "BASIC"}
                      onChange={(event) => setUsers((prev) => prev.map((row) => row.id === user.id ? { ...row, subscription: { tier: event.target.value as "BASIC" | "PREMIUM", status: row.subscription?.status ?? "INACTIVE" } } : row))}
                      className="w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2"
                    >
                      {tiers.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
                    </select>
                    <select
                      value={user.subscription?.status ?? "INACTIVE"}
                      onChange={(event) => setUsers((prev) => prev.map((row) => row.id === user.id ? { ...row, subscription: { tier: row.subscription?.tier ?? "BASIC", status: event.target.value as UserRecord["subscription"]["status"] } } : row))}
                      className="w-full rounded-sm border border-[#b78d4b35] bg-[#fffaf4] p-2"
                    >
                      {subStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setOpenProfileId((current) => current === user.id ? null : user.id)} className="rounded-sm border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]">
                      {openProfileId === user.id ? "Hide profile" : "Profile"}
                    </button>
                    <button onClick={() => void updateUser(user)} className="rounded-sm border border-[#b78d4b80] px-3 py-1.5 text-xs text-[#3b3024]">Save</button>
                    <button onClick={() => void deleteUser(user.id)} className="rounded-sm border border-[#d07b7b80] px-3 py-1.5 text-xs text-[#7c2c2c]">Delete</button>
                  </div>
                </td>
              </tr>
              {openProfileId === user.id ? (
                <tr className="border-t border-[#d7b67622] bg-[#fffaf4]">
                  <td colSpan={6} className="p-4">
                    <MemberProfileFields
                      inputClassName={fieldClass}
                      value={memberProfileFromRecord({ ...user.profile, name: user.name ?? "" })}
                      onChange={(next) =>
                        setUsers((prev) =>
                          prev.map((row) => (row.id === user.id ? { ...row, name: next.name, profile: next } : row)),
                        )
                      }
                    />
                  </td>
                </tr>
              ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>

      {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}

      {createOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#14100bb3] p-4"
          onClick={closeCreate}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-title"
            className="w-full max-w-lg rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="create-user-title" className="font-serif text-2xl text-[#1f1a15]">Add user</h2>
                <p className="mt-1 text-sm text-[#6f6251]">The form clears after the account is created.</p>
              </div>
              <button
                type="button"
                onClick={closeCreate}
                className="rounded-sm border border-[#b78d4b80] px-3 py-1 text-xs tracking-[0.14em] text-[#3b3024]"
              >
                CLOSE
              </button>
            </div>
            <form className="mt-5 grid gap-3" onSubmit={(event) => void createUser(event)}>
              <input
                value={createForm.name}
                onChange={(event) => setCreateForm((form) => ({ ...form, name: event.target.value }))}
                placeholder="Name"
                className={fieldClass}
              />
              <input
                value={createForm.email}
                onChange={(event) => setCreateForm((form) => ({ ...form, email: event.target.value }))}
                type="email"
                placeholder="Email"
                required
                className={fieldClass}
              />
              <input
                value={createForm.password}
                onChange={(event) => setCreateForm((form) => ({ ...form, password: event.target.value }))}
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                required
                className={fieldClass}
              />
              <select
                value={createForm.role}
                onChange={(event) => setCreateForm((form) => ({ ...form, role: event.target.value }))}
                className={fieldClass}
              >
                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <select
                value={createForm.subscriptionTier}
                onChange={(event) => setCreateForm((form) => ({ ...form, subscriptionTier: event.target.value }))}
                className={fieldClass}
              >
                {tiers.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
              </select>
              <select
                value={createForm.subscriptionStatus}
                onChange={(event) => setCreateForm((form) => ({ ...form, subscriptionStatus: event.target.value }))}
                className={fieldClass}
              >
                {subStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {createMessage ? <p className="text-sm text-[#8f6f3e]">{createMessage}</p> : null}
              <button
                type="submit"
                disabled={creating || createMessage === "User created."}
                className="rounded-sm bg-[#b78d4b] px-5 py-2.5 text-sm text-white disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create user"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
