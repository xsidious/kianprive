import { sendTransactionalEmail } from "@/lib/email";
import { buildSimpleEmail } from "@/lib/email-templates";
import { labPanelsForBooking } from "@/lib/bookings/lab-services";

export type LabPrescriptionBooking = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  patientDateOfBirth?: string | null;
  preferredLocation: string;
  scheduledStart: Date | null;
  timezone?: string | null;
  serviceIds: string[];
  serviceTitles: string[];
  notes?: string | null;
};

export function getLabPrescriptionRecipients() {
  const raw =
    process.env.LAB_PRESCRIPTION_EMAIL ||
    process.env.WELLNESS_TECH_LAB_EMAIL ||
    process.env.WELLNESS_TECH_VENDOR_EMAIL ||
    "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function orderingPhysicianBlock() {
  const name = process.env.LAB_ORDERING_PHYSICIAN_NAME?.trim() || "Chyle Beaird, M.D.";
  const npi = process.env.LAB_ORDERING_PHYSICIAN_NPI?.trim();
  const clinic = process.env.LAB_ORDERING_CLINIC_NAME?.trim() || "KIAN Privé";
  return [name, npi ? `NPI: ${npi}` : null, clinic].filter(Boolean).join(" · ");
}

function formatAppointment(when: Date | null, timezone?: string | null) {
  if (!when) return "To be confirmed with patient";
  return when.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone || "America/New_York",
  });
}

export function buildLabPrescriptionEmail(booking: LabPrescriptionBooking) {
  const panels = labPanelsForBooking(booking.serviceIds);
  const panelLines = panels.length
    ? panels.map(
        (panel) =>
          `- ${panel.name} (${panel.slug})\n  Tests: ${panel.tests}\n  Clinical purpose: ${panel.purpose}`,
      )
    : booking.serviceTitles.map((title) => `- ${title}`);

  const text = [
    "LAB REQUISITION / PRESCRIPTION REQUEST",
    "KIAN Privé — Wellness Tech panel order",
    "",
    "Ordering physician:",
    orderingPhysicianBlock(),
    "",
    "Patient:",
    `Name: ${booking.fullName}`,
    `Date of birth: ${booking.patientDateOfBirth?.trim() || "Confirm with patient"}`,
    `Phone: ${booking.phone}`,
    `Email: ${booking.email}`,
    "",
    "Tests ordered:",
    ...panelLines,
    "",
    "Collection appointment:",
    formatAppointment(booking.scheduledStart, booking.timezone),
    `Location: ${booking.preferredLocation}`,
    booking.notes?.trim() ? `\nNotes:\n${booking.notes.trim()}` : "",
    "",
    `Booking reference: ${booking.id}`,
    "",
    "Please issue the lab order / requisition so the patient may present at the draw site.",
    "Reply to KIAN Privé if additional clinical information is required.",
    "",
    "— KIAN Privé Clinical Operations",
  ]
    .filter(Boolean)
    .join("\n");

  const html = buildSimpleEmail({
    title: "Lab requisition request",
    preheader: `${booking.fullName} · ${panels[0]?.name ?? booking.serviceTitles[0] ?? "Blood work"}`,
    paragraphs: [
      "Please issue a lab order / requisition for the following KIAN Privé patient.",
      `Ordering physician: ${orderingPhysicianBlock()}`,
      `Patient: ${booking.fullName}`,
      `DOB: ${booking.patientDateOfBirth?.trim() || "Confirm with patient"}`,
      `Phone: ${booking.phone} · Email: ${booking.email}`,
      `Appointment: ${formatAppointment(booking.scheduledStart, booking.timezone)}`,
      `Location: ${booking.preferredLocation}`,
      "",
      "Tests ordered:",
      ...panelLines,
      booking.notes?.trim() ? `\nNotes: ${booking.notes.trim()}` : "",
      `\nBooking reference: ${booking.id}`,
    ],
  });

  return {
    subject: `Lab requisition — ${booking.fullName} (${panels[0]?.name ?? "Blood work"})`,
    text,
    html,
  };
}

export function buildLabPrescriptionPatientEmail(booking: LabPrescriptionBooking) {
  const panels = labPanelsForBooking(booking.serviceIds);
  const panelSummary = panels.map((panel) => panel.name).join(", ") || booking.serviceTitles.join(", ");
  const when = formatAppointment(booking.scheduledStart, booking.timezone);

  return {
    subject: "Your lab order is being prepared",
    text: [
      `Hi ${booking.fullName},`,
      "",
      "Thank you for booking blood work with KIAN Privé.",
      "",
      `Panel(s): ${panelSummary}`,
      `Appointment: ${when}`,
      `Location: ${booking.preferredLocation}`,
      "",
      "Our physician team is issuing your lab prescription / requisition to the lab partner now.",
      "You will receive confirmation when the order is active. Bring a photo ID to your draw appointment.",
      "",
      "If you have questions, reply to this email or contact concierge.",
      "",
      "— KIAN Privé",
    ].join("\n"),
    html: buildSimpleEmail({
      title: "Lab order in progress",
      preheader: panelSummary,
      paragraphs: [
        `Hi ${booking.fullName},`,
        "Thank you for booking blood work with KIAN Privé.",
        `Panel(s): ${panelSummary}`,
        `Appointment: ${when}`,
        `Location: ${booking.preferredLocation}`,
        "",
        "Our physician team is issuing your lab prescription to the lab partner now.",
        "Bring a photo ID to your draw appointment.",
      ],
    }),
  };
}

export async function sendLabPrescriptionEmails(booking: LabPrescriptionBooking) {
  const recipients = getLabPrescriptionRecipients();
  if (!recipients.length) {
    console.warn("[lab-prescription] LAB_PRESCRIPTION_EMAIL is not configured; skipping lab order email.");
    return { sent: false as const, reason: "missing_recipients" as const };
  }

  const report = buildLabPrescriptionEmail(booking);
  await sendTransactionalEmail({
    to: recipients,
    subject: report.subject,
    text: report.text,
    html: report.html,
  });

  const patientCopy = buildLabPrescriptionPatientEmail(booking);
  await sendTransactionalEmail({
    to: booking.email,
    subject: patientCopy.subject,
    text: patientCopy.text,
    html: patientCopy.html,
  });

  return { sent: true as const };
}
