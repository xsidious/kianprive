#!/usr/bin/env node

const baseUrl = process.env.APP_URL ?? "http://localhost:3000";

const checks = [
  "/api/ops/health",
  "/api/commerce/products",
  "/api/analytics/events",
];

async function run() {
  console.log(`Running backend smoke checks against ${baseUrl}`);

  for (const path of checks) {
    if (path === "/api/analytics/events") {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "smoke_test",
          pagePath: "/smoke",
          metadata: { source: "script" },
        }),
      });
      console.log(`${path} -> ${res.status}`);
      continue;
    }

    const res = await fetch(`${baseUrl}${path}`);
    console.log(`${path} -> ${res.status}`);
  }
}

run().catch((error) => {
  console.error("Smoke checks failed", error);
  process.exit(1);
});
