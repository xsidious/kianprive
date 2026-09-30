export const PEPTIDES_MEMBER_CATEGORY = "Peptides";

export function isPeptideCatalogCategory(category?: string | null) {
  return (category ?? "").toLowerCase().includes("peptide");
}

export function orderIncludesPeptides(
  items:
    | Array<{
        title?: string | null;
        product?: { category?: string | null } | null;
      }>
    | null
    | undefined,
) {
  return (items ?? []).some(
    (item) => isPeptideCatalogCategory(item.product?.category) || /peptide/i.test(item.title ?? ""),
  );
}
