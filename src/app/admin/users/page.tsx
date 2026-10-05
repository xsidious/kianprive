"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MemberProfileFields } from "@/components/account/MemberProfileFields";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  ChangeList,
  ConfirmDialog,
  Field,
  NoticeToast,
  PeopleHeader,
  PersonList,
  PersonRow,
  StatGrid,
  TextInput,
  changeLine,
  type ChangeLine,
} from "@/components/admin/people-ui";
import { adminBtnGhost, adminBtnPrimary, adminInput, adminSelect } from "@/components/admin/ui";
import { memberProfileFromRecord, type MemberProfileDraft } from "@/lib/account/member-profile";

type NetworkProfile = {
  id: string;
  type: "CLINICAL" | "BRAND" | "BOTH" | "AMBASSADOR" | "PROVIDER";
  status: string;
  displayName: string;
  legalName: string | null;
  specialty: string | null;
  phone: string | null;
  partnerCode: string;
  defaultServiceCommissionPct: number | string;
  defaultProductCommissionPct: number | string;
  createdAt: string;
};

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  role: "GUEST" | "MEMBER" | "EDITOR" | "OPERATIONS" | "ADMIN" | "PARTNER" | "AMBASSADOR" | "PROVIDER";
  createdAt?: string;
  subscription?: { tier: "BASIC" | "PREMIUM"; status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELED" } | null;
  profile?: Partial<MemberProfileDraft> | null;
  partnerProfiles?: NetworkProfile[];
};

type UserDraft = {
  name: string;
  email: string;
  role: UserRecord["role"];
  tier: "BASIC" | "PREMIUM";
  status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  profile: MemberProfileDraft;
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

const profileLabels: { key: keyof MemberProfileDraft; label: string }[] = [
  { key: "phone", label: "Phone" },
  { key: "preferredContact", label: "Preferred contact" },
  { key: "company", label: "Company" },
  { key: "dateOfBirth", label: "Date of birth" },
  { key: "sexAtBirth", label: "Sex at birth" },
  { key: "addressLine1", label: "Street" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "postalCode", label: "Postal code" },
  { key: "primaryCarePhysician", label: "Primary care physician" },
  { key: "medicalConditions", label: "Medical conditions" },
  { key: "allergies", label: "Allergies" },
  { key: "medications", label: "Medications" },
  { key: "supplements", label: "Supplements" },
  { key: "pregnancyStatus", label: "Pregnancy status" },
  { key: "emergencyContact", label: "Emergency contact" },
  { key: "emergencyRelationship", label: "Emergency relationship" },
  { key: "emergencyPhone", label: "Emergency phone" },
];

function toDraft(user: UserRecord): UserDraft {
  const profile = memberProfileFromRecord({ ...user.profile, name: user.name ?? "" });
  return {
    name: user.name ?? "",
    email: user.email,
    role: user.role,
    tier: user.subscription?.tier ?? "BASIC",
    status: user.subscription?.status ?? "INACTIVE",
    profile,
  };
}

function userChanges(before: UserDraft, after: UserDraft): ChangeLine[] {
  const lines = [
    changeLine("Name", before.name, after.name),
    changeLine("Email", before.email, after.email),
    changeLine("Role", before.role, after.role),
    changeLine("Subscription", before.tier, after.tier),
    changeLine("Subscription status", before.status, after.status),
    ...profileLabels.map((field) => changeLine(field.label, before.profile[field.key], after.profile[field.key])),
  ];
  return lines.filter((line): line is ChangeLine => line != null);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<UserDraft | null>(null);
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleDraft, setRoleDraft] = useState({
    kind: "ambassador" as "partner" | "ambassador" | "practitioner",
    displayName: "",
    phone: "",
    specialty: "",
    legalName: "",
    partnerType: "CLINICAL",
    servicePct: "20",
    productPct: "10",
  });
  const [roleConfirm, setRoleConfirm] = useState<"add" | "remove" | null>(null);
  const [removeProfileId, setRemoveProfileId] = useState<string | null>(null);

  async function loadUsers(search = query, role = roleFilter) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (role !== "ALL") params.set("role", role);
    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        setNotice({ text: "Could not load users.", error: true });
        return;
      }
      const payload = (await res.json()) as { users: UserRecord[] };
      setUsers(payload.users);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadUsers(query, roleFilter);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query, roleFilter]);

  const selected = users.find((user) => user.id === selectedId) ?? null;
  const changes = baseline && draft ? userChanges(baseline, draft) : [];
  const activeMembers = useMemo(
    () => users.filter((user) => user.role === "MEMBER" && user.subscription?.status === "ACTIVE"),
    [users],
  );

  function openUser(user: UserRecord) {
    const next = toDraft(user);
    setSelectedId(user.id);
    setBaseline(next);
    setDraft(next);
    setReviewOpen(false);
    setDeleteOpen(false);
    setRoleConfirm(null);
    setRoleDraft({
      kind: "ambassador",
      displayName: user.name || "",
      phone: user.profile?.phone || "",
      specialty: "",
      legalName: "",
      partnerType: "CLINICAL",
      servicePct: "20",
      productPct: "10",
    });
  }

  function hasKind(user: UserRecord, kind: "partner" | "ambassador" | "practitioner") {
    return (user.partnerProfiles ?? []).some((profile) => {
      if (kind === "ambassador") return profile.type === "AMBASSADOR";
      if (kind === "practitioner") return profile.type === "PROVIDER";
      return profile.type === "CLINICAL" || profile.type === "BRAND" || profile.type === "BOTH";
    });
  }

  async function addNetworkRole() {
    if (!selected) return;
    setSaving(true);
    const type = roleDraft.kind === "ambassador" ? "AMBASSADOR" : roleDraft.kind === "practitioner" ? "PROVIDER" : roleDraft.partnerType;
    const response = await fetch(`/api/admin/users/${selected.id}/network`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        displayName: roleDraft.displayName || selected.name || "Member",
        phone: roleDraft.phone || undefined,
        specialty: roleDraft.specialty || undefined,
        legalName: roleDraft.legalName || undefined,
        status: "ACTIVE",
        defaultServiceCommissionPct: Number(roleDraft.servicePct || 20),
        defaultProductCommissionPct: Number(roleDraft.productPct || 10),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setNotice({ text: payload.error || "Could not add that role.", error: true });
      return;
    }
    setRoleConfirm(null);
    setNotice({ text: `${roleDraft.displayName || selected.email} now also has the ${roleDraft.kind} role.` });
    await loadUsers();
  }

  async function removeNetworkRole() {
    if (!selected || !removeProfileId) return;
    setSaving(true);
    const response = await fetch(`/api/admin/users/${selected.id}/network?profileId=${removeProfileId}`, { method: "DELETE" });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setNotice({ text: payload.error || "Could not remove that role.", error: true });
      return;
    }
    setRoleConfirm(null);
    setRemoveProfileId(null);
    setNotice({ text: "Role removed. The login account is still here." });
    await loadUsers();
  }

  function closeUser() {
    setSelectedId(null);
    setBaseline(null);
    setDraft(null);
    setReviewOpen(false);
    setDeleteOpen(false);
  }

  function openCreate() {
    setCreateForm(emptyCreateForm);
    setCreateError("");
    setCreateOpen(true);
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError("");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setCreateError(payload?.error || "Failed to create user.");
      setCreating(false);
      return;
    }
    setCreating(false);
    setCreateOpen(false);
    setCreateForm(emptyCreateForm);
    setNotice({ text: `${createForm.name || createForm.email} added.` });
    await loadUsers();
  }

  async function saveUser() {
    if (!selected || !draft) return;
    setSaving(true);
    const response = await fetch(`/api/admin/users/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        email: draft.email,
        role: draft.role,
        subscriptionTier: draft.tier,
        subscriptionStatus: draft.status,
        profile: { ...draft.profile, name: draft.name },
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setNotice({ text: "Could not update that user.", error: true });
      return;
    }
    setReviewOpen(false);
    closeUser();
    setNotice({ text: `${draft.name || draft.email} updated.` });
    await loadUsers();
  }

  async function removeUser() {
    if (!selected || !draft) return;
    setSaving(true);
    const response = await fetch(`/api/admin/users/${selected.id}`, { method: "DELETE" });
    setSaving(false);
    if (!response.ok) {
      setNotice({ text: "Could not delete that user.", error: true });
      return;
    }
    const name = draft.name || draft.email;
    closeUser();
    setNotice({ text: `${name} deleted.` });
    await loadUsers();
  }

  function copyLines(lines: string[], label: string) {
    void navigator.clipboard.writeText(lines.join("\n"));
    setNotice({ text: `Copied ${lines.length} ${label}.` });
  }

  return (
    <div className="space-y-6">
      <PeopleHeader
        eyebrow="Directory"
        title="Users"
        description="Search an account, open it to see everything, then add, update, or remove it from a popup."
        action={
          <button type="button" onClick={openCreate} className={adminBtnPrimary}>
            Add user
          </button>
        }
      />

      <StatGrid
        items={[
          { label: "Showing", value: String(users.length) },
          { label: "Active members", value: String(activeMembers.length), hint: "In this search" },
        ]}
      />

      <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          className={`${adminInput} min-w-[240px] flex-1`}
        />
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className={adminSelect}>
          <option value="ALL">All roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <button
          type="button"
          className={adminBtnGhost}
          onClick={() => copyLines(activeMembers.map((user) => user.email).filter(Boolean), "active member emails")}
        >
          Copy emails
        </button>
        <button
          type="button"
          className={adminBtnGhost}
          onClick={() =>
            copyLines(
              activeMembers.map((user) => user.profile?.phone?.trim()).filter((phone): phone is string => Boolean(phone)),
              "active member phones",
            )
          }
        >
          Copy phones
        </button>
      </div>

      <PersonList empty={loading ? "Loading people…" : users.length ? undefined : "No people match that search."}>
        {users.map((user) => (
          <PersonRow
            key={user.id}
            name={user.name || "Unnamed"}
            badge={user.role}
            meta={`${user.email} · ${user.profile?.phone || "No phone"} · ${user.subscription?.tier ?? "BASIC"} ${user.subscription?.status ?? "INACTIVE"}${user.partnerProfiles?.length ? ` · ${user.partnerProfiles.map((profile) => profile.type).join(", ")}` : ""}`}
            onOpen={() => openUser(user)}
          />
        ))}
      </PersonList>

      <AdminModal
        open={createOpen}
        title="Add user"
        eyebrow="New account"
        description="The form closes after the account is created."
        onClose={() => {
          if (!creating) setCreateOpen(false);
        }}
        footer={
          <>
            <button type="button" className={adminBtnGhost} onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </button>
            <button type="submit" form="create-user-form" className={adminBtnPrimary} disabled={creating}>
              {creating ? "Creating…" : "Create user"}
            </button>
          </>
        }
      >
        <form id="create-user-form" className="grid gap-3" onSubmit={(event) => void createUser(event)}>
          <Field label="Name">
            <TextInput value={createForm.name} onChange={(event) => setCreateForm((form) => ({ ...form, name: event.target.value }))} required />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={createForm.email} onChange={(event) => setCreateForm((form) => ({ ...form, email: event.target.value }))} required />
          </Field>
          <Field label="Password">
            <TextInput type="password" autoComplete="new-password" value={createForm.password} onChange={(event) => setCreateForm((form) => ({ ...form, password: event.target.value }))} required />
          </Field>
          <Field label="Role">
            <select value={createForm.role} onChange={(event) => setCreateForm((form) => ({ ...form, role: event.target.value }))} className={adminSelect}>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Subscription">
              <select value={createForm.subscriptionTier} onChange={(event) => setCreateForm((form) => ({ ...form, subscriptionTier: event.target.value }))} className={adminSelect}>
                {tiers.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={createForm.subscriptionStatus} onChange={(event) => setCreateForm((form) => ({ ...form, subscriptionStatus: event.target.value }))} className={adminSelect}>
                {subStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </Field>
          </div>
          {createError ? <p className="text-sm text-[#7c2c2c]">{createError}</p> : null}
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(selected && draft)}
        wide
        title={draft?.name || selected?.email || "User"}
        eyebrow={draft?.role}
        description={selected?.email}
        onClose={() => {
          if (reviewOpen || deleteOpen || roleConfirm || saving) return;
          closeUser();
        }}
        footer={
          <>
            <button type="button" className="text-sm text-[#7c2c2c]" onClick={() => setDeleteOpen(true)}>
              Delete
            </button>
            <button
              type="button"
              className={adminBtnPrimary}
              onClick={() => {
                if (!changes.length) {
                  setNotice({ text: "Nothing has changed." });
                  return;
                }
                setReviewOpen(true);
              }}
            >
              Review changes
            </button>
          </>
        }
      >
        {draft && selected ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#fff8ef] p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Account role</p>
                <p className="mt-1 text-lg text-[#1f1a15]">{draft.role}</p>
              </div>
              <div className="rounded-xl bg-[#fff8ef] p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Member since</p>
                <p className="mt-1 text-lg text-[#1f1a15]">{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}</p>
              </div>
              <div className="rounded-xl bg-[#fff8ef] p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Subscription</p>
                <p className="mt-1 text-lg text-[#1f1a15]">{draft.tier} · {draft.status}</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#efe6d8] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Roles on this account</p>
              <p className="mt-1 text-sm text-[#6f6251]">A member can also be a partner, ambassador, and practitioner. Adding a role keeps this login.</p>
              <div className="mt-3 space-y-2">
                {(selected.partnerProfiles ?? []).length ? (
                  selected.partnerProfiles?.map((profile) => (
                    <div key={profile.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-[#fff8ef] px-3 py-3 text-sm">
                      <div>
                        <p className="font-medium text-[#1f1a15]">{profile.displayName}</p>
                        <p className="text-[#6f6251]">
                          {profile.type} · {profile.status} · {profile.partnerCode}
                          {profile.specialty ? ` · ${profile.specialty}` : ""}
                          {profile.phone ? ` · ${profile.phone}` : ""}
                        </p>
                        <p className="text-xs text-[#8f6f3e]">
                          Services {String(profile.defaultServiceCommissionPct)}% · Products {String(profile.defaultProductCommissionPct)}%
                          {profile.legalName ? ` · ${profile.legalName}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-[#7c2c2c]"
                        onClick={() => {
                          setRemoveProfileId(profile.id);
                          setRoleConfirm("remove");
                        }}
                      >
                        Remove role
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#6f6251]">No partner, ambassador, or practitioner role yet.</p>
                )}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Role to add">
                  <select className={adminSelect} value={roleDraft.kind} onChange={(event) => setRoleDraft({ ...roleDraft, kind: event.target.value as typeof roleDraft.kind })}>
                    <option value="ambassador" disabled={hasKind(selected, "ambassador")}>Ambassador</option>
                    <option value="practitioner" disabled={hasKind(selected, "practitioner")}>Practitioner</option>
                    <option value="partner" disabled={hasKind(selected, "partner")}>Partner</option>
                  </select>
                </Field>
                <Field label="Display name">
                  <TextInput value={roleDraft.displayName} onChange={(event) => setRoleDraft({ ...roleDraft, displayName: event.target.value })} />
                </Field>
                <Field label="Phone">
                  <TextInput value={roleDraft.phone} onChange={(event) => setRoleDraft({ ...roleDraft, phone: event.target.value })} />
                </Field>
                {roleDraft.kind !== "ambassador" ? (
                  <Field label="Specialty">
                    <TextInput value={roleDraft.specialty} onChange={(event) => setRoleDraft({ ...roleDraft, specialty: event.target.value })} />
                  </Field>
                ) : null}
                {roleDraft.kind === "partner" ? (
                  <>
                    <Field label="Legal name">
                      <TextInput value={roleDraft.legalName} onChange={(event) => setRoleDraft({ ...roleDraft, legalName: event.target.value })} />
                    </Field>
                    <Field label="Partner type">
                      <select className={adminSelect} value={roleDraft.partnerType} onChange={(event) => setRoleDraft({ ...roleDraft, partnerType: event.target.value })}>
                        <option value="CLINICAL">Clinical</option>
                        <option value="BRAND">Brand</option>
                        <option value="BOTH">Both</option>
                      </select>
                    </Field>
                  </>
                ) : null}
                {roleDraft.kind !== "ambassador" ? (
                  <Field label="Service %">
                    <TextInput type="number" min={0} max={100} value={roleDraft.servicePct} onChange={(event) => setRoleDraft({ ...roleDraft, servicePct: event.target.value })} />
                  </Field>
                ) : null}
                <Field label="Product %">
                  <TextInput type="number" min={0} max={100} value={roleDraft.productPct} onChange={(event) => setRoleDraft({ ...roleDraft, productPct: event.target.value })} />
                </Field>
              </div>
              <button
                type="button"
                className={`${adminBtnPrimary} mt-3`}
                disabled={hasKind(selected, roleDraft.kind)}
                onClick={() => setRoleConfirm("add")}
              >
                Add this role
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <TextInput value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value, profile: { ...draft.profile, name: event.target.value } })} />
              </Field>
              <Field label="Email">
                <TextInput type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
              </Field>
              <Field label="Role">
                <select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as UserDraft["role"] })} className={adminSelect}>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </Field>
              <Field label="Subscription">
                <select value={draft.tier} onChange={(event) => setDraft({ ...draft, tier: event.target.value as UserDraft["tier"] })} className={adminSelect}>
                  {tiers.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
                </select>
              </Field>
              <Field label="Subscription status">
                <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as UserDraft["status"] })} className={adminSelect}>
                  {subStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </Field>
            </div>
            <MemberProfileFields
              includeName={false}
              inputClassName={adminInput}
              value={draft.profile}
              onChange={(profile) => setDraft({ ...draft, name: profile.name || draft.name, profile })}
            />
          </div>
        ) : null}
      </AdminModal>

      <ConfirmDialog
        open={reviewOpen}
        title="Save these changes?"
        message="Review what will be updated before it is saved."
        confirmLabel="Save changes"
        busy={saving}
        onCancel={() => setReviewOpen(false)}
        onConfirm={() => void saveUser()}
      >
        <ChangeList changes={changes} />
      </ConfirmDialog>

      <ConfirmDialog
        open={roleConfirm === "add"}
        title="Add this role?"
        message={`${selected?.name || selected?.email} keeps the ${draft?.role ?? "current"} login and also becomes a ${roleDraft.kind}.`}
        confirmLabel="Add role"
        busy={saving}
        onCancel={() => setRoleConfirm(null)}
        onConfirm={() => void addNetworkRole()}
      />
      <ConfirmDialog
        open={roleConfirm === "remove"}
        title="Remove this role?"
        message="This removes the partner, ambassador, or practitioner profile only. The person's login stays."
        confirmLabel="Remove role"
        danger
        busy={saving}
        onCancel={() => {
          setRoleConfirm(null);
          setRemoveProfileId(null);
        }}
        onConfirm={() => void removeNetworkRole()}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete this user?"
        message={`${draft?.name || selected?.email || "This person"} and their login will be removed. This cannot be undone.`}
        confirmLabel="Delete user"
        danger
        busy={saving}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void removeUser()}
      />

      <NoticeToast notice={notice} onDone={() => setNotice(null)} />
    </div>
  );
}
