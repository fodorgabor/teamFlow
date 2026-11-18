export function sameId(
  a: number | string | null | undefined,
  b: number | string | null | undefined
): boolean {
  if (a == null || b == null) return false;

  const numericA = Number(a);
  const numericB = Number(b);

  if (!Number.isNaN(numericA) && !Number.isNaN(numericB)) {
    return numericA === numericB;
  }

  return a === b;
}
