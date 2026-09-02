export interface AnecdoteF1 {
  id: string;
  titre: string;
  sousTitre: string;
  categorie: 'peu-de-points' | 'un-peu-de-points' | 'beaucoup-de-points';
  image: string;
  radioCitation?: string;
  auteurCitation?: string;
  tagline: string;
  badgeCouleur: string;
  badgeTexte: string;
}

export const ANECDOTES_F1: AnecdoteF1[] = [
  // --- PEU DE POINTS (Score <= 15 pts) ---
  {
    id: 'alonso-lose',
    titre: "Le regard d'Alonso",
    sousTitre: "Le regard dans le vide qui en dit long sur le week-end...",
    categorie: 'peu-de-points',
    image: '/images/peu-de-points/alonso-lose.png',
    radioCitation: "« ... » — Le silence assourdissant après la désillusion.",
    auteurCitation: "Fernando Alonso",
    tagline: "Désillusion",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • CATASTROPHE"
  },
  {
    id: 'singapore-crash',
    titre: "Le crash au premier virage",
    sousTitre: "Tout perdre avant même d'avoir bouclé le premier tour !",
    categorie: 'peu-de-points',
    image: '/images/peu-de-points/singapore-crash.png',
    radioCitation: "« No ! What was he doing ?! »",
    auteurCitation: "Radio pilote après le crash",
    tagline: "Carambolage",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • CARAMBOLAGE"
  },
  {
    id: 'fiti-wall',
    titre: "Droit dans le mur !",
    sousTitre: "Quand le scénario du week-end finit directement dans les barrières...",
    categorie: 'peu-de-points',
    image: '/images/peu-de-points/fiti-wall.png',
    radioCitation: "« I'm in the wall. I'm sorry guys. »",
    auteurCitation: "Communication radio",
    tagline: "Dans le mur",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • DANS LE MUR"
  },
  {
    id: 'max-baku',
    titre: "Le coup de pied de dépit",
    sousTitre: "La victoire s'envole en pleine ligne droite !",
    categorie: 'peu-de-points',
    image: '/images/peu-de-points/max-baku.png',
    radioCitation: "« Tire blew ! *bip* *bip* ! »",
    auteurCitation: "Max Verstappen",
    tagline: "Coup du sort",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • CREVAISON"
  },

  // --- UN PEU DE POINTS (Score 16 - 30 pts) ---
  {
    id: 'strolled',
    titre: "You got Strolled !",
    sousTitre: "Un bon rythme en piste, mais coupé en plein élan !",
    categorie: 'un-peu-de-points',
    image: '/images/un-peu-de-points/strolled.png',
    radioCitation: "« WHAT HAS HAPPENED ?! We need to know who's in front ! »",
    auteurCitation: "David Croft",
    tagline: "En embuscade",
    badgeCouleur: "#f39c12",
    badgeTexte: "16 - 30 PTS • EN EMBUSCADE"
  },
  {
    id: 'max-baku-moyen',
    titre: "Rythme solide, fin cruelle",
    sousTitre: "La vitesse était là, il ne manquait qu'un brin de chance !",
    categorie: 'un-peu-de-points',
    image: '/images/un-peu-de-points/max-baku.png',
    radioCitation: "« We did everything right, but racing happened. »",
    auteurCitation: "Débriefing d'après-course",
    tagline: "Bien tenté",
    badgeCouleur: "#f39c12",
    badgeTexte: "16 - 30 PTS • BIEN TENTÉ"
  },

  // --- BEAUCOUP DE POINTS (Score > 30 pts) ---
  {
    id: 'rosberg-champ',
    titre: "Nico Rosberg Champion du Monde",
    sousTitre: "Score d'enfer ! Tu as écrasé le week-end !",
    categorie: 'beaucoup-de-points',
    image: '/images/beaucoup-de-points/rosberg-champ.png',
    radioCitation: "« WE DID IT !!!!! WE DID IT ! OH MY GOD ! »",
    auteurCitation: "Nico Rosberg à la radio avec Vivian",
    tagline: "Masterclass",
    badgeCouleur: "#2ed573",
    badgeTexte: "31+ PTS • SCORE D'ENFER"
  }
];

export function determinerCategorieScore(points: number): 'peu-de-points' | 'un-peu-de-points' | 'beaucoup-de-points' {
  if (points <= 15) return 'peu-de-points';
  if (points <= 30) return 'un-peu-de-points';
  return 'beaucoup-de-points';
}

export function obtenirAnecdoteParScore(points: number, indexRandom: number = 0): AnecdoteF1 {
  const cat = determinerCategorieScore(points);
  const candidates = ANECDOTES_F1.filter(a => a.categorie === cat);
  if (candidates.length === 0) return ANECDOTES_F1[0];
  const index = Math.abs(indexRandom) % candidates.length;
  return candidates[index];
}
