/** Physician-prescribed peptide catalog and Hub intake. */
export const PRIVETHERAPEUTICS_URL = "https://www.privetherapeutics.solutions/";

/** Physician-supported monthly protocols on the Therapeutics homepage. */
export const PHYSICIAN_PROTOCOLS_HASH = "physician-protocols";
export const PHYSICIAN_PROTOCOLS_URL = `${PRIVETHERAPEUTICS_URL}#${PHYSICIAN_PROTOCOLS_HASH}`;

/** Compound therapy program details moved from the KIAN service page. */
export const COMPOUND_THERAPY_HASH = "compound-therapy";
export const COMPOUND_THERAPY_URL = `${PRIVETHERAPEUTICS_URL}#${COMPOUND_THERAPY_HASH}`;

/** Clinical intake on Privé Therapeutics. */
export const CLINICAL_INTAKE_URL = "https://www.privetherapeutics.solutions/schedule";

/** Personal intake link so a representative's code is stored on the chart. */
export function clinicalIntakeShareUrl(code?: string | null) {
  const ref = typeof code === "string" ? code.trim() : "";
  if (!ref) return CLINICAL_INTAKE_URL;
  return `${CLINICAL_INTAKE_URL}?ref=${encodeURIComponent(ref.toUpperCase())}`;
}
