"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  ChangeList,
  ConfirmDialog,
  Field,
  NoticeToast,
  PeopleHeader,
  PersonList,
  PersonRow,
  RateList,
  StatGrid,
  TextInput,
  changeLine,
  prettySlug,
  type ChangeLine,
} from "@/components/admin/people-ui";
import { adminBtnGhost, adminBtnPrimary, adminInput, adminSelect } from "@/components/admin/ui";
import { parseCommissionOverride } from "@/lib/commission-parse";

const SERVICE_OPTIONS = [
  "telemedicine",
  "icoone-laser",
  "facial-aesthetics",
  "nutrition",
  "iv-therapy",
  "comprehensive-bloodwork",
  "lab-panel-essential",
  "lab-panel-metabolic",
  "lab-panel-hormone",
  "lab-panel-longevity",
  "lab-panel-executive",
  "lab-panel-brain",
  "lab-panel-weight",
  "lab-panel-hormone-optimization",
  "lab-panel-cardio",
  "physician-visit",
  "beauty-hair-nails",
  "inbody-scan",
  "microneedling-with-exosomes",
  "korean-organic-skincare",
  "glp1-peptides",
  "mindtap",
];

const partnerTypes = ["CLINICAL", "BRAND", "BOTH"] as const;
const partnerStatuses = ["INVITED", "ACTIVE", "SUSPENDED"] as const;

type PartnerRow = {
  id: string;
  displayName: string;
  legalName?: string | null;
  specialty: string | null;
  phone?: string | null;
  type: string;
  status: string;
  partnerCode: string;
  defaultServiceCommissionPct: number | string;
  defaultProductCommissionPct: number | string;
  user: { email: string; name: string | null; role?: string };
  createdAt?: string;
  serviceAssignments: { serviceSlug: string; active: boolean; commissionPct: number | string | null }[];
  productAssignments: { productId: string; active: boolean; commissionPct: number | string | null }[];
  _count: { bookings: number; commissionEntries: number };
};

type ProductOption = { id: string; title: string; slug: string };

type PartnerDraft = {
  displayName: string;
  legalName: string;
  specialty: string;
  phone: string;
  type: (typeof partnerTypes)[number];
  status: (typeof partnerStatuses)[number];
  defaultServicePct: string;
  defaultProductPct: string;
  serviceSlugs: string[];
  serviceRates: Record<string, string>;
  productIds: string[];
  productRates: Record<string, string>;
};

const emptyCreate = {
  name: "",
  email: "",
  password: "",
  displayName: "",
  legalName: "",
  specialty: "",
  phone: "",
  type: "CLINICAL",
  status: "INVITED",
  servicePct: "20",
  productPct: "10",
};

function toDraft(partner: PartnerRow): PartnerDraft {
  const serviceRates: Record<string, string> = {};
  for (const assignment of partner.serviceAssignments) {
    if (assignment.commissionPct != null) serviceRates[assignment.serviceSlug] = String(assignment.commissionPct);
  }
  const productRates: Record<string, string> = {};
  for (const assignment of partner.productAssignments) {
    if (assignment.commissionPct != null) productRates[assignment.productId] = String(assignment.commissionPct);
  }
  const type = partnerTypes.includes(partner.type as PartnerDraft["type"]) ? (partner.type as PartnerDraft["type"]) : "CLINICAL";
  const status = partnerStatuses.includes(partner.status as PartnerDraft["status"]) ? (partner.status as PartnerDraft["status"]) : "INVITED";
  return {
    displayName: partner.displayName,
    legalName: partner.legalName ?? "",
    specialty: partner.specialty ?? "",
    phone: partner.phone ?? "",
    type,
    status,
    defaultServicePct: String(partner.defaultServiceCommissionPct),
    defaultProductPct: String(partner.defaultProductCommissionPct),
    serviceSlugs: partner.serviceAssignments.filter((assignment) => assignment.active).map((assignment) => assignment.serviceSlug),
    serviceRates,
    productIds: partner.productAssignments.filter((assignment) => assignment.active).map((assignment) => assignment.productId),
    productRates,
  };
}

function listLabel(values: string[]) {
  return values.length ? [...values].sort().join(", ") : "None";
}

function partnerChanges(before: PartnerDraft, after: PartnerDraft, products: ProductOption[]): ChangeLine[] {
  const productName = (id: string) => products.find((product) => product.id === id)?.title ?? id;
  const lines = [
    changeLine("Display name", before.displayName, after.displayName),
    changeLine("Legal name", before.legalName, after.legalName),
    changeLine("Specialty", before.specialty, after.specialty),
    changeLine("Phone", before.phone, after.phone),
    changeLine("Type", before.type, after.type),
    changeLine("Status", before.status, after.status),
    changeLine("Default service %", before.defaultServicePct, after.defaultServicePct),
    changeLine("Default product %", before.defaultProductPct, after.defaultProductPct),
    changeLine("Services", listLabel(before.serviceSlugs.map(prettySlug)), listLabel(after.serviceSlugs.map(prettySlug))),
    changeLine("Products", listLabel(before.productIds.map(productName)), listLabel(after.productIds.map(productName))),
  ];
  for (const slug of new Set([...before.serviceSlugs, ...after.serviceSlugs])) {
    if (!after.serviceSlugs.includes(slug) && !before.serviceSlugs.includes(slug)) continue;
    lines.push(changeLine(`${prettySlug(slug)} rate`, before.serviceRates[slug] || "default", after.serviceSlugs.includes(slug) ? after.serviceRates[slug] || "default" : "removed"));
  }
  for (const id of new Set([...before.productIds, ...after.productIds])) {
    lines.push(changeLine(`${productName(id)} rate`, before.productRates[id] || "default", after.productIds.includes(id) ? after.productRates[id] || "default" : "removed"));
  }
  return lines.filter((line): line is ChangeLine => line != null);
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<PartnerDraft | null>(null);
  const [draft, setDraft] = useState<PartnerDraft | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [partnersRes, productsRes] = await Promise.all([
      fetch("/api/admin/partners"),
      fetch("/api/admin/commerce/products"),
    ]);
    setLoading(false);
    if (!partnersRes.ok) {
      setNotice({ text: "Could not load partners.", error: true });
      return;
    }
    const payload = (await partnersRes.json()) as { partners: PartnerRow[] };
    setPartners(payload.partners);
    if (productsRes.ok) {
      const productPayload = (await productsRes.json()) as { products?: ProductOption[] };
      setProducts(productPayload.products ?? (productPayload as unknown as ProductOption[]));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return partners;
    return partners.filter((partner) =>
      [partner.displayName, partner.user.email, partner.partnerCode, partner.specialty ?? ""].join(" ").toLowerCase().includes(needle),
    );
  }, [partners, query]);

  const selected = partners.find((partner) => partner.id === selectedId) ?? null;
  const changes = baseline && draft ? partnerChanges(baseline, draft, products) : [];
  const activeCount = partners.filter((partner) => partner.status === "ACTIVE").length;

  function openPartner(partner: PartnerRow) {
    const next = toDraft(partner);
    setSelectedId(partner.id);
    setBaseline(next);
    setDraft(next);
    setReviewOpen(false);
    setDeleteOpen(false);
  }

  function closePartner() {
    setSelectedId(null);
    setBaseline(null);
    setDraft(null);
    setReviewOpen(false);
    setDeleteOpen(false);
  }

  async function createPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        displayName: createForm.displayName,
        legalName: createForm.legalName || undefined,
        type: createForm.type,
        specialty: createForm.specialty || undefined,
        phone: createForm.phone || undefined,
        defaultServiceCommissionPct: Number(createForm.servicePct || 20),
        defaultProductCommissionPct: Number(createForm.productPct || 10),
        status: createForm.status,
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setCreating(false);
    if (!res.ok) {
      setCreateError(payload.error ?? "Failed to create partner.");
      return;
    }
    const name = createForm.displayName;
    setCreateOpen(false);
    setCreateForm(emptyCreate);
    setNotice({ text: `${name} added.` });
    await load();
  }

  async function savePartner() {
    if (!selected || !draft) return;
    setSaving(true);
    const serviceDefault = Number(draft.defaultServicePct);
    const productDefault = Number(draft.defaultProductPct);
    const res = await fetch(`/api/admin/partners/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: draft.displayName,
        legalName: draft.legalName || null,
        specialty: draft.specialty || null,
        phone: draft.phone || null,
        type: draft.type,
        status: draft.status,
        defaultServiceCommissionPct: Number.isFinite(serviceDefault) ? serviceDefault : 20,
        defaultProductCommissionPct: Number.isFinite(productDefault) ? productDefault : 10,
        serviceAssignments: draft.serviceSlugs.map((serviceSlug) => ({
          serviceSlug,
          active: true,
          commissionPct: parseCommissionOverride(draft.serviceRates[serviceSlug]),
        })),
        productAssignments: draft.productIds.map((productId) => ({
          productId,
          active: true,
          commissionPct: parseCommissionOverride(draft.productRates[productId]),
        })),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setNotice({ text: "Could not update that partner.", error: true });
      return;
    }
    setReviewOpen(false);
    closePartner();
    setNotice({ text: `${draft.displayName} updated.` });
    await load();
  }

  async function removePartner() {
    if (!selected || !draft) return;
    setSaving(true);
    const res = await fetch(`/api/admin/partners/${selected.id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      setNotice({ text: "Could not delete that partner.", error: true });
      return;
    }
    const name = draft.displayName;
    closePartner();
    setNotice({ text: `${name} deleted.` });
    await load();
  }

  return (
    <div className="space-y-6">
      <PeopleHeader
        eyebrow="Network"
        title="Partners"
        description="Open a partner to see their account, rates, and assignments. Add someone from the popup, and confirm before anything is saved or deleted."
        links={
          <>
            <Link href="/admin/partners/payouts" className={adminBtnGhost}>Payouts</Link>
            <Link href="/admin/partners/network" className={adminBtnGhost}>Network</Link>
            <Link href="/admin/partners/guidelines" className={adminBtnGhost}>Guidelines</Link>
            <Link href="/admin/partners/commissions" className={adminBtnGhost}>Commissions</Link>
          </>
        }
        action={
          <button type="button" className={adminBtnPrimary} onClick={() => { setCreateForm(emptyCreate); setCreateError(""); setCreateOpen(true); }}>
            Add partner
          </button>
        }
      />

      <StatGrid
        items={[
          { label: "Partners", value: String(partners.length) },
          { label: "Active", value: String(activeCount) },
          { label: "Showing", value: String(visible.length), hint: query ? "Matching search" : "All partners" },
        ]}
      />

      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, or code" className={adminInput} />

      <PersonList empty={loading ? "Loading partners…" : visible.length ? undefined : "No partners match that search."}>
        {visible.map((partner) => (
          <PersonRow
            key={partner.id}
            name={partner.displayName}
            badge={partner.status}
            meta={`${partner.user.email} · ${partner.user.name || "No account name"} · ${partner.phone || "No phone"} · ${partner.partnerCode} · ${partner.type} · ${String(partner.defaultServiceCommissionPct)}% / ${String(partner.defaultProductCommissionPct)}% · ${partner._count.bookings} bookings`}
            onOpen={() => openPartner(partner)}
          />
        ))}
      </PersonList>

      <AdminModal
        open={createOpen}
        title="Add partner"
        eyebrow="New account"
        description="The form closes after the account is created."
        onClose={() => { if (!creating) setCreateOpen(false); }}
        footer={
          <>
            <button type="button" className={adminBtnGhost} disabled={creating} onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" form="create-partner-form" className={adminBtnPrimary} disabled={creating}>{creating ? "Creating…" : "Create partner"}</button>
          </>
        }
      >
        <form id="create-partner-form" className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => void createPartner(event)}>
          <Field label="Account name"><TextInput required value={createForm.name} onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} /></Field>
          <Field label="Display name"><TextInput required value={createForm.displayName} onChange={(event) => setCreateForm({ ...createForm, displayName: event.target.value })} /></Field>
          <Field label="Login email"><TextInput required type="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} /></Field>
          <Field label="Temporary password"><TextInput required type="password" minLength={8} value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} /></Field>
          <Field label="Legal name"><TextInput value={createForm.legalName} onChange={(event) => setCreateForm({ ...createForm, legalName: event.target.value })} /></Field>
          <Field label="Specialty"><TextInput value={createForm.specialty} onChange={(event) => setCreateForm({ ...createForm, specialty: event.target.value })} /></Field>
          <Field label="Phone"><TextInput value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} /></Field>
          <Field label="Type">
            <select className={adminSelect} value={createForm.type} onChange={(event) => setCreateForm({ ...createForm, type: event.target.value })}>
              {partnerTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={adminSelect} value={createForm.status} onChange={(event) => setCreateForm({ ...createForm, status: event.target.value })}>
              {partnerStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </Field>
          <Field label="Service commission %"><TextInput type="number" min={0} max={100} value={createForm.servicePct} onChange={(event) => setCreateForm({ ...createForm, servicePct: event.target.value })} /></Field>
          <Field label="Product commission %"><TextInput type="number" min={0} max={100} value={createForm.productPct} onChange={(event) => setCreateForm({ ...createForm, productPct: event.target.value })} /></Field>
          {createError ? <p className="text-sm text-[#7c2c2c] sm:col-span-2">{createError}</p> : null}
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(selected && draft)}
        wide
        title={draft?.displayName || "Partner"}
        eyebrow={selected?.partnerCode}
        description={selected ? `${selected.user.email} · ${selected._count.bookings} bookings` : undefined}
        onClose={() => {
          if (reviewOpen || deleteOpen || saving) return;
          closePartner();
        }}
        footer={
          <>
            <button type="button" className="text-sm text-[#7c2c2c]" onClick={() => setDeleteOpen(true)}>Delete</button>
            <button type="button" className={adminBtnPrimary} onClick={() => { if (!changes.length) { setNotice({ text: "Nothing has changed." }); return; } setReviewOpen(true); }}>
              Review changes
            </button>
          </>
        }
      >
        {draft && selected ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Login</p><p className="mt-1 text-[#1f1a15]">{selected.user.email}</p><p className="text-xs text-[#6f6251]">{selected.user.role || "Account"} · {selected.user.name || "No name"}</p></div>
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Code</p><p className="mt-1 font-mono text-lg">{selected.partnerCode}</p></div>
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Added</p><p className="mt-1 text-lg">{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}</p><p className="text-xs text-[#6f6251]">{selected._count.bookings} bookings · {selected._count.commissionEntries} commissions</p></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Display name"><TextInput value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></Field>
              <Field label="Legal name"><TextInput value={draft.legalName} onChange={(event) => setDraft({ ...draft, legalName: event.target.value })} /></Field>
              <Field label="Specialty"><TextInput value={draft.specialty} onChange={(event) => setDraft({ ...draft, specialty: event.target.value })} /></Field>
              <Field label="Phone"><TextInput value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></Field>
              <Field label="Type">
                <select className={adminSelect} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as PartnerDraft["type"] })}>
                  {partnerTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className={adminSelect} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as PartnerDraft["status"] })}>
                  {partnerStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </Field>
              <Field label="Default service %"><TextInput type="number" min={0} max={100} step="0.01" value={draft.defaultServicePct} onChange={(event) => setDraft({ ...draft, defaultServicePct: event.target.value })} /></Field>
              <Field label="Default product %"><TextInput type="number" min={0} max={100} step="0.01" value={draft.defaultProductPct} onChange={(event) => setDraft({ ...draft, defaultProductPct: event.target.value })} /></Field>
            </div>
            <p className="text-xs text-[#6f6251]">Leave an item % blank to use the defaults. Enter a value, including 0, to override that item only.</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <RateList
                title="Services"
                rows={SERVICE_OPTIONS.map((slug) => ({
                  id: slug,
                  label: prettySlug(slug),
                  checked: draft.serviceSlugs.includes(slug),
                  onChecked: (checked) => setDraft({ ...draft, serviceSlugs: checked ? [...draft.serviceSlugs, slug] : draft.serviceSlugs.filter((item) => item !== slug) }),
                  rate: draft.serviceRates[slug] ?? "",
                  onRate: (next) => setDraft({ ...draft, serviceRates: { ...draft.serviceRates, [slug]: next } }),
                  defaultPct: draft.defaultServicePct,
                }))}
              />
              <RateList
                title="Products"
                rows={products.map((product) => ({
                  id: product.id,
                  label: product.title,
                  checked: draft.productIds.includes(product.id),
                  onChecked: (checked) => setDraft({ ...draft, productIds: checked ? [...draft.productIds, product.id] : draft.productIds.filter((id) => id !== product.id) }),
                  rate: draft.productRates[product.id] ?? "",
                  onRate: (next) => setDraft({ ...draft, productRates: { ...draft.productRates, [product.id]: next } }),
                  defaultPct: draft.defaultProductPct,
                }))}
              />
            </div>
          </div>
        ) : null}
      </AdminModal>

      <ConfirmDialog open={reviewOpen} title="Save these changes?" message="Review what will be updated before it is saved." confirmLabel="Save changes" busy={saving} onCancel={() => setReviewOpen(false)} onConfirm={() => void savePartner()}>
        <ChangeList changes={changes} />
      </ConfirmDialog>
      <ConfirmDialog open={deleteOpen} title="Delete this partner?" message={`${draft?.displayName || "This partner"} (${selected?.user.email ?? ""}) and their login will be removed. This cannot be undone.`} confirmLabel="Delete partner" danger busy={saving} onCancel={() => setDeleteOpen(false)} onConfirm={() => void removePartner()} />
      <NoticeToast notice={notice} onDone={() => setNotice(null)} />
    </div>
  );
}
