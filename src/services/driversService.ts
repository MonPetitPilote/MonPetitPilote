import { doc, getDoc, type Firestore } from "firebase/firestore";
import { type Pilote } from "../utils/types";

export interface TeamConfig {
    nom: string;
    key: string;
    couleur: string;
    carImg: string;
    logoImg: string;
    pilotesDefaut: string[];
}

/**
 * Configuration officielle des 11 écuries F1 2026
 * Fournit automatiquement la couleur, la livrée monoplace (cars) et le logo officiel (team)
 */
export const TEAMS_CONFIG: Record<string, TeamConfig> = {
    "Red Bull": {
        nom: "Red Bull",
        key: "redbull",
        couleur: "#3671C6",
        carImg: "/images/cars/redbull.avif",
        logoImg: "/images/team/redbull.avif",
        pilotesDefaut: ["Max Verstappen", "Isack Hadjar"]
    },
    "Ferrari": {
        nom: "Ferrari",
        key: "ferrari",
        couleur: "#E80020",
        carImg: "/images/cars/ferrari.avif",
        logoImg: "/images/team/ferrari.avif",
        pilotesDefaut: ["Lewis Hamilton", "Charles Leclerc"]
    },
    "McLaren": {
        nom: "McLaren",
        key: "mclaren",
        couleur: "#FF8000",
        carImg: "/images/cars/mclaren.avif",
        logoImg: "/images/team/mclaren.avif",
        pilotesDefaut: ["Lando Norris", "Oscar Piastri"]
    },
    "Mercedes": {
        nom: "Mercedes",
        key: "mercedes",
        couleur: "#27CCB4",
        carImg: "/images/cars/mercedes.avif",
        logoImg: "/images/team/mercedes.avif",
        pilotesDefaut: ["George Russell", "Kimi Antonelli"]
    },
    "Aston Martin": {
        nom: "Aston Martin",
        key: "astonmartin",
        couleur: "#229971",
        carImg: "/images/cars/astonmartin.avif",
        logoImg: "/images/team/astonmartin.avif",
        pilotesDefaut: ["Fernando Alonso", "Lance Stroll"]
    },
    "Alpine": {
        nom: "Alpine",
        key: "alpine",
        couleur: "#0093CC",
        carImg: "/images/cars/alpine.avif",
        logoImg: "/images/team/alpine.avif",
        pilotesDefaut: ["Pierre Gasly", "Franco Colapinto"]
    },
    "Williams": {
        nom: "Williams",
        key: "williams",
        couleur: "#37BEDD",
        carImg: "/images/cars/williams.avif",
        logoImg: "/images/team/williams.avif",
        pilotesDefaut: ["Carlos Sainz", "Alex Albon"]
    },
    "Racing Bulls": {
        nom: "Racing Bulls",
        key: "racingbulls",
        couleur: "#6692FF",
        carImg: "/images/cars/racingbulls.avif",
        logoImg: "/images/team/racingbulls.avif",
        pilotesDefaut: ["Liam Lawson", "Arvid Lindblad"]
    },
    "Audi": {
        nom: "Audi",
        key: "audi",
        couleur: "#00E6C3",
        carImg: "/images/cars/audi.avif",
        logoImg: "/images/team/audi.avif",
        pilotesDefaut: ["Nico Hülkenberg", "Gabriel Bortoleto"]
    },
    "Haas": {
        nom: "Haas",
        key: "haas",
        couleur: "#B6BABD",
        carImg: "/images/cars/haas.avif",
        logoImg: "/images/team/haas.avif",
        pilotesDefaut: ["Oliver Bearman", "Esteban Ocon"]
    },
    "Cadillac": {
        nom: "Cadillac",
        key: "cadillac",
        couleur: "#900C3F",
        carImg: "/images/cars/cadillac.avif",
        logoImg: "/images/team/cadillac.avif",
        pilotesDefaut: ["Valtteri Bottas", "Sergio Pérez"]
    }
};

/**
 * Base de données des métadonnées des pilotes connus (numéro, pays, portrait)
 */
export const PILOTES_METADATA: Record<string, { code: string; numero: string; pays: string; img: string }> = {
    "max verstappen": { code: "VER", numero: "3", pays: "nl", img: "/images/drivers/ver.avif" },
    "isack hadjar": { code: "HAD", numero: "43", pays: "fr", img: "/images/drivers/had.avif" },
    "lewis hamilton": { code: "HAM", numero: "44", pays: "gb", img: "/images/drivers/ham.avif" },
    "charles leclerc": { code: "LEC", numero: "16", pays: "mc", img: "/images/drivers/lec.avif" },
    "lando norris": { code: "NOR", numero: "1", pays: "gb", img: "/images/drivers/nor.avif" },
    "oscar piastri": { code: "PIA", numero: "81", pays: "au", img: "/images/drivers/pia.avif" },
    "george russell": { code: "RUS", numero: "63", pays: "gb", img: "/images/drivers/rus.avif" },
    "kimi antonelli": { code: "ANT", numero: "12", pays: "it", img: "/images/drivers/ant.avif" },
    "fernando alonso": { code: "ALO", numero: "14", pays: "es", img: "/images/drivers/alo.avif" },
    "lance stroll": { code: "STR", numero: "18", pays: "ca", img: "/images/drivers/str.avif" },
    "pierre gasly": { code: "GAS", numero: "10", pays: "fr", img: "/images/drivers/gas.avif" },
    "franco colapinto": { code: "COL", numero: "43", pays: "ar", img: "/images/drivers/col.avif" },
    "carlos sainz": { code: "SAI", numero: "55", pays: "es", img: "/images/drivers/sai.avif" },
    "alex albon": { code: "ALB", numero: "23", pays: "th", img: "/images/drivers/alb.avif" },
    "liam lawson": { code: "LAW", numero: "30", pays: "nz", img: "/images/drivers/law.avif" },
    "arvid lindblad": { code: "LIN", numero: "40", pays: "gb", img: "/images/drivers/lin.avif" },
    "nico hulkenberg": { code: "HUL", numero: "27", pays: "de", img: "/images/drivers/hul.avif" },
    "nico hülkenberg": { code: "HUL", numero: "27", pays: "de", img: "/images/drivers/hul.avif" },
    "gabriel bortoleto": { code: "BOR", numero: "5", pays: "br", img: "/images/drivers/bor.avif" },
    "oliver bearman": { code: "BEA", numero: "87", pays: "gb", img: "/images/drivers/bea.avif" },
    "esteban ocon": { code: "OCO", numero: "31", pays: "fr", img: "/images/drivers/oco.avif" },
    "valtteri bottas": { code: "BOT", numero: "77", pays: "fi", img: "/images/drivers/bot.avif" },
    "sergio perez": { code: "PER", numero: "11", pays: "mx", img: "/images/drivers/per.avif" },
    "sergio pérez": { code: "PER", numero: "11", pays: "mx", img: "/images/drivers/per.avif" }
};

/**
 * Normalise une chaîne de caractères pour faciliter la recherche
 */
function clean(str?: string | null): string {
    return (str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

/**
 * Trouve la configuration d'écurie correspondante
 */
export function trouverTeamConfig(nomOuCle?: string | null): TeamConfig {
    if (!nomOuCle) return TEAMS_CONFIG["Red Bull"];
    const c = clean(nomOuCle);
    
    // Recherche directe par clé ou nom
    for (const team of Object.values(TEAMS_CONFIG)) {
        if (clean(team.nom) === c || clean(team.key) === c) {
            return team;
        }
    }
    
    // Recherche partielle
    for (const team of Object.values(TEAMS_CONFIG)) {
        if (clean(team.nom).includes(c) || c.includes(clean(team.nom))) {
            return team;
        }
    }
    
    return TEAMS_CONFIG["Red Bull"];
}

/**
 * Trouve l'écurie d'un pilote en fonction de son nom ou de son affectation
 */
export function trouverEcuriePourPilote(nomPilote?: string | null, ecurieForcee?: string): string {
    if (ecurieForcee && TEAMS_CONFIG[ecurieForcee]) {
        return ecurieForcee;
    }
    const c = clean(nomPilote);
    if (!c) return "Red Bull";

    for (const [nomEcurie, config] of Object.entries(TEAMS_CONFIG)) {
        if (config.pilotesDefaut.some(p => clean(p) === c || clean(p).includes(c) || c.includes(clean(p)))) {
            return nomEcurie;
        }
    }
    return "Red Bull";
}

/**
 * Construit dynamiquement l'objet Pilote complet à partir de son nom et de son écurie.
 * Récupère automatiquement :
 * - Couleur de l'écurie
 * - Image de la voiture (public/images/cars/...)
 * - Logo officiel de l'écurie (public/images/team/...)
 * - Portrait du pilote (public/images/drivers/...)
 * - Numéro et drapeau
 */
export function resoudrePilote(nom: string, ecurieOptionnelle?: string): Pilote {
    const ecurie = ecurieOptionnelle || trouverEcuriePourPilote(nom);
    const teamConfig = trouverTeamConfig(ecurie);
    const meta = PILOTES_METADATA[clean(nom)];

    // Déterminer le portrait du pilote (fichier dans /images/drivers/...)
    let driverImg = "";
    if (meta && meta.img) {
        driverImg = meta.img;
    } else {
        // Tentative de déduction du nom de fichier (ex: ver.avif, had.avif)
        const parts = clean(nom).split(" ");
        const nomFamille = parts[parts.length - 1] || "";
        const trigramme = nomFamille.substring(0, 3);
        driverImg = `/images/drivers/${trigramme}.avif`;
    }

    return {
        nom: nom.trim(),
        ecurie: teamConfig.nom,
        numero: meta ? meta.numero : "0",
        pays: meta ? meta.pays : "un",
        couleur: teamConfig.couleur,
        carImg: teamConfig.carImg,
        driverImg: driverImg
    };
}

/**
 * Génère la liste des pilotes par défaut à partir de la configuration des écuries
 */
export function genererPilotesInitiaux(): Pilote[] {
    const list: Pilote[] = [];
    for (const team of Object.values(TEAMS_CONFIG)) {
        for (const nomPilote of team.pilotesDefaut) {
            list.push(resoudrePilote(nomPilote, team.nom));
        }
    }
    return list;
}

// Liste courante réactive des pilotes dans l'application
export let pilotesActifs: Pilote[] = genererPilotesInitiaux();

/**
 * Met à jour la liste des pilotes actifs (par exemple lors d'un remplacement de pilote sur un GP)
 */
export function definirPilotesActifs(nouveauxPilotes: Array<{ nom: string; ecurie?: string }>): void {
    pilotesActifs = nouveauxPilotes.map(p => resoudrePilote(p.nom, p.ecurie));
}

/**
 * Synchronise les pilotes d'un Grand Prix depuis l'API publique F1 ou Firestore
 */
export async function synchroniserPilotesGP(round?: number, db?: Firestore): Promise<Pilote[]> {
    // 1. Tenter depuis Firestore (document spécifique de personnalisation si pilote remplacé)
    if (db) {
        try {
            const docRef = doc(db, "configuration_saison", "pilotes_2026");
            const snap = await getDoc(docRef);
            if (snap.exists() && Array.isArray(snap.data()?.pilotes)) {
                const listeFS = snap.data().pilotes;
                definirPilotesActifs(listeFS);
                return pilotesActifs;
            }
        } catch (_) {}
    }

    // 2. Tenter depuis l'API F1 Jolpica / Ergast
    try {
        const url = round 
            ? `https://api.jolpica.com/ergast/f1/2026/${round}/drivers.json`
            : `https://api.jolpica.com/ergast/f1/2026/drivers.json`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
            const data = await res.json();
            const drivers = data?.MRData?.DriverTable?.Drivers;
            if (Array.isArray(drivers) && drivers.length >= 10) {
                const list = drivers.map((d: any) => {
                    const nomComplet = `${d.givenName} ${d.familyName}`;
                    return resoudrePilote(nomComplet);
                });
                pilotesActifs = list;
                return pilotesActifs;
            }
        }
    } catch (_) {}

    return pilotesActifs;
}