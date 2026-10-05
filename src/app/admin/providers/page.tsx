"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ClinicalIntakeShare } from "@/components/account/ClinicalIntakeQr";
import { BrandedQrCard } from "@/components/ambassador/BrandedQrCard";
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
import { adminBtnGhost, adminBtnPrimary, adminSelect, money } from "@/components/admin/ui";
import { parseCommissionOverride } from "@/lib/commission-parse";

type ProviderRow = {
  id: string;
  displayName: string;
  partnerCode: string;
  status: string;
  phone: string | null;
  specialty: string | null;
  defaultServiceCommissionPct: number | string;
  defaultProductCommissionPct: number | string;
  user: { email: string; name: string | null; role?: string };
  createdAt?: string;
  serviceAssignments: { serviceSlug: string; active: boolean; commissionPct: number | string | null }[];
  productAssignments: { productId: string; active: boolean; commissionPct: number | string | null }[];
  links: { book: string; home: string; services: string; shop: string; telemedicine: string; code: string };
  stats: { visitsMtd: number; completedVisits: number; totalBookings: number; eligibleCommission: number };
};

type ProductOption = { id: string; title: string; slug: string; isPrescription?: boolean };
const statuses = ["ACTIVE", "INVITED", "SUSPENDED"] as const;

type ProviderDraft = {
  displayName: string;
  phone: string;
  specialty: string;
  status: (typeof statuses)[number];
  defaultServicePct: string;
  defaultProductPct: string;
  serviceSlugs: string[];
  serviceRates: Record<string, string>;
  productRates: Record<string, string>;
};

const emptyCreate = {
  name: "",
  displayName: "",
  email: "",
  password: "",
  specialty: "",
  phone: "",
  servicePct: "20",
  productPct: "10",
  status: "ACTIVE",
};

function toDraft(provider: ProviderRow): ProviderDraft {
  const serviceRates: Record<string, string> = {};
  for (const assignment of provider.serviceAssignments) {
    if (assignment.commissionPct != null) serviceRates[assignment.serviceSlug] = String(assignment.commissionPct);
  }
  const productRates: Record<string, string> = {};
  for (const assignment of provider.productAssignments ?? []) {
    if (assignment.commissionPct != null) productRates[assignment.productId] = String(assignment.commissionPct);
  }
  const status = statuses.includes(provider.status as ProviderDraft["status"]) ? (provider.status as ProviderDraft["status"]) : "ACTIVE";
  return {
    displayName: provider.displayName,
    phone: provider.phone ?? "",
    specialty: provider.specialty ?? "",
    status,
    defaultServicePct: String(provider.defaultServiceCommissionPct),
    defaultProductPct: String(provider.defaultProductCommissionPct ?? 10),
    serviceSlugs: provider.serviceAssignments.filter((assignment) => assignment.active).map((assignment) => assignment.serviceSlug),
    serviceRates,
    productRates,
  };
}

function listLabel(values: string[]) {
  return values.length ? [...values].sort().join(", ") : "None";
}

function providerChanges(before: ProviderDraft, after: ProviderDraft, products: ProductOption[]): ChangeLine[] {
  const lines = [
    changeLine("Display name", before.displayName, after.displayName),
    changeLine("Phone", before.phone, after.phone),
    changeLine("Specialty", before.specialty, after.specialty),
    changeLine("Status", before.status, after.status),
    changeLine("Default visit %", before.defaultServicePct, after.defaultServicePct),
    changeLine("Default product %", before.defaultProductPct, after.defaultProductPct),
    changeLine("Services", listLabel(before.serviceSlugs.map(prettySlug)), listLabel(after.serviceSlugs.map(prettySlug))),
  ];
  for (const slug of new Set([...before.serviceSlugs, ...after.serviceSlugs])) {
    lines.push(changeLine(`${prettySlug(slug)} rate`, before.serviceRates[slug] || "default", after.serviceSlugs.includes(slug) ? after.serviceRates[slug] || "default" : "removed"));
  }
  for (const product of products.filter((item) => !item.isPrescription)) {
    lines.push(changeLine(`${product.title} rate`, before.productRates[product.id] || "default", after.productRates[product.id] || "default"));
  }
  return lines.filter((line): line is ChangeLine => line != null);
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [createServices, setCreateServices] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<ProviderDraft | null>(null);
  const [draft, setDraft] = useState<ProviderDraft | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [providersRes, productsRes] = await Promise.all([
      fetch("/api/admin/providers"),
      fetch("/api/admin/commerce/products"),
    ]);
    setLoading(false);
    if (!providersRes.ok) {
      setNotice({ text: "Could not load practitioners. If this is a new deploy, apply the PROVIDER enum migration.", error: true });
      return;
    }
    const payload = (await providersRes.json()) as { providers: ProviderRow[]; serviceOptions: string[]; error?: string };
    if (payload.error) setNotice({ text: payload.error, error: true });
    setProviders(payload.providers ?? []);
    setServiceOptions(payload.serviceOptions ?? []);
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
    if (!needle) return providers;
    return providers.filter((provider) =>
      [provider.displayName, provider.user.email, provider.partnerCode, provider.specialty ?? ""].join(" ").toLowerCase().includes(needle),
    );
  }, [providers, query]);

  const selected = providers.find((provider) => provider.id === selectedId) ?? null;
  const changes = baseline && draft ? providerChanges(baseline, draft, products) : [];
  const shopProducts = products.filter((product) => !product.isPrescription);
  const totals = providers.reduce(
    (acc, provider) => {
      acc.visits += provider.stats.totalBookings;
      acc.completed += provider.stats.completedVisits;
      acc.commission += provider.stats.eligibleCommission;
      return acc;
    },
    { visits: 0, completed: 0, commission: 0 },
  );

  function openProvider(provider: ProviderRow) {
    const next = toDraft(provider);
    setSelectedId(provider.id);
    setBaseline(next);
    setDraft(next);
    setReviewOpen(false);
    setDeleteOpen(false);
  }

  function closeProvider() {
    setSelectedId(null);
    setBaseline(null);
    setDraft(null);
    setReviewOpen(false);
    setDeleteOpen(false);
  }

  async function createProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/admin/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        displayName: createForm.displayName,
        phone: createForm.phone || undefined,
        specialty: createForm.specialty || undefined,
        defaultServiceCommissionPct: Number(createForm.servicePct || 20),
        defaultProductCommissionPct: Number(createForm.productPct || 10),
        status: createForm.status,
        serviceAssignments: createServices.map((serviceSlug) => ({ serviceSlug, active: true })),
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setCreating(false);
    if (!res.ok) {
      setCreateError(payload.error ?? "Failed to create practitioner.");
      return;
    }
    const name = createForm.displayName;
    setCreateOpen(false);
    setCreateForm(emptyCreate);
    setCreateServices([]);
    setNotice({ text: `${name} added.` });
    await load();
  }

  async function saveProvider() {
    if (!selected || !draft) return;
    setSaving(true);
    const serviceDefault = Number(draft.defaultServicePct);
    const productDefault = Number(draft.defaultProductPct);
    const productAssignments = Object.entries(draft.productRates)
      .map(([productId, raw]) => {
        const commissionPct = parseCommissionOverride(raw);
        if (commissionPct == null) return null;
        return { productId, active: true, commissionPct };
      })
      .filter((row): row is { productId: string; active: boolean; commissionPct: number } => row != null);
    const res = await fetch(`/api/admin/providers/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: draft.displayName,
        phone: draft.phone,
        specialty: draft.specialty || undefined,
        status: draft.status,
        defaultServiceCommissionPct: Number.isFinite(serviceDefault) ? serviceDefault : 20,
        defaultProductCommissionPct: Number.isFinite(productDefault) ? productDefault : 10,
        serviceAssignments: draft.serviceSlugs.map((serviceSlug) => ({
          serviceSlug,
          active: true,
          commissionPct: parseCommissionOverride(draft.serviceRates[serviceSlug]),
        })),
        productAssignments,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setNotice({ text: "Could not update that practitioner.", error: true });
      return;
    }
    setReviewOpen(false);
    closeProvider();
    setNotice({ text: `${draft.displayName} updated.` });
    await load();
  }

  async function removeProvider() {
    if (!selected || !draft) return;
    setSaving(true);
    const res = await fetch(`/api/admin/providers/${selected.id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      setNotice({ text: "Could not delete that practitioner.", error: true });
      return;
    }
    const name = draft.displayName;
    closeProvider();
    setNotice({ text: `${name} deleted.` });
    await load();
  }

  return (
    <div className="space-y-6">
      <PeopleHeader
        eyebrow="Clinical network"
        title="Practitioners"
        description="Open a practitioner for visits, rates, services, and booking links. Blank overrides use that person's default. Practitioners never earn on prescriptions."
        action={
          <button
            type="button"
            className={adminBtnPrimary}
            onClick={() => { setCreateForm(emptyCreate); setCreateServices([]); setCreateError(""); setCreateOpen(true); }}
          >
            Add practitioner
          </button>
        }
      />

      <StatGrid
        items={[
          { label: "Practitioners", value: String(providers.length) },
          { label: "Completed visits", value: String(totals.completed), hint: `${totals.visits} total bookings` },
          { label: "Eligible visit pay", value: money(totals.commission) },
        ]}
      />

      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, or code" className="w-full rounded-xl border border-[#e0d0b8] bg-[#fffdf9] px-3.5 py-2.5 text-sm text-[#2b2218] outline-none focus:border-[#8a682e]" />

      <PersonList empty={loading ? "Loading practitioners…" : visible.length ? undefined : "No practitioners yet."}>
        {visible.map((provider) => (
          <PersonRow
            key={provider.id}
            name={provider.displayName}
            badge={provider.status}
            meta={`${provider.user.email} · ${provider.specialty || "No specialty"} · ${provider.phone || "No phone"} · ${provider.partnerCode} · ${provider.stats.completedVisits} completed · ${money(provider.stats.eligibleCommission)} due`}
            onOpen={() => openProvider(provider)}
          />
        ))}
      </PersonList>

      <AdminModal
        open={createOpen}
        wide
        title="Add practitioner"
        eyebrow="New account"
        description="The form closes after the account is created."
        onClose={() => { if (!creating) setCreateOpen(false); }}
        footer={
          <>
            <button type="button" className={adminBtnGhost} disabled={creating} onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" form="create-provider-form" className={adminBtnPrimary} disabled={creating}>{creating ? "Creating…" : "Create practitioner"}</button>
          </>
        }
      >
        <form id="create-provider-form" className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => void createProvider(event)}>
          <Field label="Full name"><TextInput required value={createForm.name} onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} /></Field>
          <Field label="Display name"><TextInput required value={createForm.displayName} onChange={(event) => setCreateForm({ ...createForm, displayName: event.target.value })} /></Field>
          <Field label="Login email"><TextInput required type="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} /></Field>
          <Field label="Temporary password"><TextInput required type="password" minLength={8} value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} /></Field>
          <Field label="Specialty"><TextInput value={createForm.specialty} onChange={(event) => setCreateForm({ ...createForm, specialty: event.target.value })} /></Field>
          <Field label="Phone"><TextInput value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} /></Field>
          <Field label="Default visit %"><TextInput type="number" min={0} max={100} value={createForm.servicePct} onChange={(event) => setCreateForm({ ...createForm, servicePct: event.target.value })} /></Field>
          <Field label="Default product %"><TextInput type="number" min={0} max={100} value={createForm.productPct} onChange={(event) => setCreateForm({ ...createForm, productPct: event.target.value })} /></Field>
          <Field label="Status">
            <select className={adminSelect} value={createForm.status} onChange={(event) => setCreateForm({ ...createForm, status: event.target.value })}>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <RateList
              title="Assignable services"
              rows={serviceOptions.map((slug) => ({
                id: slug,
                label: prettySlug(slug),
                checked: createServices.includes(slug),
                onChecked: (checked) => setCreateServices((prev) => (checked ? [...prev, slug] : prev.filter((item) => item !== slug))),
              }))}
            />
          </div>
          {createError ? <p className="text-sm text-[#7c2c2c] sm:col-span-2">{createError}</p> : null}
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(selected && draft)}
        wide
        title={draft?.displayName || "Practitioner"}
        eyebrow={selected?.partnerCode}
        description={selected ? `${selected.user.email}${selected.specialty ? ` · ${selected.specialty}` : ""}` : undefined}
        onClose={() => {
          if (reviewOpen || deleteOpen || saving) return;
          closeProvider();
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
        {selected && draft ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Account</p><p className="mt-1 text-[#1f1a15]">{selected.user.role || "Login"}</p><p className="text-xs text-[#6f6251]">{selected.phone || "No phone"}</p></div>
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">MTD visits</p><p className="mt-1 font-serif text-2xl">{selected.stats.visitsMtd}</p></div>
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Completed</p><p className="mt-1 font-serif text-2xl">{selected.stats.completedVisits}</p></div>
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Eligible pay</p><p className="mt-1 font-serif text-2xl">{money(selected.stats.eligibleCommission)}</p></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Display name"><TextInput value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></Field>
              <Field label="Specialty"><TextInput value={draft.specialty} onChange={(event) => setDraft({ ...draft, specialty: event.target.value })} /></Field>
              <Field label="Phone"><TextInput value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></Field>
              <Field label="Status">
                <select className={adminSelect} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ProviderDraft["status"] })}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </Field>
              <Field label="Default visit %"><TextInput type="number" min={0} max={100} step="0.01" value={draft.defaultServicePct} onChange={(event) => setDraft({ ...draft, defaultServicePct: event.target.value })} /></Field>
              <Field label="Default product %"><TextInput type="number" min={0} max={100} step="0.01" value={draft.defaultProductPct} onChange={(event) => setDraft({ ...draft, defaultProductPct: event.target.value })} /></Field>
            </div>
            <RateList
              title="Services"
              hint={`Blank uses the default visit rate of ${draft.defaultServicePct}%.`}
              rows={serviceOptions.map((slug) => ({
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
              title="Product overrides"
              hint={`Blank uses the default product rate of ${draft.defaultProductPct}% on non-prescription shop sales.`}
              rows={shopProducts.map((product) => ({
                id: product.id,
                label: product.title,
                rate: draft.productRates[product.id] ?? "",
                onRate: (next) => setDraft({ ...draft, productRates: { ...draft.productRates, [product.id]: next } }),
                defaultPct: draft.defaultProductPct,
              }))}
            />
            <div className="rounded-xl border border-[#efe6d8] bg-[#fffaf3] p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Referral links and QR</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
                <BrandedQrCard value={selected.links.book} label="Scan to book" filename={`kian-prive-${selected.partnerCode}-book.png`} size={220} />
                <div className="space-y-1 font-mono text-xs text-[#1f1a15]">
                  <p className="break-all">Book: {selected.links.book}</p>
                  <p className="break-all">Telemedicine: {selected.links.telemedicine}</p>
                  <p className="break-all">Shop: {selected.links.shop}</p>
                  <p className="break-all">Home: {selected.links.home}</p>
                  <p className="pt-2 font-sans text-[#6f6251]">Bookings attribute consultations. Shop attributes non-prescription products.</p>
                </div>
              </div>
            </div>
            <ClinicalIntakeShare code={selected.partnerCode} title="Privé Therapeutics clinical intake" />
          </div>
        ) : null}
      </AdminModal>

      <ConfirmDialog open={reviewOpen} title="Save these changes?" message="Review what will be updated before it is saved." confirmLabel="Save changes" busy={saving} onCancel={() => setReviewOpen(false)} onConfirm={() => void saveProvider()}>
        <ChangeList changes={changes} />
      </ConfirmDialog>
      <ConfirmDialog open={deleteOpen} title="Delete this practitioner?" message={`${draft?.displayName || "This practitioner"} (${selected?.user.email ?? ""}) and their login will be removed. This cannot be undone.`} confirmLabel="Delete practitioner" danger busy={saving} onCancel={() => setDeleteOpen(false)} onConfirm={() => void removeProvider()} />
      <NoticeToast notice={notice} onDone={() => setNotice(null)} />
    </div>
  );
}
