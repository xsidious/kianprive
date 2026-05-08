type SendEmailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export async function sendTransactionalEmail(input: SendEmailInput) {
  const from = process.env.EMAIL_FROM ?? "KIAN Prive <no-reply@kianprive.com>";
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.info("Email provider not configured. Logging email payload instead.", {
      from,
      ...input,
    });
    return { ok: true, provider: "log" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend request failed: ${errorText}`);
  }

  return { ok: true, provider: "resend" as const };
}

export async function sendWelcomeEmail(email: string) {
  return sendTransactionalEmail({
    to: email,
    subject: "Welcome to KIAN Prive",
    text: "Welcome to KIAN Prive. Your account is ready.",
  });
}
