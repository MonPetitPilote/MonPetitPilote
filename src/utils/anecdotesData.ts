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
    id: 'strategy',
    titre: "La réunion stratégie",
    sousTitre: "Quand le plan de course ressemble plus à un spectacle de cirque qu'à de la Formule 1...",
    categorie: 'low',
    image: '/images/anecdote/low/strategy.png',
    radioCitation: "« We are checking. »",
    auteurCitation: "L'ingénieur de piste à la radio",
    tagline: "Masterclass Inversée",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • STRATÉGIE AUX FRAISES"
  },
  {
    id: 'toto-angry',
    titre: "La fureur de Toto Wolff",
    sousTitre: "Le casque de radio explose sur le bureau après un désastre en piste !",
    categorie: 'low',
    image: '/images/anecdote/low/toto-angry.png',
    radioCitation: "« Michael, Michael, no, no, no, no... Michael, that was so not right! »",
    auteurCitation: "Toto Wolff à la radio de direction de course",
    tagline: "Colère Noire",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • CASQUE VOLANT"
  },
  {
    id: 'alonso-lose',
    titre: "Le regard d'Alonso",
    sousTitre: "Le regard dans le vide qui en dit long sur le scénario catastrophe du week-end...",
    categorie: 'low',
    image: '/images/anecdote/low/alonso-lose.png',
    radioCitation: "« ... » — Le silence assourdissant après la désillusion totale.",
    auteurCitation: "Fernando Alonso, Parc Fermé",
    tagline: "Désillusion",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • CATASTROPHE"
  },
  {
    id: 'charles-banana',
    titre: "Charles Leclerc en Banane",
    sousTitre: "Quand le week-end part en vrille, autant enfiler le costume de clown !",
    categorie: 'low',
    image: '/images/anecdote/low/charles-banana.png',
    radioCitation: "« NONNNN ! NONNNN ! Je suis stupide... Je suis stupide ! »",
    auteurCitation: "Charles Leclerc à la radio de l'écurie",
    tagline: "Auto-dérision",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • DÉLIRIUM"
  },
  {
    id: 'fernando-engine',
    titre: "« Moteur de GP2 ! »",
    sousTitre: "Un déficit de puissance colossal sur les lignes droites et zéro point au compteur.",
    categorie: 'low',
    image: '/images/anecdote/low/fernando-engine.png',
    radioCitation: "« Moteur de GP2 ! Moteur de GP2 ! Argh ! C'est embarrassant... très embarrassant ! »",
    auteurCitation: "Fernando Alonso à Suzuka",
    tagline: "Zéro Puissance",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • MOTEUR DE GP2"
  },
  {
    id: 'kimiboat',
    titre: "Kimi va direct sur son yacht",
    sousTitre: "Abandon précoce ? Pas le temps de débriefer, direction le jacuzzi et une glace !",
    categorie: 'low',
    image: '/images/anecdote/low/kimiboat.png',
    radioCitation: "« La voiture ne marche plus. Je rentre directement au port. Ne m'attendez pas pour le débrief. »",
    auteurCitation: "Kimi Räikkönen à Monaco",
    tagline: "Mode Océan",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • ABANDON & YACHT"
  },
  {
    id: 'singapore-crash',
    titre: "Le crash au premier virage",
    sousTitre: "Tout perdre avant même d'avoir bouclé le premier virage de la course !",
    categorie: 'low',
    image: '/images/anecdote/low/singapore-crash.png',
    radioCitation: "« Non ! Mais qu'est-ce qu'il a fait ?! Tout le monde au tas ! »",
    auteurCitation: "Sebastian Vettel à la radio",
    tagline: "Carambolage",
    badgeCouleur: "#e10600",
    badgeTexte: "0 - 15 PTS • CARAMBOLAGE"
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
    radioCitation: "«  Je conçois qu'il y a pire dans la vie que d'être le fils d'un milliardaire, j'en suis conscient. »",
    auteurCitation: "Lance Stroll",
    tagline: "En embuscade",
    badgeCouleur: "#f39c12",
    badgeTexte: "16 - 30 PTS • EN EMBUSCADE"
  },
  {
    id: 'alonso-cool',
    titre: "Fernando en mode transat",
    sousTitre: "Quand la course t'échappe mais que tu gardes un flegme légendaire au bord de la piste.",
    categorie: 'mid',
    image: '/images/anecdote/mid/alonso-cool.png',
    radioCitation: "« C'est bon, installez-moi un transat... J'attends la fin de la séance au soleil. »",
    auteurCitation: "Fernando Alonso, Interlagos",
    tagline: "Détente Totale",
    badgeCouleur: "#f39c12",
    badgeTexte: "16 - 30 PTS • TRANQUILLE AU SOLEIL"
  },
  {
    id: 'battleofchamp',
    titre: "Le duel des champions",
    sousTitre: "Roue contre roue, étincelles et monoplace empilée à la chicane !",
    categorie: 'mid',
    image: '/images/anecdote/mid/battleofchamp.png',
    radioCitation: "« C'est ce qui arrive quand on ne laisse aucun espace en piste ! »",
    auteurCitation: "Max Verstappen à Monza",
    tagline: "Duel Musclé",
    badgeCouleur: "#f39c12",
    badgeTexte: "16 - 30 PTS • CONTACT RUGUEUX"
  },
  {
    id: 'givemywheels',
    titre: "« Rendez-moi mon volant ! »",
    sousTitre: "Quand les mécanos oublient l'élément principal avant de repartir !",
    categorie: 'mid',
    image: '/images/anecdote/mid/givemywheels.png',
    radioCitation: "«  Get my gloves and steering wheel! Gloves! Mark, gloves! Steering wheel! Gloves and steering wheel, yeah! Hey! Hey! Steering wheel, somebody tell him to give it to me! Come on! Move!  »",
    auteurCitation: "Kimi Räikkönen à Bakou",
    tagline: "Panique aux Stands",
    badgeCouleur: "#f39c12",
    badgeTexte: "16 - 30 PTS • OUBLI DU VOLANT"
  },
  {
    id: 'max-baku',
    titre: "Le coup de pied de dépit",
    sousTitre: "La victoire s'envole en pleine ligne droite alors que le rythme était pourtant parfait !",
    categorie: 'mid',
    image: '/images/anecdote/mid/max-baku.png',
    radioCitation: "« Le pneu a explosé ! On avait course gagnée les gars... »",
    auteurCitation: "Max Verstappen à Bakou",
    tagline: "Coup du Sort",
    badgeCouleur: "#f39c12",
    badgeTexte: "16 - 30 PTS • COUP DE DÉPIT"
  },
  {
    id: 'seb-canada',
    titre: "Le panneau numéro 1 inversé",
    sousTitre: "Privé de la première place sur une pénalité contestée, Seb remet les pendules à l'heure !",
    categorie: 'mid',
    image: '/images/anecdote/mid/seb-canada.png',
    radioCitation: "« Non, non, non ! Vous devez être aveugles pour nous coller une pénalité pour ça ! On méritait la gagne ! »",
    auteurCitation: "Sebastian Vettel au Canada",
    tagline: "Le Vrai Vainqueur",
    badgeCouleur: "#f39c12",
    badgeTexte: "16 - 30 PTS • PANNEAU DU CHEF"
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
