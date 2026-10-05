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
  type ChangeLine,
} from "@/components/admin/people-ui";
import { adminBtnGhost, adminBtnPrimary, adminSelect, money } from "@/components/admin/ui";
import { parseCommissionOverride } from "@/lib/commission-parse";

type AmbassadorRow = {
  id: string;
  displayName: string;
  partnerCode: string;
  status: string;
  phone: string | null;
  defaultProductCommissionPct: number | string;
  user: { email: string; name: string | null; role?: string };
  createdAt?: string;
  productAssignments: { productId: string; active: boolean; commissionPct: number | string | null }[];
  links: { shop: string; home: string; book: string; code: string };
  stats: {
    paidOrders: number;
    paidSalesTotal: number;
    mtdOrders: number;
    mtdSalesTotal: number;
    eligibleCommission: number;
  };
};

type ProductOption = { id: string; title: string; slug: string; isPrescription?: boolean };
const statuses = ["ACTIVE", "INVITED", "SUSPENDED"] as const;

type AmbassadorDraft = {
  displayName: string;
  phone: string;
  status: (typeof statuses)[number];
  defaultProductPct: string;
  productRates: Record<string, string>;
};

const emptyCreate = {
  name: "",
  displayName: "",
  email: "",
  password: "",
  phone: "",
  productPct: "10",
  status: "ACTIVE",
};

function toDraft(ambassador: AmbassadorRow): AmbassadorDraft {
  const productRates: Record<string, string> = {};
  for (const assignment of ambassador.productAssignments ?? []) {
    if (assignment.commissionPct != null) productRates[assignment.productId] = String(assignment.commissionPct);
  }
  const status = statuses.includes(ambassador.status as AmbassadorDraft["status"]) ? (ambassador.status as AmbassadorDraft["status"]) : "ACTIVE";
  return {
    displayName: ambassador.displayName,
    phone: ambassador.phone ?? "",
    status,
    defaultProductPct: String(ambassador.defaultProductCommissionPct),
    productRates,
  };
}

function ambassadorChanges(before: AmbassadorDraft, after: AmbassadorDraft, products: ProductOption[]): ChangeLine[] {
  const lines = [
    changeLine("Display name", before.displayName, after.displayName),
    changeLine("Phone", before.phone, after.phone),
    changeLine("Status", before.status, after.status),
    changeLine("Default product %", before.defaultProductPct, after.defaultProductPct),
  ];
  const ids = new Set([...Object.keys(before.productRates), ...Object.keys(after.productRates), ...products.map((product) => product.id)]);
  for (const id of ids) {
    const title = products.find((product) => product.id === id)?.title ?? "Product";
    lines.push(changeLine(`${title} rate`, before.productRates[id] || "default", after.productRates[id] || "default"));
  }
  return lines.filter((line): line is ChangeLine => line != null);
}

export default function AdminAmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<AmbassadorRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<AmbassadorDraft | null>(null);
  const [draft, setDraft] = useState<AmbassadorDraft | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [ambRes, productsRes] = await Promise.all([
      fetch("/api/admin/ambassadors"),
      fetch("/api/admin/commerce/products"),
    ]);
    setLoading(false);
    if (!ambRes.ok) {
      setNotice({ text: "Could not load ambassadors.", error: true });
      return;
    }
    const payload = (await ambRes.json()) as { ambassadors: AmbassadorRow[]; error?: string };
    if (payload.error) setNotice({ text: payload.error, error: true });
    setAmbassadors(payload.ambassadors ?? []);
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
    if (!needle) return ambassadors;
    return ambassadors.filter((ambassador) =>
      [ambassador.displayName, ambassador.user.email, ambassador.partnerCode].join(" ").toLowerCase().includes(needle),
    );
  }, [ambassadors, query]);

  const selected = ambassadors.find((ambassador) => ambassador.id === selectedId) ?? null;
  const changes = baseline && draft ? ambassadorChanges(baseline, draft, products) : [];
  const totals = ambassadors.reduce(
    (acc, ambassador) => {
      acc.sales += ambassador.stats.paidSalesTotal;
      acc.orders += ambassador.stats.paidOrders;
      acc.commission += ambassador.stats.eligibleCommission;
      return acc;
    },
    { sales: 0, orders: 0, commission: 0 },
  );

  function openAmbassador(ambassador: AmbassadorRow) {
    const next = toDraft(ambassador);
    setSelectedId(ambassador.id);
    setBaseline(next);
    setDraft(next);
    setReviewOpen(false);
    setDeleteOpen(false);
  }

  function closeAmbassador() {
    setSelectedId(null);
    setBaseline(null);
    setDraft(null);
    setReviewOpen(false);
    setDeleteOpen(false);
  }

  async function createAmbassador(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/admin/ambassadors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        displayName: createForm.displayName,
        phone: createForm.phone || undefined,
        defaultProductCommissionPct: Number(createForm.productPct || 10),
        status: createForm.status,
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setCreating(false);
    if (!res.ok) {
      setCreateError(payload.error ?? "Failed to create ambassador.");
      return;
    }
    const name = createForm.displayName;
    setCreateOpen(false);
    setCreateForm(emptyCreate);
    setNotice({ text: `${name} added.` });
    await load();
  }

  async function saveAmbassador() {
    if (!selected || !draft) return;
    setSaving(true);
    const productDefault = Number(draft.defaultProductPct);
    const productAssignments = Object.entries(draft.productRates)
      .map(([productId, raw]) => {
        const commissionPct = parseCommissionOverride(raw);
        if (commissionPct == null) return null;
        return { productId, active: true, commissionPct };
      })
      .filter((row): row is { productId: string; active: boolean; commissionPct: number } => row != null);
    const res = await fetch(`/api/admin/ambassadors/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: draft.displayName,
        phone: draft.phone,
        status: draft.status,
        defaultProductCommissionPct: Number.isFinite(productDefault) ? productDefault : 10,
        productAssignments,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setNotice({ text: "Could not update that ambassador.", error: true });
      return;
    }
    setReviewOpen(false);
    closeAmbassador();
    setNotice({ text: `${draft.displayName} updated.` });
    await load();
  }

  async function removeAmbassador() {
    if (!selected || !draft) return;
    setSaving(true);
    const res = await fetch(`/api/admin/ambassadors/${selected.id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      setNotice({ text: "Could not delete that ambassador.", error: true });
      return;
    }
    const name = draft.displayName;
    closeAmbassador();
    setNotice({ text: `${name} deleted.` });
    await load();
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setNotice({ text: "Could not copy to clipboard.", error: true });
    }
  }

  return (
    <div className="space-y-6">
      <PeopleHeader
        eyebrow="Growth network"
        title="Ambassadors"
        description="Open an ambassador for their code, links, QR, and commission rates. Blank product rates use that person's default. Prescription products only earn when an override is set."
        action={
          <button type="button" className={adminBtnPrimary} onClick={() => { setCreateForm(emptyCreate); setCreateError(""); setCreateOpen(true); }}>
            Add ambassador
          </button>
        }
      />

      <StatGrid
        items={[
          { label: "Ambassadors", value: String(ambassadors.length) },
          { label: "Attributed sales", value: money(totals.sales), hint: `${totals.orders} paid orders` },
          { label: "Eligible commission", value: money(totals.commission) },
        ]}
      />

      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, or code" className="w-full rounded-xl border border-[#e0d0b8] bg-[#fffdf9] px-3.5 py-2.5 text-sm text-[#2b2218] outline-none focus:border-[#8a682e]" />

      <PersonList empty={loading ? "Loading ambassadors…" : visible.length ? undefined : "No ambassadors yet."}>
        {visible.map((ambassador) => (
          <PersonRow
            key={ambassador.id}
            name={ambassador.displayName}
            badge={ambassador.status}
            meta={`${ambassador.user.email} · ${ambassador.phone || "No phone"} · ${ambassador.partnerCode} · ${money(ambassador.stats.paidSalesTotal)} sales · ${String(ambassador.defaultProductCommissionPct)}% default`}
            onOpen={() => openAmbassador(ambassador)}
          />
        ))}
      </PersonList>

      <AdminModal
        open={createOpen}
        title="Add ambassador"
        eyebrow="New account"
        description="The form closes after the account is created."
        onClose={() => { if (!creating) setCreateOpen(false); }}
        footer={
          <>
            <button type="button" className={adminBtnGhost} disabled={creating} onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" form="create-ambassador-form" className={adminBtnPrimary} disabled={creating}>{creating ? "Creating…" : "Create ambassador"}</button>
          </>
        }
      >
        <form id="create-ambassador-form" className="grid gap-3" onSubmit={(event) => void createAmbassador(event)}>
          <Field label="Full name"><TextInput required value={createForm.name} onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} /></Field>
          <Field label="Display name"><TextInput required value={createForm.displayName} onChange={(event) => setCreateForm({ ...createForm, displayName: event.target.value })} /></Field>
          <Field label="Login email"><TextInput required type="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} /></Field>
          <Field label="Temporary password"><TextInput required type="password" minLength={8} value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} /></Field>
          <Field label="Phone"><TextInput value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Default product %"><TextInput type="number" min={0} max={100} value={createForm.productPct} onChange={(event) => setCreateForm({ ...createForm, productPct: event.target.value })} /></Field>
            <Field label="Status">
              <select className={adminSelect} value={createForm.status} onChange={(event) => setCreateForm({ ...createForm, status: event.target.value })}>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </Field>
          </div>
          {createError ? <p className="text-sm text-[#7c2c2c]">{createError}</p> : null}
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(selected && draft)}
        wide
        title={draft?.displayName || "Ambassador"}
        eyebrow={selected?.partnerCode}
        description={selected?.user.email}
        onClose={() => {
          if (reviewOpen || deleteOpen || saving) return;
          closeAmbassador();
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
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Account</p><p className="mt-1 text-[#1f1a15]">{selected.user.name || "No name"}</p><p className="text-xs text-[#6f6251]">{selected.user.role || "Login"} · {selected.phone || "No phone"}</p></div>
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Code</p><p className="mt-1 font-mono text-lg">{selected.partnerCode}</p></div>
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">MTD sales</p><p className="mt-1 text-lg">{money(selected.stats.mtdSalesTotal)}</p></div>
              <div className="rounded-xl bg-[#fff8ef] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Commission</p><p className="mt-1 text-lg">{money(selected.stats.eligibleCommission)}</p></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Display name"><TextInput value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></Field>
              <Field label="Phone"><TextInput value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></Field>
              <Field label="Status">
                <select className={adminSelect} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as AmbassadorDraft["status"] })}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </Field>
              <Field label="Default product %"><TextInput type="number" min={0} max={100} step="0.01" value={draft.defaultProductPct} onChange={(event) => setDraft({ ...draft, defaultProductPct: event.target.value })} /></Field>
            </div>
            <RateList
              title="Per-product overrides"
              hint={`Blank uses the default ${draft.defaultProductPct}%. For prescription products, set an override to enable commission.`}
              rows={products.map((product) => ({
                id: product.id,
                label: product.title,
                note: product.isPrescription ? "Rx" : undefined,
                rate: draft.productRates[product.id] ?? "",
                onRate: (next) => setDraft({ ...draft, productRates: { ...draft.productRates, [product.id]: next } }),
                defaultPct: draft.defaultProductPct,
              }))}
            />
            <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
              <BrandedQrCard value={selected.links.shop} label="Scan to shop" filename={`kian-prive-${selected.partnerCode}-shop.png`} />
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Shop link</p>
                  <p className="mt-1 break-all text-[#2b2218]">{selected.links.shop}</p>
                  <button type="button" className={`${adminBtnGhost} mt-2`} onClick={() => void copyText("shop", selected.links.shop)}>{copied === "shop" ? "Copied" : "Copy shop link"}</button>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Home / book links</p>
                  <p className="mt-1 break-all text-xs text-[#6f6251]">{selected.links.home}</p>
                  <p className="mt-1 break-all text-xs text-[#6f6251]">{selected.links.book}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" className={adminBtnGhost} onClick={() => void copyText("code", selected.partnerCode)}>{copied === "code" ? "Copied" : "Copy code"}</button>
                    <button type="button" className={adminBtnGhost} onClick={() => void copyText("book", selected.links.book)}>{copied === "book" ? "Copied" : "Copy book link"}</button>
                  </div>
                </div>
              </div>
            </div>
            <ClinicalIntakeShare code={selected.partnerCode} title="Privé Therapeutics clinical intake" />
          </div>
        ) : null}
      </AdminModal>

      <ConfirmDialog open={reviewOpen} title="Save these changes?" message="Review what will be updated before it is saved." confirmLabel="Save changes" busy={saving} onCancel={() => setReviewOpen(false)} onConfirm={() => void saveAmbassador()}>
        <ChangeList changes={changes} />
      </ConfirmDialog>
      <ConfirmDialog open={deleteOpen} title="Delete this ambassador?" message={`${draft?.displayName || "This ambassador"} (${selected?.user.email ?? ""}) and their login will be removed. This cannot be undone.`} confirmLabel="Delete ambassador" danger busy={saving} onCancel={() => setDeleteOpen(false)} onConfirm={() => void removeAmbassador()} />
      <NoticeToast notice={notice} onDone={() => setNotice(null)} />
    </div>
  );
}
