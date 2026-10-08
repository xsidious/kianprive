# Partner clinic intake sync (4everglow + Facial Design)

## Flow

1. Partner site saves intake locally and posts to `POST /api/intake/partner`.
2. Provider sends therapy via `upsertTherapyProposal` → KIAN emails patient + calls `notifyPartnerTherapySent`.
3. Patient pays on `/pay/{token}` → `processOrderCardPayment` → `notifyPartnerTherapyPaid` → `forwardPaidOrderToWellnessTech`.
4. WT/RxHere status webhook → `notifyPartnerOrderUpdated`.

## Env (KIAN Vercel)

```
FACIAL_DESIGN_WEBHOOK_URL=https://facial-design-production-host
FACIAL_DESIGN_WEBHOOK_SECRET=shared-secret
FOREVERGLOW_WEBHOOK_URL=https://4everglow-production-host
FOREVERGLOW_WEBHOOK_SECRET=shared-secret
```

Optional fallback: `PARTNER_WEBHOOK_SECRET` if per-site secrets are unset.

Partner apps must set `KIAN_WEBHOOK_SECRET` to the matching secret and expose `POST /api/kian/webhook`.

## Smoke path

1. Submit clinical intake on partner (`/peptides` or `/peptides/clinical`).
2. Confirm `TherapeuticsIntakeSubmission` on KIAN with `payload.site` + `externalRef`.
3. Send therapy → partner inbox `PAYMENT_REQUIRED` + `paymentUrl`.
4. Pay → partner `PAID`; WT receives partner order with RxHere id.

## Formulary products (RxHere)

- **KIAN** holds the clinical catalog (`CLINICAL` products). Import: `node scripts/import-rxhere-formulary.mjs`. Patient `price` = **2×** RxHere sheet price; `wholesalePrice` = sheet price. Default clinical/shop shipping flat rate is **$35**. Category placeholder images under `/images/formulary/*.svg`.
- **4everglow / Facial Design** do **not** get the full formulary. After therapy is assigned, KIAN webhooks send **payment amount + therapy line items** only.
- **Wellness Tech** syncs the same JSON with **2× markup** on partner catalog prices (`WT_FORMULARY_MARKUP` in `formulary-sync.ts`). Run: `npm run db:sync-formulary`. Same markup applies to KIAN-forwarded and practitioner orders.

## Clinical chart mirror (KIAN → Wellness Tech)

On paid therapy forward, KIAN posts a `clinicalChart` package with:

- Patient demographics, allergies, medications, address
- Full intake `payload` (all form answers)
- Consents / signatures (drawn data-URLs + typed names)
- Therapy proposal + prescription lines + sig
- Prescriber + ship-to

WT stores this on `ClinicalPatient` + `Order` (`clinicalChartJson`, `intakePayloadJson`, `signaturesJson`, `therapyJson`) and renders it under **Portal → Patients** and **Orders → detail**.
