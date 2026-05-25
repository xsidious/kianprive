const ACUITY_API_BASE = "https://acuityscheduling.com/api/v1";

export function getAcuityApiBase() {
  return ACUITY_API_BASE;
}

export function getAcuityCredentials() {
  const userId = process.env.ACUITY_USER_ID?.trim();
  const apiKey = process.env.ACUITY_API_KEY?.trim();
  if (!userId || !apiKey) return null;
  return { userId, apiKey };
}

/** When credentials exist, live availability comes from Acuity unless explicitly disabled. */
export function isAcuitySchedulingEnabled() {
  if (process.env.ACUITY_SCHEDULING_ENABLED === "false") return false;
  return getAcuityCredentials() !== null;
}

export function getAcuitySchedulerBaseUrl() {
  return (
    process.env.ACUITY_SCHEDULER_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://Keepingitallnatural.as.me"
  );
}
