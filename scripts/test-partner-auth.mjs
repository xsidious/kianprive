async function main() {
  const base = "http://127.0.0.1:3000";
  const csrfRes = await fetch(`${base}/api/auth/csrf`);
  const csrfCookie = csrfRes.headers.getSetCookie?.() ?? [];
  const cookieHeader = [
    ...(csrfCookie.length ? csrfCookie : [csrfRes.headers.get("set-cookie")].filter(Boolean)),
  ]
    .map((c) => String(c).split(";")[0])
    .join("; ");
  const { csrfToken } = await csrfRes.json();

  const body = new URLSearchParams({
    csrfToken,
    email: "partner.clinical@kianprive.com",
    password: "Partner!234",
    callbackUrl: `${base}/partner`,
    json: "true",
  });

  const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader,
    },
    body,
    redirect: "manual",
  });

  const loginCookies = loginRes.headers.getSetCookie?.() ?? [];
  console.log("login status", loginRes.status);
  console.log("login location", loginRes.headers.get("location"));
  console.log("login body", await loginRes.text());
  console.log(
    "session cookie?",
    [...loginCookies, loginRes.headers.get("set-cookie")]
      .filter(Boolean)
      .some((c) => String(c).includes("session-token")),
  );
}

main().catch(console.error);
