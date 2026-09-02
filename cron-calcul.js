const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');

try {
    initializeApp();
    console.log("🚀 [Firebase] Connexion réussie de manière native !");
} catch (e) {
    console.error("❌ Erreur critique d'initialisation de Firebase :", e.message);
    process.exit(1);
}

const db = getFirestore();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Compare deux noms sans tenir compte des accents ni de la casse
function normaliserNom(texte) {
    return (texte || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function nomsCorrespondent(nomA, nomB) {
    const a = normaliserNom(nomA);
    const b = normaliserNom(nomB);
    if (!a || !b) return false;
    return a === b || a.includes(b) || b.includes(a);
}

// ==========================================================
// CALENDRIER DYNAMIQUE — lu depuis Firestore configuration_saison/calendrier_2026
// ==========================================================
// Le tableau ci-dessous ne sert PLUS de source principale : il n'est utilisé
// qu'en dernier recours si Firestore est injoignable ou si aucun GP ne
// correspond dans le calendrier officiel synchronisé (configuration_saison).
// C'est cette dérive (mapping en dur désynchronisé du vrai calendrier,
// par ex. après l'ajout du GP de Madrid) qui causait des rounds erronés
// et donc des comparatifs "prono vs résultat" complètement faux.
const calendrier2026ParLieuSecours = {
    "melbourne": 1, "australia": 1,
    "shanghai": 2, "china": 2,
    "suzuka": 3, "japan": 3,
    "miami gardens": 4, "miami": 4, "united states": 4,
    "montreal": 5, "montréal": 5, "canada": 5,
    "monte carlo": 6, "monaco": 6,
    "barcelona": 7, "spain": 7, "espagne": 7,
    "spielberg": 8, "austria": 8, "autriche": 8,
    "silverstone": 9, "great britain": 9, "united kingdom": 9,
    "spa-francorchamps": 10, "spa": 10, "belgium": 10, "belgique": 10,
    "budapest": 11, "hungary": 11, "hongrie": 11,
    "zandvoort": 12, "netherlands": 12, "pays-bas": 12,
    "monza": 13, "italy": 13, "italie": 13,
    "madrid": 14,
    "baku": 15, "azerbaijan": 15, "azerbaidjan": 15,
    "marina bay": 16, "singapore": 16, "singapour": 16,
    "austin": 17,
    "mexico city": 18, "mexico": 18, "mexique": 18,
    "sao paulo": 19, "são paulo": 19, "brazil": 19, "bresil": 19,
    "las vegas": 20,
    "lusail": 21, "qatar": 21,
    "yas marina": 22, "abu dhabi": 22, "united arab emirates": 22
};

// Charge le calendrier officiel depuis Firestore et construit une table de
// correspondance { valeur-normalisée -> round } à partir de nom/circuit/pays.
// Retourne null si le document est absent ou vide (le code appelant se
// rabat alors sur calendrier2026ParLieuSecours).
async function chargerCalendrierDynamique() {
    try {
        const docSnap = await db.collection("configuration_saison").doc("calendrier_2026").get();
        if (!docSnap.exists) {
            console.log("⚠️ configuration_saison/calendrier_2026 introuvable — repli sur le calendrier codé en dur.");
            return null;
        }

        const data = docSnap.data();
        const grandsPrix = data.grandsPrix || [];
        if (grandsPrix.length === 0) {
            console.log("⚠️ configuration_saison/calendrier_2026 est vide — repli sur le calendrier codé en dur.");
            return null;
        }

        const table = {};
        // Compte les occurrences de chaque valeur normalisée (nom/circuit/pays) sur
        // l'ensemble de la saison, pour détecter les valeurs ambiguës (ex : "Spain"
        // ou "United States" apparaissent sur PLUSIEURS GP la même saison) et les
        // exclure de la table — sinon le dernier GP traité écrase le round du premier.
        const occurrences = {};
        grandsPrix.forEach(gp => {
            [gp.nom, gp.circuit, gp.pays].forEach(valeur => {
                const cle = normaliserNom(valeur);
                if (!cle) return;
                occurrences[cle] = (occurrences[cle] || 0) + 1;
            });
        });

        grandsPrix.forEach(gp => {
            if (!gp.round) return;
            [gp.nom, gp.circuit, gp.pays].forEach(valeur => {
                const cle = normaliserNom(valeur);
                if (cle && occurrences[cle] === 1) table[cle] = gp.round;
            });
        });

        console.log(`✅ Calendrier dynamique chargé depuis Firestore : ${grandsPrix.length} GP, ${Object.keys(table).length} clés de correspondance.`);
        return table;
    } catch (err) {
        console.log(`⚠️ Impossible de charger configuration_saison/calendrier_2026 : ${err.message} — repli sur le calendrier codé en dur.`);
        return null;
    }
}

// Déduit le round d'une session OpenF1 en interrogeant D'ABORD le calendrier
// dynamique (Firestore), puis en dernier recours le tableau codé en dur.
function deduireRound(session, calendrierDynamique) {
    if (!session) return null;
    const location = normaliserNom(session.location);
    const country = normaliserNom(session.country_name);
    const circuit = normaliserNom(session.circuit_short_name);

    // 1. Calendrier dynamique (source de vérité)
    if (calendrierDynamique) {
        if (calendrierDynamique[location]) return calendrierDynamique[location];
        if (calendrierDynamique[circuit]) return calendrierDynamique[circuit];
        if (calendrierDynamique[country]) return calendrierDynamique[country];

        for (const [cle, r] of Object.entries(calendrierDynamique)) {
            if (location.includes(cle) || circuit.includes(cle) || country.includes(cle) ||
                cle.includes(location) || cle.includes(circuit)) {
                return r;
            }
        }
    }

    // 2. Repli : tableau codé en dur (uniquement si Firestore indisponible/pas de match)
    if (calendrier2026ParLieuSecours[location]) return calendrier2026ParLieuSecours[location];
    if (calendrier2026ParLieuSecours[circuit]) return calendrier2026ParLieuSecours[circuit];
    if (calendrier2026ParLieuSecours[country]) return calendrier2026ParLieuSecours[country];

    for (const [cle, r] of Object.entries(calendrier2026ParLieuSecours)) {
        if (location.includes(cle) || circuit.includes(cle) || country.includes(cle)) {
            console.log(`⚠️ Round pour "${session.location}" trouvé uniquement via le calendrier de secours (round ${r}). Vérifie que configuration_saison/calendrier_2026 est à jour.`);
            return r;
        }
    }
    return null;
}

const pilotesData = [
  { nom: "Max Verstappen", ecurie: "Red Bull", numero: "3", pays: "nl", couleur: "#3671C6" },
  { nom: "Isack Hadjar", ecurie: "Red Bull", numero: "43", pays: "fr", couleur: "#3671C6" },
  { nom: "Lewis Hamilton", ecurie: "Ferrari", numero: "44", pays: "gb", couleur: "#E80020" },
  { nom: "Charles Leclerc", ecurie: "Ferrari", numero: "16", pays: "mc", couleur: "#E80020" },
  { nom: "Lando Norris", ecurie: "McLaren", numero: "1", pays: "gb", couleur: "#FF8000" },
  { nom: "Oscar Piastri", ecurie: "McLaren", numero: "81", pays: "au", couleur: "#FF8000" },
  { nom: "George Russell", ecurie: "Mercedes", numero: "63", pays: "gb", couleur: "#27CCB4" },
  { nom: "Kimi Antonelli", ecurie: "Mercedes", numero: "12", pays: "it", couleur: "#27CCB4" },
  { nom: "Fernando Alonso", ecurie: "Aston Martin", numero: "14", pays: "es", couleur: "#229971" },
  { nom: "Lance Stroll", ecurie: "Aston Martin", numero: "18", pays: "ca", couleur: "#229971" },
  { nom: "Pierre Gasly", ecurie: "Alpine", numero: "10", pays: "fr", couleur: "#0093CC" },
  { nom: "Franco Colapinto", ecurie: "Alpine", numero: "43", pays: "ar", couleur: "#0093CC" },
  { nom: "Carlos Sainz", ecurie: "Williams", numero: "55", pays: "es", couleur: "#37BEDD" },
  { nom: "Alex Albon", ecurie: "Williams", numero: "23", pays: "th", couleur: "#37BEDD" },
  { nom: "Liam Lawson", ecurie: "Racing Bulls", numero: "30", pays: "nz", couleur: "#6692FF" },
  { nom: "Arvid Lindblad", ecurie: "Racing Bulls", numero: "40", pays: "gb", couleur: "#6692FF" },
  { nom: "Nico Hülkenberg", ecurie: "Audi", numero: "27", pays: "de", couleur: "#00E6C3" },
  { nom: "Gabriel Bortoleto", ecurie: "Audi", numero: "5", pays: "br", couleur: "#00E6C3" },
  { nom: "Oliver Bearman", ecurie: "Haas", numero: "87", pays: "gb", couleur: "#B6BABD" },
  { nom: "Esteban Ocon", ecurie: "Haas", numero: "31", pays: "fr", couleur: "#B6BABD" },
  { nom: "Valtteri Bottas", ecurie: "Cadillac", numero: "77", pays: "fi", couleur: "#900C3F" },
  { nom: "Sergio Pérez", ecurie: "Cadillac", numero: "11", pays: "mx", couleur: "#900C3F" }
];

// ==========================================================
// MODULE PRÉDICTIONS BONUS — détection via OpenF1
// ==========================================================

// Interroge race_control pour détecter Safety Car et Drapeau Rouge sur la session
async function detecterEvenementsRaceControl(sessionKey) {
    let safetyCar = false;
    let drapeauRouge = false;
    const pilotesAbandonsSet = new Set();

    try {
        const res = await axios.get(`https://api.openf1.org/v1/race_control?session_key=${sessionKey}`, { timeout: 10000 });
        const messages = res.data || [];

        messages.forEach(msg => {
            const categorie = (msg.category || "").toLowerCase();
            const flag = (msg.flag || "").toUpperCase();
            const message = (msg.message || "").toLowerCase();

            // Détection Safety Car (Physique ou VSC déployée)
            if (
                categorie.includes("safetycar") ||
                categorie.includes("safety car") ||
                message.includes("safety car") ||
                message.includes("vsc") ||
                message.includes("virtual safety car")
            ) {
                safetyCar = true;
            }

            // Détection Drapeau Rouge
            if (
                flag === "RED" ||
                categorie.includes("red") ||
                message.includes("red flag") ||
                message.includes("drapeau rouge") ||
                message.includes("session suspended")
            ) {
                drapeauRouge = true;
            }

            // Détection des abandons notifiés en direction de course
            if (
                message.includes("retired") ||
                message.includes("stopped") ||
                message.includes("out of the race") ||
                message.includes("pit exit closed") ||
                message.includes("car stopped")
            ) {
                if (msg.driver_number) {
                    pilotesAbandonsSet.add(String(msg.driver_number));
                }
            }
        });
    } catch (err) {
        console.log(`ℹ️ Impossible de récupérer race_control pour la session ${sessionKey} : ${err.message}`);
    }

    return { safetyCar, drapeauRouge, pilotesAbandonsSet };
}

// ==========================================================
// MODULE POLEMAN & DNF AVEC MULTI-SOURCES (OpenF1 + Jolpica fallback)
// ==========================================================

async function trouverPolemanOfficiel(session, round, trouverNomPiloteFn) {
    let poleman = "Inconnu";

    // Source 1 : Jolpica / Ergast F1 API (Résultats officiels FIA de qualifications Q1/Q2/Q3 validés)
    if (round) {
        try {
            console.log(`🌐 Interrogation Jolpica F1 API pour la Pole (Round ${round})...`);
            const resJolpica = await axios.get(`https://api.jolpi.ca/ergast/f1/2026/${round}/qualifying.json`, { timeout: 8000 });
            const raceData = resJolpica.data?.MRData?.RaceTable?.Races?.[0];
            const p1Result = raceData?.QualifyingResults?.[0];
            if (p1Result && p1Result.Driver) {
                const driver = p1Result.Driver;
                const nomComplet = `${driver.givenName || ''} ${driver.familyName || ''}`.trim();
                const matchLocal = pilotesData.find(p => 
                    (p1Result.number && String(p.numero) === String(p1Result.number)) ||
                    nomsCorrespondent(p.nom, nomComplet) || 
                    (driver.code && nomsCorrespondent(p.nom, driver.code))
                );
                poleman = matchLocal ? matchLocal.nom : nomComplet;
                console.log(`🌐 Poleman extrait avec succès depuis Jolpica API : ${poleman} (${p1Result.number ? '#' + p1Result.number : ''})`);
                return poleman;
            }
        } catch (jolpicaErr) {
            console.log(`ℹ️ Jolpica qualif non disponible pour Round ${round} : ${jolpicaErr.message}`);
        }
    }

    // Source 2 : OpenF1 via Qualifying Session (Analyse des positions ou meilleurs tours)
    try {
        let qSessionKey = null;

        // 2.1 Recherche par meeting_key : cibler strictement la session de qualification principale du Grand Prix
        if (session.meeting_key) {
            const resMeeting = await axios.get(`https://api.openf1.org/v1/sessions?year=2026&meeting_key=${session.meeting_key}`, { timeout: 10000 });
            const sessionsDispo = resMeeting.data || [];
            let qualifSession = sessionsDispo.find(s => 
                (s.session_name && s.session_name.toLowerCase() === "qualifying") ||
                (s.session_type && s.session_type.toLowerCase() === "qualifying" && !s.session_name.toLowerCase().includes("sprint"))
            );
            if (!qualifSession) {
                qualifSession = sessionsDispo.find(s => 
                    s.session_name && s.session_name.toLowerCase().includes("qualifying") && !s.session_name.toLowerCase().includes("sprint")
                );
            }
            if (!qualifSession) {
                qualifSession = sessionsDispo.find(s => 
                    (s.session_name && s.session_name.toLowerCase().includes("qualifying")) ||
                    (s.session_type && s.session_type.toLowerCase().includes("qualifying"))
                );
            }
            if (qualifSession) qSessionKey = qualifSession.session_key;
        }

        // 2.2 Recherche de secours par location/circuit
        if (!qSessionKey) {
            const resLoc = await axios.get(`https://api.openf1.org/v1/sessions?year=2026&session_name=Qualifying&location=${encodeURIComponent(session.location || '')}`, { timeout: 10000 });
            if (resLoc.data && resLoc.data.length > 0) {
                qSessionKey = resLoc.data[0].session_key;
            }
        }

        if (qSessionKey) {
            // Tentative 1 : position=1 en fin de séance de qualification
            try {
                const resPositionsQ = await axios.get(`https://api.openf1.org/v1/position?session_key=${qSessionKey}&position=1`, { timeout: 10000 });
                if (resPositionsQ.data && resPositionsQ.data.length > 0) {
                    const requetesTriees = resPositionsQ.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                    const numDriver = requetesTriees[0].driver_number;
                    poleman = trouverNomPiloteFn(numDriver);
                    console.log(`⏱️ Poleman détecté via position=1 OpenF1 : ${poleman} (#${numDriver})`);
                }
            } catch (posErr) {
                console.log(`ℹ️ Positions qualif non disponibles : ${posErr.message}`);
            }

            // Tentative 2 : tour le plus rapide en qualification
            if (!poleman || poleman === "Inconnu") {
                try {
                    const resLapsQ = await axios.get(`https://api.openf1.org/v1/laps?session_key=${qSessionKey}`, { timeout: 10000 });
                    const laps = (resLapsQ.data || []).filter(l => l.lap_duration && l.lap_duration > 50 && !l.is_pit_out_lap);
                    if (laps.length > 0) {
                        laps.sort((a, b) => a.lap_duration - b.lap_duration);
                        const meilleurPiloteNum = laps[0].driver_number;
                        if (meilleurPiloteNum) {
                            poleman = trouverNomPiloteFn(meilleurPiloteNum);
                            console.log(`⏱️ Poleman détecté via meilleur tour Qualif OpenF1 : ${poleman} (#${meilleurPiloteNum})`);
                        }
                    }
                } catch (lapsErr) {
                    console.log(`ℹ️ Laps qualif non disponibles : ${lapsErr.message}`);
                }
            }
        }
    } catch (openf1Err) {
        console.log(`ℹ️ OpenF1 qualif non disponible : ${openf1Err.message}`);
    }

    return poleman;
}

// Calcule avec précision le nombre de DNF via les tours complétés, race_control et secours Jolpica
async function calculerNombreDNF(sessionKey, nombrePilotesAuDepart, abandonsRaceControl, round) {
    try {
        const resLaps = await axios.get(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`, { timeout: 12000 });
        const tours = resLaps.data || [];

        if (tours.length > 0) {
            let maxToursCourse = 0;
            const toursParPilote = {};

            tours.forEach(t => {
                const num = String(t.driver_number);
                const tourNum = Number(t.lap_number) || 0;
                if (tourNum > maxToursCourse) maxToursCourse = tourNum;
                if (!toursParPilote[num] || tourNum > toursParPilote[num]) {
                    toursParPilote[num] = tourNum;
                }
            });

            if (maxToursCourse > 10) {
                // En F1, un pilote qui ne termine pas la course ou a parcouru < 90% des tours
                const seuilDNF = Math.floor(maxToursCourse * 0.90);
                let dnfCount = 0;

                Object.keys(toursParPilote).forEach(num => {
                    const toursPilote = toursParPilote[num];
                    if (toursPilote < seuilDNF || (abandonsRaceControl && abandonsRaceControl.has(num))) {
                        dnfCount++;
                    }
                });

                console.log(`ℹ️ Tours max: ${maxToursCourse} | Détection DNF via analyse des tours: ${dnfCount}`);
                return Math.max(dnfCount, (abandonsRaceControl ? abandonsRaceControl.size : 0));
            }
        }
    } catch (err) {
        console.log(`ℹ️ Calcul DNF via laps non disponible : ${err.message}`);
    }

    // Repli de secours 1 : Direction de course
    if (abandonsRaceControl && abandonsRaceControl.size > 0) {
        return abandonsRaceControl.size;
    }

    // Repli de secours 2 : Jolpica F1 Results API
    if (round) {
        try {
            const resJolpicaRes = await axios.get(`https://api.jolpi.ca/ergast/f1/2026/${round}/results.json`, { timeout: 8000 });
            const results = resJolpicaRes.data?.MRData?.RaceTable?.Races?.[0]?.Results || [];
            if (results.length > 0) {
                const dnfs = results.filter(r => {
                    const status = (r.status || "").toLowerCase();
                    return status !== "finished" && !status.startsWith("+");
                });
                console.log(`🌐 Abandons (DNF) extraits depuis Jolpica API : ${dnfs.length}`);
                return dnfs.length;
            }
        } catch (jErr) {
            // Silencieux
        }
    }

    return 0;
}

async function demarrer() {
    console.log("🤖 Lancement du cron de calcul automatique OpenF1 2026 (Mode Linéaire)...");

    // Charge le calendrier officiel une seule fois, avant de traiter les sessions.
    const calendrierDynamique = await chargerCalendrierDynamique();

    try {
        console.log("📡 Récupération du calendrier des sessions 2026 depuis OpenF1...");
        const resSessions = await axios.get("https://api.openf1.org/v1/sessions?year=2026&session_name=Race", { timeout: 10000 });
        
        if (!resSessions.data || resSessions.data.length === 0) {
            console.log("⚠️ Aucune session de course trouvée pour 2026 sur OpenF1.");
            return;
        }

        const sessionsChronologiques = resSessions.data.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        console.log(`ℹ️ ${sessionsChronologiques.length} sessions réelles détectées dans l'API.`);

        for (let index = 0; index < sessionsChronologiques.length; index++) {
            const session = sessionsChronologiques[index];
            const sessionKey = session.session_key;
            const round = deduireRound(session, calendrierDynamique);
            
            if (!round) {
                console.log(`\nℹ️ Circuit "${session.location || session.circuit_short_name}" non configuré ou non requis. Passage.`);
                continue;
            }

            const gpId = `2026/${round}`;
            console.log(`\n🏁 --- Analyse : ${session.location || session.circuit_short_name} | Round Site : ${round} | Clé Session : ${sessionKey} ---`);

            await sleep(2000);

            const histoRef = db.collection("historique_courses").doc(`2026_${round}`);
            const histoDoc = await histoRef.get();
            const polemanDejaValide = histoDoc.exists && histoDoc.data().poleman && histoDoc.data().poleman !== "Inconnu";
            if (histoDoc.exists && histoDoc.data().bonusReel !== undefined && polemanDejaValide) {
                console.log(`ℹ️ Le GP ${round} (${session.location}) a déjà été calculé avec les bonus et le poleman officiel (${histoDoc.data().poleman}). Passage.`);
                continue;
            }

            console.log(`📡 Récupération des pilotes pour la session ${sessionKey}...`);
            let pilotesSession = [];
            try {
                const resDrivers = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { timeout: 10000 });
                pilotesSession = resDrivers.data || [];
            } catch (driverErr) {
                console.error(`❌ Impossible de récupérer les pilotes :`, driverErr.message);
                continue;
            }

            const trouverNomPilote = (driverNumber) => {
                const localMatch = pilotesData.find(p => String(p.numero) === String(driverNumber));
                if (localMatch) return localMatch.nom;
                const match = pilotesSession.find(p => String(p.driver_number) === String(driverNumber));
                if (match) return match.full_name || match.broadcast_name || `${match.first_name} ${match.last_name}`;
                return `Numéro ${driverNumber}`;
            };

            const trouverEcuriePilote = (driverNumber) => {
                const match = pilotesSession.find(p => String(p.driver_number) === String(driverNumber));
                if (match && match.team_name) return match.team_name;
                const localMatch = pilotesData.find(p => String(p.numero) === String(driverNumber));
                return localMatch ? localMatch.ecurie : "";
            };

            let resPositions;
            try {
                resPositions = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { timeout: 15000 });
            } catch (posErr) {
                console.error(`❌ Impossible de charger les positions :`, posErr.message);
                continue;
            }

            if (!resPositions.data || resPositions.data.length === 0) {
                console.log(`⚠️ Données de position vides pour ${session.location}.`);
                continue;
            }

            const records = resPositions.data;
            const derniersPositions = {};
            records.forEach(rec => {
                const driverNum = rec.driver_number;
                if (!derniersPositions[driverNum] || new Date(rec.date) > new Date(derniersPositions[driverNum].date)) {
                    derniersPositions[driverNum] = rec;
                }
            });

            const classementTrie = Object.values(derniersPositions).sort((a, b) => a.position - b.position);
            const top10OfficielNums = classementTrie.slice(0, 10).map(p => String(p.driver_number));

            if (top10OfficielNums.length < 10) {
                console.log(`⚠️ Classement final incomplet pour le GP ${round}.`);
                continue;
            }

            const top10OfficielNoms = top10OfficielNums.map(num => trouverNomPilote(num));
            console.log(`📊 Top 10 réel extrait :`, top10OfficielNoms);

            // --- Poleman (Multi-sources OpenF1 + Jolpica fallback) ---
            const polemanOfficiel = await trouverPolemanOfficiel(session, round, trouverNomPilote);
            console.log(`⚡ Poleman officiel retenu : ${polemanOfficiel}`);

            const vainqueurNumero = top10OfficielNums[0];
            const ecurieGagnanteRelle = trouverEcuriePilote(vainqueurNumero);

            // --- ÉCURIES : Calcul automatique des performances constructeurs sur le GP ---
            const pointsParEcurieGP = {};
            const positionsParEcurieGP = {};
            const ECURIES_OFFICIELLES = ["Red Bull", "Ferrari", "McLaren", "Mercedes", "Aston Martin", "Alpine", "Williams", "Racing Bulls", "Audi", "Haas", "Cadillac"];
            ECURIES_OFFICIELLES.forEach(ec => {
                pointsParEcurieGP[ec] = 0;
                positionsParEcurieGP[ec] = [];
            });

            const BAREME_CONSTRUCTEUR_GP = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
            top10OfficielNums.forEach((num, idx) => {
                const ec = trouverEcuriePilote(num);
                if (ec && pointsParEcurieGP[ec] !== undefined) {
                    pointsParEcurieGP[ec] += (BAREME_CONSTRUCTEUR_GP[idx] || 0);
                    positionsParEcurieGP[ec].push(idx + 1);
                }
            });

            const classementConstructeursGP = ECURIES_OFFICIELLES.map(ec => ({
                ecurie: ec,
                points: pointsParEcurieGP[ec] || 0,
                meilleurePos: positionsParEcurieGP[ec]?.length > 0 ? Math.min(...positionsParEcurieGP[ec]) : 99
            })).sort((a, b) => b.points - a.points || a.meilleurePos - b.meilleurePos);

            const topEcurie1GP = classementConstructeursGP[0]?.ecurie || ecurieGagnanteRelle;
            const topEcurie2GP = classementConstructeursGP[1]?.ecurie || "";
            const flopEcuriesGP = classementConstructeursGP.filter((item, idx) => item.points === 0 || idx >= 7).map(item => item.ecurie);
            console.log(`🏎️ Performances Constructeurs GP : Top 1=${topEcurie1GP} (${classementConstructeursGP[0]?.points} pts), Top 2=${topEcurie2GP} (${classementConstructeursGP[1]?.points} pts) | Flops=${flopEcuriesGP.join(', ')}`);

            // --- BONUS : Safety Car & Drapeau Rouge via race_control ---
            const evenements = await detecterEvenementsRaceControl(sessionKey);

            // --- BONUS : Nombre de DNF (laps + race_control + Jolpica) ---
            const nombrePilotesAuDepart = pilotesSession.length || 20;
            const nombreDNFReel = await calculerNombreDNF(sessionKey, nombrePilotesAuDepart, evenements.pilotesAbandonsSet, round);

            // --- BONUS : Poleman sur le podium ---
            const top3Noms = top10OfficielNoms.slice(0, 3);
            const polemanSurPodiumReel = polemanOfficiel !== "Inconnu" &&
                top3Noms.some(nom => nomsCorrespondent(nom, polemanOfficiel));

            const bonusReel = {
                safetyCar: Boolean(evenements.safetyCar),
                drapeauRouge: Boolean(evenements.drapeauRouge),
                nombreDNF: Number(nombreDNFReel) || 0,
                polemanPodium: Boolean(polemanSurPodiumReel)
            };

            console.log(`🎯 Résultats validés : P1 = ${top10OfficielNoms[0]} (${ecurieGagnanteRelle}) | Pole = ${polemanOfficiel}`);
            console.log(`🎲 Bonus réels :`, JSON.stringify(bonusReel));

            const querySnapshot = await db.collection("pronostics").where("course", "==", gpId).get();
            
            if (!querySnapshot.empty) {
                for (const doc of querySnapshot.docs) {
                    const pronoRef = doc.ref;
                    try {
                        await db.runTransaction(async (transaction) => {
                            const pronoDoc = await transaction.get(pronoRef);
                            if (!pronoDoc.exists) return;
                            
                            const pronoData = pronoDoc.data();
                            const grilleJoueur = pronoData.classementPilotes || [];
                            const polemanJoueur = pronoData.poleman || "";
                            const ecuriesTopJoueur = pronoData.ecuriesTop || [];
                            const ecuriesFlopJoueur = pronoData.ecuriesFlop || [];
                            const bonusJoueur = pronoData.predictionsBonus || {};
                            const pseudo = pronoData.pseudo || "Anonyme";

                            const BAREME_POSITION_EXACTE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
                            const POINTS_CONSOLATION = 2;
                            const POINTS_BONUS = 2;

                            let pointsDuTop10 = 0;
                            let bonusPole = 0;
                            const detailPilotes = [];

                            grilleJoueur.forEach((piloteChoisi, indexJoueur) => {
                                const indexReel = top10OfficielNoms.findIndex(pReel => nomsCorrespondent(pReel, piloteChoisi));

                                let pointsPosition = 0;
                                let statut = "hors_top10";

                                if (indexReel !== -1) {
                                    if (indexJoueur === indexReel) {
                                        pointsPosition = BAREME_POSITION_EXACTE[indexJoueur];
                                        statut = "position_exacte";
                                    } else {
                                        pointsPosition = POINTS_CONSOLATION;
                                        statut = "dans_le_top10";
                                    }
                                }

                                pointsDuTop10 += pointsPosition;
                                detailPilotes.push({ pilote: piloteChoisi, points: pointsPosition, statut });
                            });

                            if (polemanJoueur && polemanOfficiel !== "Inconnu" && nomsCorrespondent(polemanOfficiel, polemanJoueur)) {
                                bonusPole = 5;
                            }

                            // --- Calcul automatique des points Écuries Top / Flop (Cascade de Priorité) ---
                            let pointsDesEcuries = 0;
                            const detailEcuries = [];

                            // Déterminer le groupe championnat de l'écurie (Cadors 1-4, Milieu 5-7, Outsiders 8-11)
                            const determinerGroupe = (nomEc) => {
                                const idx = ECURIES_OFFICIELLES.findIndex(e => nomsCorrespondent(e, nomEc));
                                if (idx <= 3) return 'cador';
                                if (idx <= 6) return 'milieu';
                                return 'outsider';
                            };

                            const ecuriesPodiumGP = top10OfficielNums.slice(0, 3).map(num => trouverEcuriePilote(num)).filter(Boolean);

                            // 1. Écuries Top (Top 1 & Top 2)
                            ecuriesTopJoueur.forEach((ec, idx) => {
                                if (!ec) return;
                                const typePari = idx === 0 ? 'top1' : 'top2';
                                const groupe = determinerGroupe(ec);
                                const positions = positionsParEcurieGP[ec] || [];
                                const nbTop10 = positions.length;
                                const meilleurPos = positions.length > 0 ? Math.min(...positions) : 99;

                                let pts = 0;
                                let correct = false;
                                let desc = "";

                                if (groupe === 'outsider') {
                                    // Prio 1 (Outsiders)
                                    if (nbTop10 >= 2) {
                                        pts = 6;
                                        correct = true;
                                        desc = "Masterclass Outsider (2 pilotes Top 10)";
                                    } else if (nbTop10 >= 1) {
                                        pts = 4;
                                        correct = true;
                                        desc = `Exploit Outsider (Pilote P${meilleurPos})`;
                                    }
                                } else if (groupe === 'milieu') {
                                    // Prio 2 (Milieu)
                                    if (nbTop10 >= 2) {
                                        pts = 5;
                                        correct = true;
                                        desc = "Tir groupé Milieu (2 pilotes Top 10)";
                                    } else if (meilleurPos <= 6) {
                                        pts = 3;
                                        correct = true;
                                        desc = `Coup d'éclat Milieu (P${meilleurPos})`;
                                    }
                                } else {
                                    // Prio 3 (Cadors)
                                    if (nomsCorrespondent(ec, ecurieGagnanteRelle)) {
                                        pts = typePari === 'top1' ? 5 : 3;
                                        correct = true;
                                        desc = "Victoire GP du Cador (P1)";
                                    } else if (positions.filter(p => p <= 5).length >= 2) {
                                        pts = 3;
                                        correct = true;
                                        desc = "Double Top 5 du Cador";
                                    }
                                }

                                pointsDesEcuries += pts;
                                detailEcuries.push({ ecurie: ec, typePari, correct, points: pts, description: desc });
                            });

                            // 2. Écuries Flop (Flop 1 & Flop 2)
                            ecuriesFlopJoueur.forEach((ec, idx) => {
                                if (!ec) return;
                                const typePari = idx === 0 ? 'flop1' : 'flop2';
                                const groupe = determinerGroupe(ec);
                                const positions = positionsParEcurieGP[ec] || [];
                                const nbTop10 = positions.length;
                                const meilleurPos = positions.length > 0 ? Math.min(...positions) : 99;
                                const dnfCount = (evenements.pilotesAbandonsSet && Array.from(evenements.pilotesAbandonsSet).filter(num => nomsCorrespondent(trouverEcuriePilote(num), ec)).length) || 0;

                                let pts = 0;
                                let correct = false;
                                let desc = "";

                                if (nomsCorrespondent(ec, ecurieGagnanteRelle) || ecuriesPodiumGP.some(p => nomsCorrespondent(p, ec))) {
                                    pts = -4;
                                    correct = false;
                                    desc = "Pénalité : Écurie sur le podium / P1";
                                } else if (groupe === 'cador') {
                                    // Prio 1 (Cadors)
                                    if (nbTop10 === 0 || dnfCount >= 2) {
                                        pts = 5;
                                        correct = true;
                                        desc = "Défaillance totale Cador (0 pt / double DNF)";
                                    } else if (dnfCount >= 1 && meilleurPos >= 7) {
                                        pts = 4;
                                        correct = true;
                                        desc = `Crash/DNF Cador et meilleur P${meilleurPos}`;
                                    } else if (positions.filter(p => p <= 5).length === 0) {
                                        pts = 3;
                                        correct = true;
                                        desc = "Échec Cador (hors Top 5)";
                                    }
                                } else if (groupe === 'milieu') {
                                    // Prio 2 (Milieu)
                                    if (nbTop10 === 0) {
                                        pts = 3;
                                        correct = true;
                                        desc = "Zéro pointé Milieu";
                                    }
                                } else {
                                    // Prio 3 (Outsiders)
                                    if (nbTop10 === 0) {
                                        pts = 2;
                                        correct = true;
                                        desc = "Zéro pointé Outsider";
                                    }
                                }

                                pointsDesEcuries += pts;
                                detailEcuries.push({ ecurie: ec, typePari, correct, points: pts, description: desc });
                            });

                            // --- Calcul des points bonus ---
                            let pointsDesBonus = 0;
                            const detailBonus = [];

                            const evaluerBonusBooleen = (cle, questionLabel) => {
                                const reponduPar = bonusJoueur[cle];
                                if (reponduPar === undefined || reponduPar === null) {
                                    detailBonus.push({ cle, question: questionLabel, reponseJoueur: null, resultatReel: bonusReel[cle], correct: false, points: 0 });
                                    return;
                                }
                                const correct = Boolean(reponduPar) === Boolean(bonusReel[cle]);
                                const points = correct ? POINTS_BONUS : 0;
                                pointsDesBonus += points;
                                detailBonus.push({ cle, question: questionLabel, reponseJoueur: reponduPar, resultatReel: bonusReel[cle], correct, points });
                            };

                            evaluerBonusBooleen('safetyCar', 'Safety Car en course');
                            evaluerBonusBooleen('drapeauRouge', 'Drapeau Rouge');
                            evaluerBonusBooleen('polemanPodium', 'Poleman sur le podium');

                            // Cas particulier : nombreDNF est un nombre
                            if (bonusJoueur.nombreDNF !== undefined && bonusJoueur.nombreDNF !== null && bonusJoueur.nombreDNF !== "") {
                                const correct = Number(bonusJoueur.nombreDNF) === Number(bonusReel.nombreDNF);
                                const points = correct ? POINTS_BONUS : 0;
                                pointsDesBonus += points;
                                detailBonus.push({ cle: 'nombreDNF', question: "Nombre d'abandons (DNF)", reponseJoueur: Number(bonusJoueur.nombreDNF), resultatReel: bonusReel.nombreDNF, correct, points });
                            } else {
                                detailBonus.push({ cle: 'nombreDNF', question: "Nombre d'abandons (DNF)", reponseJoueur: null, resultatReel: bonusReel.nombreDNF, correct: false, points: 0 });
                            }

                            // --- Calcul des points Sprint (Top 5) si applicable ---
                            let pointsSprintBruts = 0;
                            const detailSprint = [];
                            const grilleSprintJoueur = pronoData.classementSprint || [];
                            const histoDocActuel = await histoRef.get();
                            const top5SprintOfficiel = (histoDocActuel.exists && histoDocActuel.data()?.top5Sprint) || [];
                            const BAREME_SPRINT = [5, 4, 3, 2, 1];

                            if (grilleSprintJoueur.length > 0 && top5SprintOfficiel.length > 0) {
                                grilleSprintJoueur.forEach((piloteChoisi, idxJoueur) => {
                                    const idxReel = top5SprintOfficiel.findIndex(pReel => nomsCorrespondent(pReel, piloteChoisi));
                                    let pts = 0;
                                    let statut = "hors_top5";

                                    if (idxReel !== -1) {
                                        if (idxJoueur === idxReel) {
                                            pts = BAREME_SPRINT[idxJoueur] || 1;
                                            statut = "position_exacte";
                                        } else {
                                            pts = 1;
                                            statut = "dans_le_top5";
                                        }
                                    }
                                    pointsSprintBruts += pts;
                                    detailSprint.push({ pilote: piloteChoisi, points: pts, statut });
                                });
                            }

                            const jokerActif = pronoData.jokerUtilise === true;
                            const multiplicateur = jokerActif ? 2 : 1;

                            const pointsGrilleFinal = pointsDuTop10 * multiplicateur;
                            const pointsSprintFinal = pointsSprintBruts * multiplicateur;
                            const pointsPoleFinal = bonusPole * multiplicateur;
                            const pointsEcuriesFinal = pointsDesEcuries * multiplicateur;
                            const pointsBonusFinal = pointsDesBonus * multiplicateur;
                            const pointsGagnes = pointsGrilleFinal + pointsSprintFinal + pointsPoleFinal + pointsEcuriesFinal + pointsBonusFinal;
                            const detailPilotesFinal = detailPilotes.map(d => ({ ...d, points: d.points * multiplicateur }));
                            const detailSprintFinal = detailSprint.map(d => ({ ...d, points: d.points * multiplicateur }));
                            const detailEcuriesFinal = detailEcuries.map(d => ({ ...d, points: d.points * multiplicateur }));
                            const detailBonusFinal = detailBonus.map(d => ({ ...d, points: d.points * multiplicateur }));

                            transaction.set(pronoRef, {
                                bilanCalcul: {
                                    pointsTotaux: pointsGagnes,
                                    pointsGrille: pointsGrilleFinal,
                                    pointsSprint: pointsSprintFinal,
                                    pointsPole: pointsPoleFinal,
                                    pointsEcuries: pointsEcuriesFinal,
                                    pointsBonus: pointsBonusFinal,
                                    detailPilotes: detailPilotesFinal,
                                    detailSprint: detailSprintFinal,
                                    detailEcuries: detailEcuriesFinal,
                                    detailBonus: detailBonusFinal,
                                    jokerApplique: pronoData.jokerUtilise || false,
                                    calculeLe: new Date()
                                }
                            }, { merge: true });
                            
                            console.log(`   ✅ Points mis à jour pour [${pseudo}] : +${pointsGagnes} pts (dont sprint: +${pointsSprintFinal}, ecuries: +${pointsEcuriesFinal}, bonus: +${pointsBonusFinal})`);
                        });
                    } catch (txError) {
                        console.error(`   ❌ Erreur joueur ${doc.id}:`, txError.message);
                    }
                }
            }

            await histoRef.set({
                calculeLe: new Date(),
                top10: top10OfficielNoms,
                poleman: polemanOfficiel,
                ecurieGagnante: ecurieGagnanteRelle,
                pointsConstructeurs: pointsParEcurieGP,
                classementConstructeurs: classementConstructeursGP,
                bonusReel: bonusReel
            });
            console.log(`ℹ️ GP ${round} (${session.location || session.circuit_short_name}) archivé avec bonus.`);
        }
        console.log("\n🤖 Fin du traitement global de la saison 2026.");
    } catch (globalErr) {
        console.error("❌ Erreur générale :", globalErr.message);
        process.exit(1);
    }
}

demarrer();