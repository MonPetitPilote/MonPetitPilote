// ==========================================
// 1. CONFIGURATION ET INITIALISATION FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDw4nHhz1JI9NsVipX4Dw3hu_AY_WyBDj4",
    authDomain: "monpetitpilote.firebaseapp.com",
    projectId: "monpetitpilote",
    storageBucket: "monpetitpilote.firebasestorage.app",
    messagingSenderId: "267371118460",
    appId: "1:267371118460:web:af95dad6fa4368fdffaef9",
    measurementId: "G-TY047XHDXW"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var auth = firebase.auth();

// Chemins locaux vers tes images AVIF
const LOGOS_2026 = {
    redbull: "images/cars/redbull.avif",
    ferrari: "images/cars/ferrari.avif",
    mclaren: "images/cars/mclaren.avif",
    mercedes: "images/cars/mercedes.avif",
    aston: "images/cars/astonmartin.avif",
    alpine: "images/cars/alpine.avif",
    williams: "images/cars/williams.avif",
    racingbulls: "images/cars/racingbulls.avif",
    audi: "images/cars/audi.avif",
    haas: "images/cars/haas.avif",
    cadillac: "images/cars/cadillac.avif"
};

// Base de données des pilotes enrichie avec Numéros, Pays et Couleurs écuries
const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", numero: "1", pays: "nl", couleur: "#3671C6", carImg: LOGOS_2026.redbull, driverImg: "images/drivers/ver.avif"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", numero: "43", pays: "fr", couleur: "#3671C6", carImg: LOGOS_2026.redbull, driverImg: "images/drivers/had.avif"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", numero: "44", pays: "gb", couleur: "#E80020", carImg: LOGOS_2026.ferrari, driverImg: "images/drivers/ham.avif"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", numero: "16", pays: "mc", couleur: "#E80020", carImg: LOGOS_2026.ferrari, driverImg: "images/drivers/lec.avif"},
  {nom: "Lando Norris", ecurie: "McLaren", numero: "4", pays: "gb", couleur: "#FF8000", carImg: LOGOS_2026.mclaren, driverImg: "images/drivers/nor.avif"},
  {nom: "Oscar Piastri", ecurie: "McLaren", numero: "81", pays: "au", couleur: "#FF8000", carImg: LOGOS_2026.mclaren, driverImg: "images/drivers/pia.avif"},
  {nom: "George Russell", ecurie: "Mercedes", numero: "63", pays: "gb", couleur: "#27CCB4", carImg: LOGOS_2026.mercedes, driverImg: "images/drivers/rus.avif"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", numero: "12", pays: "it", couleur: "#27CCB4", carImg: LOGOS_2026.mercedes, driverImg: "images/drivers/ant.avif"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", numero: "14", pays: "es", couleur: "#229971", carImg: LOGOS_2026.aston, driverImg: "images/drivers/alo.avif"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", numero: "18", pays: "ca", couleur: "#229971", carImg: LOGOS_2026.aston, driverImg: "images/drivers/str.avif"},
  {nom: "Pierre Gasly", ecurie: "Alpine", numero: "10", pays: "fr", couleur: "#0093CC", carImg: LOGOS_2026.alpine, driverImg: "images/drivers/gas.avif"},
  {nom: "Franco Colapinto", ecurie: "Alpine", numero: "43", pays: "ar", couleur: "#0093CC", carImg: LOGOS_2026.alpine, driverImg: "images/drivers/col.avif"},
  {nom: "Carlos Sainz", ecurie: "Williams", numero: "55", pays: "es", couleur: "#37BEDD", carImg: LOGOS_2026.williams, driverImg: "images/drivers/sai.avif"},
  {nom: "Alex Albon", ecurie: "Williams", numero: "23", pays: "th", couleur: "#37BEDD", carImg: LOGOS_2026.williams, driverImg: "images/drivers/alb.avif"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", numero: "30", pays: "nz", couleur: "#6692FF", carImg: LOGOS_2026.racingbulls, driverImg: "images/drivers/law.avif"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", numero: "40", pays: "gb", couleur: "#6692FF", carImg: LOGOS_2026.racingbulls, driverImg: "images/drivers/lin.avif"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", numero: "27", pays: "de", couleur: "#00E6C3", carImg: LOGOS_2026.audi, driverImg: "images/drivers/hul.avif"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", numero: "5", pays: "br", couleur: "#00E6C3", carImg: LOGOS_2026.audi, driverImg: "images/drivers/bor.avif"},
  {nom: "Oliver Bearman", ecurie: "Haas", numero: "87", pays: "gb", couleur: "#B6BABD", carImg: LOGOS_2026.haas, driverImg: "images/drivers/bea.avif"},
  {nom: "Esteban Ocon", ecurie: "Haas", numero: "31", pays: "fr", couleur: "#B6BABD", carImg: LOGOS_2026.haas, driverImg: "images/drivers/oco.avif"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", numero: "77", pays: "fi", couleur: "#900C3F", carImg: LOGOS_2026.cadillac, driverImg: "images/drivers/bot.avif"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", numero: "11", pays: "mx", couleur: "#900C3F", carImg: LOGOS_2026.cadillac, driverImg: "images/drivers/per.avif"}
];

const ecuriesSaison = ["Red Bull", "Ferrari", "McLaren", "Mercedes", "Aston Martin", "Alpine", "Williams", "Racing Bulls", "Audi", "Haas", "Cadillac"];
let utilisateurActuel = null;
let designPilotesF1 = {}; 

const selectCourse = document.getElementById('select-course');
const selectPole = document.getElementById('select-pole');

// Calendrier complet officiel 2026 avec pays, circuit et date de course
const calendrier2026 = [
    { round: 1, nom: "Grand Prix d'Australie", circuit: "Melbourne", pays: "Australie", date: "2026-03-15" },
    { round: 2, nom: "Grand Prix de Chine", circuit: "Shanghai", pays: "Chine", date: "2026-03-22" },
    { round: 3, nom: "Grand Prix du Japon", circuit: "Suzuka", pays: "Japon", date: "2026-04-05" },
    { round: 4, nom: "Grand Prix de Bahreïn", circuit: "Sakhir", pays: "Bahreïn", date: "2026-04-19" },
    { round: 5, nom: "Grand Prix d'Arabie Saoudite", circuit: "Djeddah", pays: "Arabie Saoudite", date: "2026-05-03" },
    { round: 6, nom: "Grand Prix de Miami", circuit: "Miami", pays: "USA", date: "2026-05-10" },
    { round: 7, nom: "Grand Prix d'Émilie-Romagne", circuit: "Imola", pays: "Italie", date: "2026-05-24" },
    { round: 8, nom: "Grand Prix de Monaco", circuit: "Monaco", pays: "Monaco", date: "2026-05-31" },
    { round: 9, nom: "Grand Prix d'Espagne", circuit: "Barcelone", pays: "Espagne", date: "2026-06-14" },
    { round: 10, nom: "Grand Prix du Canada", circuit: "Montréal", pays: "Canada", date: "2026-06-21" },
    { round: 11, nom: "Grand Prix d'Autriche", circuit: "Spielberg", pays: "Autriche", date: "2026-07-05" },
    { round: 12, nom: "Grand Prix de Grande-Bretagne", circuit: "Silverstone", pays: "Royaume-Uni", date: "2026-07-12" },
    { round: 13, nom: "Grand Prix de Belgique", circuit: "Spa-Francorchamps", pays: "Belgique", date: "2026-07-26" },
    { round: 14, nom: "Grand Prix de Hongrie", circuit: "Budapest", pays: "Hongrie", date: "2026-08-02" },
    { round: 15, nom: "Grand Prix des Pays-Bas", circuit: "Zandvoort", pays: "Pays-Bas", date: "2026-08-30" },
    { round: 16, nom: "Grand Prix d'Italie", circuit: "Monza", pays: "Italie", date: "2026-09-06" },
    { round: 17, nom: "Grand Prix d'Azerbaïdjan", circuit: "Bakou", pays: "Azerbaïdjan", date: "2026-09-20" },
    { round: 18, nom: "Grand Prix de Singapour", circuit: "Marina Bay", pays: "Singapour", date: "2026-10-04" },
    { round: 19, nom: "Grand Prix des États-Unis", circuit: "Austin", pays: "USA", date: "2026-10-18" },
    { round: 20, nom: "Grand Prix du Mexique", circuit: "Mexico City", pays: "Mexique", date: "2026-10-25" },
    { round: 21, nom: "Grand Prix de São Paulo", circuit: "Interlagos", pays: "Brésil", date: "2026-11-08" },
    { round: 22, nom: "Grand Prix de Las Vegas", circuit: "Las Vegas", pays: "USA", date: "2026-11-22" },
    { round: 23, nom: "Grand Prix du Qatar", circuit: "Losail", pays: "Qatar", date: "2026-11-29" },
    { round: 24, nom: "Grand Prix d'Abou Dabi", circuit: "Yas Marina", pays: "Émirats Arabes Unis", date: "2026-12-06" }
];

// Injection dynamique des styles responsifs globaux (Grille, Connexion, Titre & Règlement)
function injecterStylesResponsifsGlobaux() {
    if (document.getElementById('f1-responsive-styles-globaux')) return;
    
    const styleSheet = document.createElement("style");
    styleSheet.id = "f1-responsive-styles-globaux";
    styleSheet.innerText = `
        .grid-slot {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 8px !important;
            width: 100% !important;
            margin-bottom: 12px !important;
        }

        @media (max-width: 576px) {
            #grille-pronos {
                display: block !important;
                width: 100% !important;
            }
            .grid-slot {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 0px !important;
                margin-bottom: 18px !important;
            }
            .grid-pos-badge {
                width: 100% !important;
                max-width: 100% !important;
                height: 28px !important;
                font-size: 13px !important;
                border-radius: 8px 8px 0 0 !important;
                justify-content: center !important;
                padding: 0 !important;
                text-align: center !important;
            }
            .grid-card-f1 {
                width: 100% !important;
                border-radius: 0 0 8px 8px !important;
                padding: 8px 12px !important;
            }
            .grid-select-paddock {
                font-size: 14px !important;
            }
            .driver-team-text {
                font-size: 10px !important;
            }
            .driver-num-text {
                font-size: 18px !important;
            }
            .driver-portrait-container {
                width: 60px !important;
                height: 60px !important;
            }
            .car-bg-image {
                max-width: 65% !important;
                height: 120% !important;
            }

            #auth-deconnecte, #auth-connecte {
                width: 100% !important;
                box-sizing: border-box !important;
                padding: 12px !important;
            }
            #auth-deconnecte > div, #auth-connecte > div {
                flex-direction: column !important;
                align-items: stretch !important;
                width: 100% !important;
                gap: 10px !important;
            }
            #auth-deconnecte input, #auth-connecte input {
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                font-size: 14px !important;
                padding: 10px !important;
            }
            #auth-deconnecte button, #auth-connecte button {
                width: 100% !important;
                box-sizing: border-box !important;
                padding: 12px !important;
                font-size: 14px !important;
                text-align: center !important;
                justify-content: center !important;
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

// GESTION DU TITRE ET DESIGN DU BOUTON RÈGLEMENT
function adapterEnTeteTitreEtReglement() {
    const boutonReglement = document.getElementById('btn-reglement') || document.querySelector('button[onclick*="reglement"]') || document.querySelector('.btn-reglement');
    if (!boutonReglement) return;

    // Sauvegarde et nettoyage des styles inline conflictuels du parent
    const conteneurParent = boutonReglement.parentElement;
    if (conteneurParent) {
        conteneurParent.style.display = 'flex';
        conteneurParent.style.flexDirection = 'column';
        conteneurParent.style.alignItems = 'center';
        conteneurParent.style.justifyContent = 'center';
        conteneurParent.style.textAlign = 'center';
        conteneurParent.style.gap = '12px';
        conteneurParent.style.width = '100%';
        conteneurParent.style.margin = '20px auto';

        boutonReglement.style.margin = '0 auto';
        boutonReglement.style.display = 'inline-block';
    }
}

// ==========================================
// 2. GESTION DE LA FENÊTRE MODALE DU RÈGLEMENT
// ==========================================
document.getElementById('btn-reglement')?.addEventListener('click', () => {
    const modale = document.getElementById('modale-reglement');
    if (modale) {
        modale.style.display = 'flex'; 
    }
});

document.getElementById('btn-fermer-reglement')?.addEventListener('click', () => {
    const modale = document.getElementById('modale-reglement');
    if (modale) {
        modale.style.display = 'none'; 
    }
});

window.addEventListener('click', (e) => {
    const modale = document.getElementById('modale-reglement');
    if (e.target === modale) {
        modale.style.display = 'none';
    }
});

// GESTION AUTHENTIFICATION ET AFFICHAGE DES POINTS EN DIRECT
auth.onAuthStateChanged(async (user) => {
    const zoneDeconnecte = document.getElementById('auth-deconnecte');
    const zoneConnecte = document.getElementById('auth-connecte');
    const nomUserSpan = document.getElementById('nom-utilisateur');
    
    if (user) {
        utilisateurActuel = user;
        if(zoneDeconnecte) zoneDeconnecte.style.display = 'none';
        if(zoneConnecte) zoneConnecte.style.display = 'flex';
        
        // Récupération des données utilisateur de la base pour obtenir ses points généraux réels
        try {
            const userDoc = await db.collection("utilisateurs").doc(user.uid).get();
            let pointsGeneraux = 0;
            let estEligible = true;

            if (userDoc.exists) {
                const userData = userDoc.data();
                pointsGeneraux = userData.points || 0;
                if (userData.eligible !== undefined) {
                    estEligible = userData.eligible;
                }
            }

            // Création du bloc récapitulatif à côté du nom
            const badgeEligibleHtml = estEligible 
                ? `<span style="background: #10b981; color: #fff; padding: 2px 6px; font-size: 11px; font-weight: bold; border-radius: 4px; margin-left: 8px;">👑 ÉLIGIBLE</span>`
                : `<span style="background: #ef4444; color: #fff; padding: 2px 6px; font-size: 11px; font-weight: bold; border-radius: 4px; margin-left: 8px;">❌ NON ÉLIGIBLE</span>`;

            if(nomUserSpan) {
                nomUserSpan.innerHTML = `
                    <span style="font-weight: bold; color: #fff;">${user.displayName || user.email}</span>
                    <span style="color: #ff8000; font-weight: 800; margin-left: 10px; background: rgba(255,128,0,0.15); padding: 2px 8px; border-radius: 20px; font-size: 13px;">🏆 ${pointsGeneraux} pts au Général</span>
                    ${badgeEligibleHtml}
                `;
            }
        } catch (error) {
            if(nomUserSpan) nomUserSpan.innerText = user.displayName || user.email;
        }

        chargerPronosticsUtilisateur();
    } else {
        utilisateurActuel = null;
        if(zoneDeconnecte) zoneDeconnecte.style.display = 'block';
        if(zoneConnecte) zoneConnecte.style.display = 'none';
    }
});

document.getElementById('btn-connexion')?.addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    const mdp = document.getElementById('auth-mdp').value;
    auth.signInWithEmailAndPassword(email, mdp).catch(err => alert(err.message));
});
document.getElementById('btn-inscription')?.addEventListener('click', () => {
    const pseudo = document.getElementById('auth-pseudo').value;
    const email = document.getElementById('auth-email').value;
    const mdp = document.getElementById('auth-mdp').value;
    if(!pseudo) return alert("Pseudo requis !");
    auth.createUserWithEmailAndPassword(email, mdp).then((res) => {
        res.user.updateProfile({ displayName: pseudo }).then(() => {
            db.collection("utilisateurs").doc(res.user.uid).set({ pseudo: pseudo, points: 0, eligible: true });
            location.reload();
        });
    }).catch(err => alert(err.message));
});
document.getElementById('btn-deconnexion')?.addEventListener('click', () => auth.signOut());

// ==========================================
// 3. CHARGEMENT ET GENERATION GRILLE TV
// ==========================================
async function chargerDonneesEsthetiquesOpenF1() {
    try {
        const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        const drivers = await response.json();
        
        drivers.forEach(d => {
            const nomComplet = `${d.first_name} ${d.last_name}`;
            designPilotesF1[nomComplet] = {
                couleur: `#${d.team_colour || '2d3954'}`
            };
        });
    } catch (e) {
        console.error("OpenF1 hors-ligne.");
    }
    creerLaGrilleDeDepartTV();
}

function creerLaGrilleDeDepartTV() {
    const conteneurGrille = document.getElementById('grille-pronos');
    if (!conteneurGrille) return;
    conteneurGrille.innerHTML = "";

    injecterStylesResponsifsGlobaux();

    for (let i = 1; i <= 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'grid-slot';
        slot.setAttribute('data-pos', i);

        let optionsHtml = `<option value="">👉 CHOISIS TON PILOTE</option>`;
        pilotesData.forEach(p => { optionsHtml += `<option value="${p.nom}">${p.nom}</option>`; });

        slot.innerHTML = `
            <div class="grid-pos-badge" id="badge-p${i}" style="min-width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 6px; background: #232e44; color: #fff; flex-shrink: 0; transition: background 0.3s ease;">P${i}</div>
            <div class="grid-card-f1" id="card-f1-p${i}" style="position: relative; background: #1f293d; display: flex; align-items: center; flex-grow: 1; min-width: 0; border-radius: 8px; border: 1px solid #2f3e56; padding: 6px 12px; transition: all 0.3s ease; overflow: hidden;">
                
                <img id="car-grid-p${i}" class="car-bg-image" src="" style="position: absolute; right: 0; bottom: -10px; height: 120%; max-width: 60%; opacity: 0.35; object-fit: contain; pointer-events: none; z-index: 1;">

                <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; position: relative; z-index: 2;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                        <span id="num-f1-p${i}" class="driver-num-text" style="font-size: 20px; font-weight: 900; color: rgba(255,255,255,0.15); font-style: italic;">--</span>
                        <img id="flag-f1-p${i}" src="" style="width: 18px; border-radius: 2px; display: none;">
                    </div>
                    <select id="select-grid-p${i}" class="grid-select-paddock" data-position="${i}" style="width: 100%; background: transparent; border: none; color: #fff; font-size: 15px; font-weight: bold; cursor: pointer; padding: 2px 0; outline: none; text-overflow: ellipsis;">
                        ${optionsHtml}
                    </select>
                    <div id="team-grid-p${i}" class="driver-team-text" style="color: #616e88; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">⚡ PLACE À PRENDRE</div>
                </div>

                <div class="driver-portrait-container" style="position: relative; width: 65px; height: 65px; display: flex; justify-content: center; overflow: hidden; margin-left: 10px; border-radius: 4px; z-index: 2; flex-shrink: 0;">
                    <img id="img-grid-p${i}" src="" style="width: 100%; height: 100%; object-fit: cover; object-position: top; display: none;">
                </div>
            </div>
        `;
        conteneurGrille.appendChild(slot);

        slot.querySelector('select').addEventListener('change', function() {
            mettreAJourDesignSlot(i, this.value);
            controlerDoublonsPilotes();
        });
    }
}

function mettreAJourDesignSlot(position, nomPilote) {
    const card = document.getElementById(`card-f1-p${position}`);
    const badge = document.getElementById(`badge-p${position}`);
    const numTarget = document.getElementById(`num-f1-p${position}`);
    const flagTarget = document.getElementById(`flag-f1-p${position}`);
    const imgTarget = document.getElementById(`img-grid-p${position}`);
    const carTarget = document.getElementById(`car-grid-p${position}`);
    const teamTarget = document.getElementById(`team-grid-p${position}`);
    
    const localData = pilotesData.find(p => p.nom === nomPilote);

    if (nomPilote && localData) {
        card.style.borderLeft = `5px solid ${localData.couleur}`;
        if(badge) badge.style.background = localData.couleur;
        
        numTarget.innerText = localData.numero;
        numTarget.style.color = localData.couleur;
        flagTarget.src = `https://flagcdn.com/w20/${localData.pays}.png`;
        flagTarget.style.display = "inline-block";
        
        imgTarget.src = localData.driverImg;
        imgTarget.style.display = "block";
        carTarget.src = localData.carImg;
        
        teamTarget.innerText = localData.ecurie;
        teamTarget.style.color = "#ff8000"; 
    } else {
        card.style.borderLeft = `1px solid #2f3e56`;
        if(badge) badge.style.background = "#232e44";
        numTarget.innerText = "--";
        numTarget.style.color = "rgba(255,255,255,0.15)";
        flagTarget.style.display = "none";
        imgTarget.style.display = "none";
        carTarget.removeAttribute('src');
        teamTarget.innerText = "⚡ PLACE À PRENDRE";
        teamTarget.style.color = "#616e88";
    }
}

// ==========================================
// 4. SECURITE CONTROLE DES DOUBLONS
// ==========================================
function controlerDoublonsPilotes() {
    const selections = [];
    for(let i = 1; i <= 10; i++) {
        const val = document.getElementById(`select-grid-p${i}`)?.value;
        if(val) selections.push(val);
    }

    for(let i = 1; i <= 10; i++) {
        const select = document.getElementById(`select-grid-p${i}`);
        if(!select) continue;
        const valeurActuelle = select.value;

        Array.from(select.options).forEach(option => {
            if(option.value === "") return;
            
            if(selections.includes(option.value) && option.value !== valeurActuelle) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    }
}

// INITIALISATIONS DE BASE AVEC CALENDRIER ET AUTO-SÉLECTION COMPLÈTE
function initialiserSelectCourse() {
    if (!selectCourse) return;
    selectCourse.innerHTML = ""; 

    const aujourdhui = new Date();
    let prochainRoundValue = "2026/1"; 
    let roundTrouve = false;

    calendrier2026.forEach(gp => {
        const opt = document.createElement('option');
        opt.value = `2026/${gp.round}`;
        
        const dateObj = new Date(gp.date);
        const dateFormatee = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        
        opt.innerText = `Round ${gp.round} : ${gp.nom} - ${gp.circuit} (${gp.pays}) — 📅 ${dateFormatee}`;
        selectCourse.appendChild(opt);

        if (!roundTrouve && dateObj >= aujourdhui) {
            prochainRoundValue = `2026/${gp.round}`;
            roundTrouve = true; 
        }
    });

    selectCourse.value = prochainRoundValue;
}

function initialiserPolePosition() {
    if (!selectPole) return;
    selectPole.innerHTML = '<option value="">-- Sélectionne ton poleman --</option>';
    pilotesData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nom; opt.innerText = p.nom; selectPole.appendChild(opt);
    });
}
function initialiserEcurieTopFlop() {
    ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"].forEach(id => {
        const select = document.getElementById(id); if(!select) return;
        select.innerHTML = '<option value="">-- Choisir --</option>';
        ecuriesSaison.forEach(e => { const opt = document.createElement('option'); opt.value = e; opt.innerText = e; select.appendChild(opt); });
    });
}

async function chargerPronosticsUtilisateur() {
    if (!utilisateurActuel || !selectCourse) return;
    const courseId = selectCourse.value;
    const doc = await db.collection("pronostics").doc(`${utilisateurActuel.uid}_${courseId.replace('/', '_')}`).get();
    
    for (let i = 1; i <= 10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(s) { s.value = ""; mettreAJourDesignSlot(i, ""); }
    }
    if(selectPole) selectPole.value = "";

    if (doc.exists) {
        const data = doc.data();
        if (data.classementPilotes) {
            data.classementPilotes.forEach((nom, idx) => {
                const s = document.getElementById(`select-grid-p${idx+1}`);
                if (s) { s.value = nom; mettreAJourDesignSlot(idx+1, nom); }
            });
        }
        if(selectPole && data.poleman) selectPole.value = data.poleman;
        if(data.ecuriesTop) {
            if(document.getElementById('ecurie-top-1')) document.getElementById('ecurie-top-1').value = data.ecuriesTop[0] || "";
            if(document.getElementById('ecurie-top-2')) document.getElementById('ecurie-top-2').value = data.ecuriesTop[1] || "";
        }
        if(data.ecuriesFlop) {
            if(document.getElementById('ecurie-flop-1')) document.getElementById('ecurie-flop-1').value = data.ecuriesFlop[0] || "";
            if(document.getElementById('ecurie-flop-2')) document.getElementById('ecurie-flop-2').value = data.ecuriesFlop[1] || "";
        }
    }
    controlerDoublonsPilotes();
}

document.getElementById('btn-valider')?.addEventListener('click', async () => {
    if (!utilisateurActuel) return alert("Tu dois être connecté !");
    const courseId = selectCourse.value;
    const top10Selection = [];
    for(let i=1; i<=10; i++) {
        const val = document.getElementById(`select-grid-p${i}`).value;
        if(!val) return alert(`Il manque la position P${i} !`);
        top10Selection.push(val);
    }
    const pronoData = {
        uidJoueur: utilisateurActuel.uid,
        pseudo: utilisateurActuel.displayName || utilisateurActuel.email,
        course: courseId,
        classementPilotes: top10Selection,
        poleman: selectPole.value,
        ecuriesTop: [document.getElementById('ecuries-top-1')?.value || "", document.getElementById('ecuries-top-2')?.value || ""],
        ecuriesFlop: [document.getElementById('ecuries-flop-1')?.value || "", document.getElementById('ecuries-flop-2')?.value || ""],
        dateEnregistrement: new Date()
    };
    await db.collection("pronostics").doc(`${utilisateurActuel.uid}_${courseId.replace('/', '_')}`).set(pronoData);
    alert("🏁 Grille enregistrée avec succès !");
});

// CHARGEMENT DU CLASSEMENT GÉNÉRAL SÉCURISÉ
async function chargerClassementGeneral() {
    const liste = document.getElementById('liste-classement') || document.getElementById('ranking-list') || document.querySelector('.liste-classement'); 
    if(!liste) return;
    
    liste.innerHTML = "<div style='color:#616e88; padding:10px;'>Chargement du classement...</div>";
    
    try {
        // On récupère tous les utilisateurs sans demander de tri à Firebase
        const snapshot = await db.collection("utilisateurs").get();
        liste.innerHTML = "";
        
        if (snapshot.empty) {
            liste.innerHTML = "<div style='color:#616e88; padding:10px;'>Aucun joueur enregistré.</div>";
            return;
        }

        // On extrait les données et on s'assure que "points" vaut au moins 0 si absent
        let joueurs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            joueurs.push({
                pseudo: data.pseudo || data.email || 'Pilote Anonyme',
                points: data.points !== undefined ? Number(data.points) : 0
            });
        });

        // On trie les joueurs du plus grand nombre de points au plus petit
        joueurs.sort((a, b) => b.points - a.points);

        // On affiche le classement
        joueurs.forEach((u, index) => {
            const pos = index + 1;
            const div = document.createElement('div');
            div.style = 'display:grid; grid-template-columns:50px 1fr 80px; padding:12px; border-bottom:1px solid #1c2437; align-items:center; color:#fff;';
            div.innerHTML = `
                <div><strong style="color:${pos <= 3 ? '#ff8000' : '#616e88'}">#${pos}</strong></div>
                <div>${u.pseudo}</div>
                <div style="text-align:right; font-weight:bold; color:#ff8000;">${u.points} pts</div>
            `;
            liste.appendChild(div); 
        });

    } catch (error) {
        console.error("Erreur classement :", error);
        liste.innerHTML = "<div style='color:#ef4444; padding:10px;'>Erreur d'accès au classement.</div>";
    }
}

document.getElementById('btn-aleatoire')?.addEventListener('click', () => {
    let tri = [...pilotesData].sort(() => 0.5 - Math.random());
    for(let i=1; i<=10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(s) { s.value = tri[i-1].nom; mettreAJourDesignSlot(i, tri[i-1].nom); }
    }
    controlerDoublonsPilotes();
});

// INITIALISATIONS DE BASE AU CHARGEMENT
initialiserSelectCourse();
initialiserPolePosition();
initialiserEcurieTopFlop();
chargerClassementGeneral();
chargerDonneesEsthetiquesOpenF1();
adapterEnTeteTitreEtReglement();
if(selectCourse) selectCourse.addEventListener('change', chargerPronosticsUtilisateur);
