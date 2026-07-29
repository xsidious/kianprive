type SendEmailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  attachments?: {
    filename: string;
    content: Buffer | Uint8Array | string;
    contentType?: string;
  }[];
};

function normalizeRecipients(to: string | string[]) {
  const list = Array.isArray(to) ? to : [to];
  return [...new Set(list.map((item) => item.trim()).filter(Boolean))];
}

export async function sendTransactionalEmail(input: SendEmailInput) {
  const from = process.env.EMAIL_FROM ?? "KIAN Prive <no-reply@kianprive.com>";
  const resendKey = process.env.RESEND_API_KEY;
  const recipients = normalizeRecipients(input.to);

  if (!recipients.length) {
    throw new Error("At least one email recipient is required.");
  }

  if (!resendKey) {
    console.info("Email provider not configured. Logging email metadata only.", {
      from,
      toCount: recipients.length,
      subject: input.subject,
      attachmentCount: input.attachments?.length ?? 0,
    });
    return { ok: true, provider: "log" as const };
  }

  const attachments = input.attachments?.map((file) => {
    const bytes =
      typeof file.content === "string"
        ? Buffer.from(file.content, file.content.startsWith("data:") ? "utf8" : "base64")
        : Buffer.from(file.content);
    return {
      filename: file.filename,
      content: bytes.toString("base64"),
      content_type: file.contentType ?? "application/pdf",
    };
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: input.subject,
      text: input.text,
      html: input.html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      ...(attachments?.length ? { attachments } : {}),
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
