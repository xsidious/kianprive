import { publicAppBaseUrl } from "@/lib/intake/tracking";

/** KIAN Privé brand palette for email clients. */
const BRAND = {
  gold: "#b78d4b",
  goldDark: "#8f6f3e",
  ink: "#1f1a15",
  body: "#2b2218",
  muted: "#6f6251",
  cream: "#fffaf3",
  panel: "#fcfaf6",
  border: "#efe4d4",
  borderSoft: "#e7dcc8",
  white: "#ffffff",
  success: "#2f6b3a",
  successBg: "#f3fbf4",
} as const;

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function nl2br(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br/>");
}

export function brandLogoUrl() {
  return `${publicAppBaseUrl()}/images/kian-prive-logo.png`;
}

export function brandSiteUrl() {
  return publicAppBaseUrl();
}

type EmailButton = {
  href: string;
  label: string;
  /** secondary = outlined gold button */
  variant?: "primary" | "secondary";
};

type EmailLayoutInput = {
  /** Inbox preview line (hidden in body). */
  preheader?: string;
  /** Main headline under the logo. */
  title?: string;
  /** HTML body fragments (already escaped where needed). */
  bodyHtml: string;
  buttons?: EmailButton[];
  footerNote?: string;
};

function emailButton({ href, label, variant = "primary" }: EmailButton) {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  if (variant === "secondary") {
    return `<a href="${safeHref}" style="display:inline-block;margin:8px 8px 8px 0;padding:13px 26px;border:1px solid ${BRAND.gold};border-radius:4px;color:${BRAND.goldDark};font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:600;letter-spacing:0.06em;text-decoration:none;text-transform:uppercase;">${safeLabel}</a>`;
  }
  return `<a href="${safeHref}" style="display:inline-block;margin:8px 8px 8px 0;padding:14px 28px;background:${BRAND.gold};border-radius:4px;color:${BRAND.white};font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:600;letter-spacing:0.08em;text-decoration:none;text-transform:uppercase;">${safeLabel}</a>`;
}

/** Table-based wrapper — works in Gmail, Apple Mail, Outlook. */
export function emailLayout(input: EmailLayoutInput) {
  const preheader = input.preheader ? escapeHtml(input.preheader) : "";
  const title = input.title ? escapeHtml(input.title) : "";
  const footer = input.footerNote
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:${BRAND.muted};">${nl2br(input.footerNote)}</p>`
    : "";
  const buttons = input.buttons?.length
    ? `<div style="margin:28px 0 8px;text-align:center;">${input.buttons.map((btn) => emailButton(btn)).join("")}</div>`
    : "";
  const site = brandSiteUrl();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>${title || "KIAN Privé"}</title>
  <!--[if mso]><style>body,table,td{font-family:Georgia,serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f5eee4;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5eee4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:${BRAND.white};border:1px solid ${BRAND.borderSoft};border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(31,26,21,0.06);">
          <!-- Gold accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${BRAND.goldDark},${BRAND.gold},${BRAND.goldDark});font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 32px 20px;background-color:${BRAND.cream};">
              <a href="${escapeHtml(site)}" style="text-decoration:none;">
                <img src="${escapeHtml(brandLogoUrl())}" alt="KIAN Privé" width="180" style="display:block;width:180px;max-width:100%;height:auto;border:0;outline:none;"/>
              </a>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:8px 36px 36px;font-family:Georgia,'Times New Roman',Times,serif;color:${BRAND.body};">
              ${
                title
                  ? `<h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;font-weight:400;color:${BRAND.ink};letter-spacing:0.01em;">${title}</h1>`
                  : ""
              }
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${BRAND.body};">
                ${input.bodyHtml}
              </div>
              ${buttons}
              ${footer}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 36px 28px;background-color:${BRAND.panel};border-top:1px solid ${BRAND.border};text-align:center;">
              <p style="margin:0 0 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.goldDark};">Physician-led luxury wellness</p>
              <p style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:${BRAND.muted};">
                KIAN Privé · North Miami Beach, Florida<br/>
                <a href="${escapeHtml(site)}" style="color:${BRAND.goldDark};text-decoration:none;">kianprive.com</a>
              </p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:#9a8b78;">
                This is a transactional message from KIAN Privé. Please do not reply directly unless instructed.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailQuoteBlock(content: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
    <tr>
      <td style="padding:16px 20px;background-color:${BRAND.panel};border-left:3px solid ${BRAND.gold};border-radius:0 6px 6px 0;font-size:15px;line-height:1.65;color:${BRAND.body};">
        ${nl2br(content)}
      </td>
    </tr>
  </table>`;
}

export function emailDetailCard(rows: Array<{ label: string; value: string; highlight?: boolean }>) {
  const cells = rows
    .map(
      (row) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted};vertical-align:top;width:42%;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:14px;color:${row.highlight ? BRAND.goldDark : BRAND.ink};font-weight:${row.highlight ? "600" : "400"};text-align:right;vertical-align:top;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;background-color:${BRAND.cream};border:1px solid ${BRAND.border};border-radius:6px;">
    <tr><td style="padding:16px 20px;">${cells}</td></tr>
  </table>`;
}

export function emailAmountDue(amount: number, label = "Amount due") {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;text-align:center;">
    <tr>
      <td style="padding:20px;background-color:${BRAND.cream};border:1px solid ${BRAND.border};border-radius:6px;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.goldDark};">${escapeHtml(label)}</p>
        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.1;color:${BRAND.ink};">$${amount.toFixed(2)}</p>
      </td>
    </tr>
  </table>`;
}

export function emailSuccessBanner(message: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
    <tr>
      <td style="padding:14px 18px;background-color:${BRAND.successBg};border:1px solid #cfe6d3;border-radius:6px;font-size:14px;line-height:1.55;color:${BRAND.success};">
        ${escapeHtml(message)}
      </td>
    </tr>
  </table>`;
}

// ─── Branded email builders ───────────────────────────────────────────────

export function buildInvoiceEmail(input: {
  fullName: string;
  orderNumber: string;
  total: number;
  paymentUrl: string;
  notes?: string | null;
  recurringLabel?: string | null;
}) {
  const recurring = input.recurringLabel
    ? `After this payment, your therapy will be billed ${input.recurringLabel} on the card you use.`
    : null;

  const bodyHtml = [
    `<p style="margin:0 0 16px;">Hello ${escapeHtml(input.fullName)},</p>`,
    `<p style="margin:0 0 8px;">Your invoice is ready. Review the details below and pay securely — no account required.</p>`,
    emailDetailCard([
      { label: "Invoice", value: input.orderNumber },
      { label: "Status", value: "Payment due" },
    ]),
    emailAmountDue(input.total),
    recurring ? `<p style="margin:0 0 12px;font-size:14px;color:${BRAND.muted};">${escapeHtml(recurring)}</p>` : "",
    input.notes ? emailQuoteBlock(`Note from your care team:\n${input.notes}`) : "",
    `<p style="margin:16px 0 0;font-size:13px;color:${BRAND.muted};">Questions? Reply to your care team through your intake tracker or contact concierge.</p>`,
  ].join("");

  return {
    subject: `Invoice ${input.orderNumber} — KIAN Privé`,
    text: [
      `Hello ${input.fullName},`,
      "",
      `Your KIAN Privé invoice ${input.orderNumber} is ready.`,
      `Amount due: $${input.total.toFixed(2)}`,
      recurring,
      "",
      "Pay securely (no account required):",
      input.paymentUrl,
      input.notes ? `\nNote from your care team:\n${input.notes}` : "",
      "",
      "— KIAN Privé",
    ]
      .filter((line) => line != null)
      .join("\n"),
    html: emailLayout({
      preheader: `Invoice ${input.orderNumber} — $${input.total.toFixed(2)} due`,
      title: "Your invoice is ready",
      bodyHtml,
      buttons: [{ href: input.paymentUrl, label: "Pay invoice" }],
      footerNote: "Secure payment powered by KIAN Privé. Link expires in 30 days.",
    }),
  };
}

export function buildIntakeUpdateEmail(input: {
  fullName: string;
  body: string;
  statusLabel: string;
  referenceCode: string;
  trackUrl: string;
  paymentUrl?: string | null;
}) {
  const bodyHtml = [
    `<p style="margin:0 0 16px;">Hi ${escapeHtml(input.fullName)},</p>`,
    `<p style="margin:0 0 12px;">Your clinical team sent an update about your intake request:</p>`,
    emailQuoteBlock(input.body),
    emailDetailCard([
      { label: "Status", value: input.statusLabel },
      { label: "Request code", value: input.referenceCode, highlight: true },
    ]),
    input.paymentUrl
      ? `<p style="margin:16px 0 0;font-size:14px;color:${BRAND.muted};">Your therapy plan is ready. Pay below — no sign-in required.</p>`
      : `<p style="margin:16px 0 0;font-size:14px;color:${BRAND.muted};">You can view your full intake status and reply to your care team anytime.</p>`,
  ].join("");

  const buttons: EmailButton[] = input.paymentUrl
    ? [
        { href: input.paymentUrl, label: "Pay therapy invoice" },
        { href: input.trackUrl, label: "Track intake", variant: "secondary" },
      ]
    : [{ href: input.trackUrl, label: "View & reply" }];

  return {
    subject: input.paymentUrl
      ? `Your therapy plan is ready (${input.referenceCode})`
      : `Update on your intake (${input.referenceCode})`,
    text: [
      `Hi ${input.fullName},`,
      "",
      "Your clinical team sent a message about your intake request:",
      "",
      input.body,
      input.paymentUrl ? `\nPay your therapy invoice:\n${input.paymentUrl}` : "",
      "",
      `Status: ${input.statusLabel}`,
      `Request code: ${input.referenceCode}`,
      `Track and reply: ${input.trackUrl}`,
      "",
      "— KIAN Privé Concierge",
    ].join("\n"),
    html: emailLayout({
      preheader: input.paymentUrl ? "Your therapy plan is ready — pay securely" : `Status: ${input.statusLabel}`,
      title: input.paymentUrl ? "Your therapy plan is ready" : "Update on your intake",
      bodyHtml,
      buttons,
    }),
  };
}

export function buildIntakeConfirmationEmail(input: {
  fullName: string;
  referenceId: string;
  trackUrl?: string;
}) {
  const trackUrl = input.trackUrl;
  const bodyHtml = [
    `<p style="margin:0 0 16px;">Dear ${escapeHtml(input.fullName)},</p>`,
    `<p style="margin:0 0 12px;">Thank you for submitting your <strong>Comprehensive Therapeutics Intake</strong>. We received your physician review fee and your form is now in queue for clinical review.</p>`,
    emailDetailCard([
      { label: "Reference", value: input.referenceId, highlight: true },
      { label: "Review fee", value: "$55.00 paid" },
      { label: "Next step", value: "Physician review" },
    ]),
    emailSuccessBanner("This confirms receipt only — not medical approval or a prescription."),
    `<p style="margin:16px 0 0;font-size:14px;color:${BRAND.muted};">A KIAN Privé clinician will review your information and contact you regarding next steps.</p>`,
  ].join("");

  return {
    subject: "We received your therapeutics intake",
    text: [
      `Dear ${input.fullName},`,
      "",
      "Thank you for submitting your KIAN Privé Comprehensive Therapeutics Intake Form.",
      "",
      `Reference ID: ${input.referenceId}`,
      "We received your $55 physician review fee. A KIAN Privé clinician will review your information and contact you regarding next steps.",
      "",
      "This message confirms receipt only and does not constitute medical approval or a prescription.",
      trackUrl ? `\nTrack your request: ${trackUrl}` : "",
      "",
      "KIAN Privé — Physician-Led Luxury Wellness Concierge",
      "North Miami Beach, Florida",
    ]
      .filter(Boolean)
      .join("\n"),
    html: emailLayout({
      preheader: `Intake received — reference ${input.referenceId}`,
      title: "Intake received",
      bodyHtml,
      buttons: trackUrl ? [{ href: trackUrl, label: "Track my request" }] : undefined,
    }),
  };
}

export function buildPaymentConfirmationEmail(input: {
  orderNumber: string;
  total: number;
  refillNote?: string | null;
}) {
  const bodyHtml = [
    `<p style="margin:0 0 16px;">Thank you — your payment was received.</p>`,
    emailDetailCard([
      { label: "Order", value: input.orderNumber, highlight: true },
      { label: "Amount paid", value: `$${input.total.toFixed(2)}` },
      { label: "Status", value: "Paid" },
    ]),
    emailSuccessBanner("Our team will fulfill your order. You'll receive updates as your therapy ships."),
    input.refillNote
      ? `<p style="margin:16px 0 0;font-size:14px;color:${BRAND.muted};">${escapeHtml(input.refillNote.trim())}</p>`
      : "",
  ].join("");

  return {
    subject: `Payment received — ${input.orderNumber}`,
    text: `Thank you. We received payment for ${input.orderNumber} ($${input.total.toFixed(2)}). Our team will fulfill your order.${input.refillNote ? ` ${input.refillNote.trim()}` : ""}`,
    html: emailLayout({
      preheader: `Payment confirmed — ${input.orderNumber}`,
      title: "Payment received",
      bodyHtml,
      buttons: [{ href: `${brandSiteUrl()}/track-intake`, label: "Track your order", variant: "secondary" }],
    }),
  };
}

export function buildPasswordResetEmail(input: { setupUrl: string }) {
  const bodyHtml = [
    `<p style="margin:0 0 12px;">We received a request to reset your KIAN Privé password.</p>`,
    `<p style="margin:0 0 12px;font-size:14px;color:${BRAND.muted};">Use the button below to choose a new password. This link expires in 24 hours.</p>`,
    `<p style="margin:16px 0 0;font-size:13px;color:${BRAND.muted};">If you didn't request this, you can safely ignore this email.</p>`,
  ].join("");

  return {
    subject: "Reset your KIAN Privé password",
    text: `Use this link to choose a new password:\n${input.setupUrl}\n\nThis link expires in 24 hours.`,
    html: emailLayout({
      preheader: "Reset your KIAN Privé password",
      title: "Password reset",
      bodyHtml,
      buttons: [{ href: input.setupUrl, label: "Choose new password" }],
    }),
  };
}

export function buildTherapyRefillEmail(input: {
  orderNumber: string;
  amount: number;
  billingLabel: string;
}) {
  const bodyHtml = [
    `<p style="margin:0 0 12px;">Your therapy refill has been processed.</p>`,
    emailDetailCard([
      { label: "Order", value: input.orderNumber, highlight: true },
      { label: "Amount", value: `$${input.amount.toFixed(2)}` },
      { label: "Billing", value: input.billingLabel },
    ]),
  ].join("");

  return {
    subject: `Therapy refill charged — ${input.orderNumber}`,
    text: `We charged $${input.amount.toFixed(2)} for your therapy refill (${input.orderNumber}). This plan bills ${input.billingLabel}.`,
    html: emailLayout({
      preheader: `Refill charged — ${input.orderNumber}`,
      title: "Therapy refill processed",
      bodyHtml,
    }),
  };
}

export function buildWelcomeEmail(input: { email: string }) {
  const bodyHtml = [
    `<p style="margin:0 0 12px;">Welcome to KIAN Privé — your account is ready.</p>`,
    `<p style="margin:0;font-size:14px;color:${BRAND.muted};">Explore physician-led wellness, clinical therapeutics, and concierge care tailored to you.</p>`,
  ].join("");

  return {
    subject: "Welcome to KIAN Privé",
    text: "Welcome to KIAN Privé. Your account is ready.",
    html: emailLayout({
      preheader: "Welcome to KIAN Privé",
      title: "Welcome",
      bodyHtml,
      buttons: [
        { href: `${brandSiteUrl()}/dashboard`, label: "Go to dashboard" },
        { href: `${brandSiteUrl()}/services`, label: "Explore services", variant: "secondary" },
      ],
    }),
  };
}

export function buildAccountSetupEmail(input: { name?: string | null; setupUrl: string }) {
  const greeting = input.name?.trim() ? escapeHtml(input.name.trim()) : "there";
  const bodyHtml = [
    `<p style="margin:0 0 12px;">Hi ${greeting},</p>`,
    `<p style="margin:0 0 12px;">Use the button below to create your password and finish your member profile.</p>`,
    `<p style="margin:0;font-size:13px;color:${BRAND.muted};">This link expires in 24 hours. If you didn't request this, you can ignore this email.</p>`,
  ].join("");

  return {
    subject: "Set up your KIAN Privé account",
    text: `Hi ${input.name || "there"},\n\nUse this link to create your password and finish your member profile:\n${input.setupUrl}\n\nThis link expires in 24 hours.`,
    html: emailLayout({
      preheader: "Finish setting up your KIAN Privé account",
      title: "Complete your account",
      bodyHtml,
      buttons: [{ href: input.setupUrl, label: "Set up account" }],
    }),
  };
}

export function buildIntakeStatusEmail(input: {
  fullName: string;
  statusLabel: string;
  note?: string | null;
  referenceCode: string;
  trackUrl: string;
  orderNumber?: string | null;
  nextStep?: string | null;
}) {
  const bodyHtml = [
    `<p style="margin:0 0 16px;">Hi ${escapeHtml(input.fullName)},</p>`,
    `<p style="margin:0 0 12px;">Your clinical intake status has been updated.</p>`,
    emailDetailCard([
      { label: "Status", value: input.statusLabel, highlight: true },
      { label: "Request code", value: input.referenceCode },
      ...(input.orderNumber ? [{ label: "Order", value: input.orderNumber }] : []),
    ]),
    input.note ? emailQuoteBlock(`Note from your provider:\n${input.note}`) : "",
    input.nextStep ? `<p style="margin:16px 0 0;font-size:14px;color:${BRAND.muted};">${escapeHtml(input.nextStep)}</p>` : "",
  ].join("");

  return {
    subject: `Intake update: ${input.statusLabel}`,
    text: [
      `Hi ${input.fullName},`,
      "",
      `Your clinical intake status is now: ${input.statusLabel}.`,
      input.note ? `\nNote from your provider:\n${input.note}` : "",
      `Request code: ${input.referenceCode}`,
      `Track and reply: ${input.trackUrl}`,
      input.orderNumber ? `\nOrder: ${input.orderNumber}` : "",
      input.nextStep ? `\n${input.nextStep}` : "",
      "",
      "— KIAN Privé Clinical Team",
    ]
      .filter(Boolean)
      .join("\n"),
    html: emailLayout({
      preheader: `Status: ${input.statusLabel}`,
      title: "Intake status update",
      bodyHtml,
      buttons: [{ href: input.trackUrl, label: "View & reply" }],
    }),
  };
}

/** Simple branded wrapper for one-off staff or system emails. */
export function buildSimpleEmail(input: {
  title: string;
  preheader?: string;
  paragraphs: string[];
  button?: EmailButton;
}) {
  const bodyHtml = input.paragraphs
    .map((p) => `<p style="margin:0 0 14px;">${nl2br(p)}</p>`)
    .join("");

  return emailLayout({
    preheader: input.preheader ?? input.title,
    title: input.title,
    bodyHtml,
    buttons: input.button ? [input.button] : undefined,
  });
}

export function buildAppointmentAftercareEmail(input: {
  fullName?: string | null;
  serviceTitles: string[];
  dashboardUrl: string;
}) {
  const greeting = input.fullName?.trim() ? `Dear ${input.fullName.trim()},` : "Dear guest,";
  const services = input.serviceTitles.filter(Boolean).join(", ") || "your recent visit";
  const aftercare = [
    {
      label: "AFTERCARE · IMMEDIATE",
      text: "A profound sense of lightness. Increased elimination, gentle warmth, deep relaxation.",
    },
    {
      label: "AFTERCARE · SHORT-TERM",
      text: "Visible reduction in puffiness, swelling and water retention. Skin appears toned and radiant.",
    },
    {
      label: "AFTERCARE · CUMULATIVE",
      text: "Measurable contour reduction, firmer skin, lasting improvements in detox and recovery.",
    },
  ];

  const blocksHtml = aftercare
    .map(
      (item) => `
      <tr>
        <td style="padding:0 0 22px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.gold};">${escapeHtml(item.label)}</p>
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.45;color:${BRAND.ink};">${escapeHtml(item.text)}</p>
        </td>
      </tr>`,
    )
    .join("");

  const html = emailLayout({
    preheader: "Your visit is complete — here is your aftercare guidance.",
    title: "Your visit is complete",
    bodyHtml: `
      <p style="margin:0 0 14px;">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 18px;">Thank you for trusting KIAN Privé with <strong>${escapeHtml(services)}</strong>. Below is your aftercare guidance as your body continues to respond.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">${blocksHtml}</table>
    `,
    buttons: [{ href: input.dashboardUrl, label: "View in my services" }],
    footerNote: "Questions about recovery? Reply to this email or WhatsApp our concierge team.",
  });

  const text = [
    greeting,
    "",
    `Thank you for trusting KIAN Privé with ${services}.`,
    "",
    ...aftercare.flatMap((item) => [item.label, item.text, ""]),
    `View in my services: ${input.dashboardUrl}`,
  ].join("\n");

  return {
    subject: "Aftercare guidance from your KIAN Privé visit",
    text,
    html,
  };
}
