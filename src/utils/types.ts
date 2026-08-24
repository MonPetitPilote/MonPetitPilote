export interface Pilote {
  nom: string;
  ecurie: string;
  numero: string;
  pays: string;
  couleur: string;
  carImg: string;
  driverImg: string;
}

export interface GrandPrix {
  round: number;
  nom: string;
  circuit: string;
  pays: string;
  date: string;
}

export interface BadgeInfo {
  icone: string;
  nom: string;
  description: string;
}

export interface BonusLabelInfo {
  icone: string;
  nom: string;
}

export interface BonusPredictionsData {
  safetyCar: boolean | null;
  drapeauRouge: boolean | null;
  nombreDNF: number | null;
  polemanPodium: boolean | null;
}

export interface BonusReelData {
  safetyCar?: boolean;
  drapeauRouge?: boolean;
  nombreDNF?: number;
  polemanPodium?: boolean;
}

export interface DetailBonusItem {
  cle: string;
  correct: boolean;
  points: number;
}

export interface DetailPilote {
  pilote: string;
  points: number;
  statut: 'position_exacte' | 'dans_le_top10' | 'hors_top10' | string;
}

export interface BilanCalcul {
  pointsTotaux?: number;
  pointsGrille?: number;
  pointsPole?: number;
  pointsEcuries?: number;
  pointsBonus?: number;
  detailPilotes?: DetailPilote[];
  detailBonus?: DetailBonusItem[];
  jokerApplique?: boolean;
}

export interface PronosticDoc {
  uidJoueur: string;
  pseudo?: string;
  course: string;
  classementPilotes: string[];
  poleman: string;
  ecuriesTop: string[];
  ecuriesFlop: string[];
  joker: boolean;
  predictionsBonus?: BonusPredictionsData;
  bilanCalcul?: BilanCalcul;
  dateCreation?: any;
  dateModification?: any;
}

export interface LigueDoc {
  nom: string;
  code: string;
  createurUid: string;
  membres: string[];
  creeLe?: any;
}

export interface UtilisateurDoc {
  pseudo: string;
  email: string;
  dateInscription?: any;
  ligues?: string[];
  ligueActive?: string;
}

export interface JoueurClassement {
  uid: string;
  pseudo: string;
  points: number;
  nbPoleCorrecte: number;
  nbVictoireCorrecte: number;
  nbPodiumExact: number;
  nbLoupes: number;
  nbCoupDeFolie: number;
  [key: string]: any;
}

export interface StatistiquesSaison {
  joueurs: JoueurClassement[];
  badges: Record<string, string[]>;
  historiqueParJoueur: Record<string, Record<number, number>>;
  roundsCalcules: number[];
}
