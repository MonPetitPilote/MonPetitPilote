export type CategorieScore = 'low' | 'mid' | 'high';

export interface AnecdoteF1 {
  id: string;
  titre: string;
  sousTitre: string;
  categorie: CategorieScore;
  image: string;
  radioCitation?: string;
  auteurCitation?: string;
  tagline: string;
  badgeCouleur: string;
  badgeTexte: string;
}

export const ANECDOTES_F1: AnecdoteF1[] = [
  // ==========================================
  // --- LOW (Score <= 15 pts) ---
  // ==========================================
  {
    id: 'alonso-lose',
    titre: "Le regard d'Alonso",
    sousTitre: "Le regard dans le vide qui en dit long sur le week-end...",
    categorie: 'low',
    image: '/images/anecdote/low/alonso-lose.png',
    radioCitation: "« ... » — Le silence assourdissant après la désillusion.",
    auteurCitation: "Fernando Alonso, Parc Fermé",
    tagline: "Désillusion",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • CATASTROPHE"
  },
  {
    id: 'singapore-crash',
    titre: "Le crash au premier virage",
    sousTitre: "Tout perdre avant même d'avoir bouclé le premier virage !",
    categorie: 'low',
    image: '/images/anecdote/low/singapore-crash.png',
    radioCitation: "« Non ! Mais qu'est-ce qu'il a fait ?! »",
    auteurCitation: "Sebastian Vettel à la radio",
    tagline: "Carambolage",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • CARAMBOLAGE"
  },
  {
    id: 'fiti-wall',
    titre: "Droit dans le mur !",
    sousTitre: "Quand le scénario du week-end finit directement dans les barrières...",
    categorie: 'low',
    image: '/images/anecdote/low/fiti-wall.png',
    radioCitation: "« Je suis dans le mur les gars... Je suis désolé. »",
    auteurCitation: "Communication radio avec le stand",
    tagline: "Dans le mur",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • DANS LE MUR"
  },
  {
    id: 'max-baku',
    titre: "Le coup de pied de dépit",
    sousTitre: "La victoire s'envole en pleine ligne droite à plus de 300 km/h !",
    categorie: 'low',
    image: '/images/anecdote/low/max-baku.png',
    radioCitation: "« Le pneu a explosé ! *bip* *bip* ! »",
    auteurCitation: "Max Verstappen à la radio",
    tagline: "Coup du sort",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • CREVAISON"
  },

  // ==========================================
  // --- MID (Score 16 - 30 pts) ---
  // ==========================================
  {
    id: 'strolled',
    titre: "You got Strolled !",
    sousTitre: "Un bon rythme en piste, mais coupé en plein élan !",
    categorie: 'mid',
    image: '/images/anecdote/mid/strolled.png',
    radioCitation: "« MAIS QU'EST-CE QUI S'EST PASSÉ ?! On a besoin de savoir qui ressort devant ! »",
    auteurCitation: "David Croft en plein direct",
    tagline: "En embuscade",
    badgeCouleur: "#f39c12",
    badgeTexte: "16 - 30 PTS • EN EMBUSCADE"
  },
  {
    id: 'max-baku-moyen',
    titre: "Rythme solide, fin cruelle",
    sousTitre: "La vitesse était là, il ne manquait qu'un brin de réussite !",
    categorie: 'mid',
    image: '/images/anecdote/mid/max-baku.png',
    radioCitation: "« On a tout bien fait, mais la course en a décidé autrement. »",
    auteurCitation: "Débriefing radio d'après-course",
    tagline: "Bien tenté",
    badgeCouleur: "#f39c12",
    badgeTexte: "16 - 30 PTS • BIEN TENTÉ"
  },

  // ==========================================
  // --- HIGH (Score > 30 pts) ---
  // ==========================================
  {
    id: 'rosberg-champ',
    titre: "Nico Rosberg Champion du Monde",
    sousTitre: "Score d'enfer ! Tu as écrasé le week-end !",
    categorie: 'high',
    image: '/images/anecdote/high/rosberg-champ.png',
    radioCitation: "« ON L'A FAIT !!!!! ON L'A FAIT ! OH MON DIEU ! »",
    auteurCitation: "Nico Rosberg à la radio avec Vivian",
    tagline: "Champion du Monde",
    badgeCouleur: "#2ed573",
    badgeTexte: "31+ PTS • SCORE D'ENFER"
  },
  {
    id: 'senna-racing',
    titre: "L'attaque maximale de Senna",
    sousTitre: "Oser et tenter les bons coups pour aller chercher les points !",
    categorie: 'high',
    image: '/images/anecdote/high/senna-racing.png',
    radioCitation: "« Si tu ne tentes plus ta chance quand une ouverture se présente, tu n'es plus un pilote de course ! »",
    auteurCitation: "Ayrton Senna",
    tagline: "Légende F1",
    badgeCouleur: "#2ed573",
    badgeTexte: "31+ PTS • MAÎTRE DE LA PISTE"
  },
  {
    id: 'vettel-champ',
    titre: "Sebastian Vettel au sommet",
    sousTitre: "Quatre titres mondiaux et une domination insolente ce week-end !",
    categorie: 'high',
    image: '/images/anecdote/high/vettel.champ.png',
    radioCitation: "« Tu es champion du monde Sebastian ! Tu es l'homme de la situation ! » — « Merci à tous les gars, on l'a fait ! »",
    auteurCitation: "Christian Horner & Sebastian Vettel",
    tagline: "Domination",
    badgeCouleur: "#2ed573",
    badgeTexte: "31+ PTS • MONOPOLISATION"
  },
  {
    id: 'shoey',
    titre: "Le Shoey de Daniel Ricciardo",
    sousTitre: "Champagne bu directement dans la bottine pour célébrer ce carton plein !",
    categorie: 'high',
    image: '/images/anecdote/high/shoey.png',
    radioCitation: "« Ouiiii ! Pour tous ceux qui pensaient que j'étais fini... je ne suis jamais parti ! »",
    auteurCitation: "Daniel Ricciardo sur le podium",
    tagline: "Shoey Time",
    badgeCouleur: "#2ed573",
    badgeTexte: "31+ PTS • CÉLÉBRATION ROYALE"
  },
  {
    id: 'bono',
    titre: "« Bono, mes pneus sont morts ! »",
    sousTitre: "Le classique absolu... avant d'enchaîner le meilleur tour et la victoire !",
    categorie: 'high',
    image: '/images/anecdote/high/bono.png',
    radioCitation: "« Bono, mes pneus sont complètement morts ! » *(et claque le record du tour)*",
    auteurCitation: "Lewis Hamilton à son ingénieur Peter Bonnington",
    tagline: "Masterclass",
    badgeCouleur: "#2ed573",
    badgeTexte: "31+ PTS • INTOX & VICTOIRE"
  },
  {
    id: 'catching-lewis',
    titre: "Attraper le leader",
    sousTitre: "Avec un tel total de points, la concurrence va devoir t'attacher pour te freiner !",
    categorie: 'high',
    image: '/images/anecdote/high/catching_lewis.png',
    radioCitation: "« Hammertime Lewis, passe en mode attaque totale ! »",
    auteurCitation: "Message radio de l'ingénieur de piste",
    tagline: "Intouchable",
    badgeCouleur: "#2ed573",
    badgeTexte: "31+ PTS • HORS D'ATTEINTE"
  },
  {
    id: 'changecar',
    titre: "« Changez votre voiture ! »",
    sousTitre: "Quand ton score est tellement haut que les autres écuries réclament un changement de règlement !",
    categorie: 'high',
    image: '/images/anecdote/high/changecar.png',
    radioCitation: "« Alors change ta p*** de voiture ! Si tu as un problème, règle ta propre monoplace ! »",
    auteurCitation: "Christian Horner face aux patrons d'écuries",
    tagline: "Débat au Sommet",
    badgeCouleur: "#2ed573",
    badgeTexte: "31+ PTS • AU-DESSUS DU LOT"
  },
  {
    id: 'kimi-leaveme',
    titre: "« Laissez-moi tranquille ! »",
    sousTitre: "Un pilotage parfait sans personne pour venir te donner des leçons !",
    categorie: 'high',
    image: '/images/anecdote/high/kimi-leaveme.png',
    radioCitation: "« Laissez-moi tranquille, je sais parfaitement ce que j'ai à faire ! »",
    auteurCitation: "Kimi Räikkönen à la radio, Abou Dabi",
    tagline: "Iceman",
    badgeCouleur: "#2ed573",
    badgeTexte: "31+ PTS • CALME OLYMPIEN"
  }
];

export function determinerCategorieScore(points: number): CategorieScore {
  if (points <= 15) return 'low';
  if (points <= 30) return 'mid';
  return 'high';
}

export function obtenirAnecdoteParScore(points: number, indexRandom: number = 0): AnecdoteF1 {
  const cat = determinerCategorieScore(points);
  const candidates = ANECDOTES_F1.filter(a => a.categorie === cat);
  if (candidates.length === 0) return ANECDOTES_F1[0];
  const index = Math.abs(indexRandom) % candidates.length;
  return candidates[index];
}
