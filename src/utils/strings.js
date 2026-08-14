export function getNormalizedName(texte) {
  return (texte || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function nomsCorrespondentLocal(nomA, nomB) {
  const a = getNormalizedName(nomA);
  const b = getNormalizedName(nomB);
  return a.includes(b) || b.includes(a);
}
