# Partner clinic intake sync (4everglow + Facial Design + Threefold + Hope & Haven)

## Flow

1. Partner clinic (Facial Design, 4everglow, Threefold, Hope & Haven) saves intake locally and posts to KIAN `POST /api/intake/partner` with `site`.
2. Provider sends therapy via `upsertTherapyProposal` → KIAN emails patient + calls `notifyPartnerTherapySent`.
3. Patient pays on `/pay/{token}` → `processOrderCardPayment` → `notifyPartnerTherapyPaid` → `forwardPaidOrderToWellnessTech` with the originating `partnerSite`.
4. Wellness Tech creates the order under **that clinic’s own Organization** and places it on VitaRelay Practice API.
5. VitaRelay status → WT webhook → KIAN `/api/webhooks/wellness-tech-order` → partner clinic webhook.

## Clinic tenancy on Wellness Tech

Each clinic is its own practice org (Portal → Orders / Patients scoped by `orgId`):

| Site key | WT Organization slug |
|---|---|
| `kian-prive` | `kian-prive-partner` |
| `facial-design` | `facial-design-partner` |
| `4everglow` | `4everglow-partner` |
| `threefold-strength` | `threefold-strength-partner` |
| `hope-and-haven` | `hope-and-haven-partner` |

Staff at a clinic log into Wellness Tech under that org to see their patients, orders, tracking, and charts. Admin → Sites still aggregates across clinics.

## Env (KIAN Vercel)

```
FACIAL_DESIGN_WEBHOOK_URL=https://facial-design-production-host
FACIAL_DESIGN_WEBHOOK_SECRET=shared-secret
FOREVERGLOW_WEBHOOK_URL=https://4everglow-production-host
FOREVERGLOW_WEBHOOK_SECRET=shared-secret
THREEFOLD_WEBHOOK_URL=https://threefoldstrength.com
THREEFOLD_WEBHOOK_SECRET=shared-secret
HOPE_AND_HAVEN_WEBHOOK_URL=https://hope-and-haven.vercel.app
HOPE_AND_HAVEN_WEBHOOK_SECRET=shared-secret
```

Optional fallback: `PARTNER_WEBHOOK_SECRET` if per-site secrets are unset.

Partner apps must set `KIAN_WEBHOOK_SECRET` to the matching secret and expose `POST /api/kian/webhook`.

## Smoke path

1. Submit clinical intake on partner (`/peptides` or `/peptides/clinical`).
2. Confirm `TherapeuticsIntakeSubmission` on KIAN with `payload.site` + `externalRef`.
3. Send therapy → partner inbox `PAYMENT_REQUIRED` + `paymentUrl`.
4. Pay → partner `PAID`; WT receives partner order and places via VitaRelay `POST /prescriptions` (`external_order_id` = KIAN order number).

## Formulary products (VitaRelay Practice API)

- **KIAN** holds the clinical catalog (`CLINICAL` products). Live sync: Admin → Products → **Sync VitaRelay catalog** (`POST /api/admin/rxhere/sync-catalog`). Persists `productClass` (503A/503B/RND), `controlledSubstance`, wholesale `price_cents`, and `lastSyncedAt`. Fallback import: `node scripts/import-rxhere-formulary.mjs`. Patient sell `price` stays admin-set for clinical; retail RUO may use markup. Default clinical/shop shipping flat rate is **$35**.
- **Partner sites** do **not** get the full formulary. After therapy is assigned, KIAN webhooks send **payment amount + therapy line items** only.
- **Wellness Tech** syncs the same Practice API catalog (class, controlled flag, practice wholesale). Admin → Formulary → **Sync VitaRelay catalog**. Clinic sell price = VitaRelay wholesale × **`WT_FORMULARY_MARKUP` (1.2 = 20%)**.
- Status loop: VitaRelay webhooks → WT `/api/webhooks/eventide` → KIAN `/api/webhooks/wellness-tech-order`. Poll backup: WT `GET /api/cron/vitarelay-poll` or order **Refresh from VitaRelay**.

## Clinical chart mirror (KIAN → Wellness Tech)

On paid therapy forward, KIAN posts a `clinicalChart` package with:

- Patient demographics, allergies, medications, address
- Full intake `payload` (all form answers)
- Consents / signatures (drawn data-URLs + typed names)
- Therapy proposal + prescription lines + sig
- Prescriber + ship-to

WT stores this on `ClinicalPatient` + `Order` (`clinicalChartJson`, `intakePayloadJson`, `signaturesJson`, `therapyJson`) and renders it under **Portal → Patients** and **Orders → detail**.
