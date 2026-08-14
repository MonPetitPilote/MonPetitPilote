export function getNormalizedName(texte: string) {
  return (texte || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function areNamesIdentical(nomA: string, nomB: string) {
  const a = getNormalizedName(nomA);
  const b = getNormalizedName(nomB);
  return a.includes(b) || b.includes(a);
}
