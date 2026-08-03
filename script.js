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

// Affiche une notification discrète en haut à droite (remplace les alert() bloquants)
// type : 'succes' | 'erreur' | 'info'
function afficherNotification(message, type = 'info') {
    const conteneur = document.getElementById('conteneur-notifications');
    if (!conteneur) { alert(message); return; } // filet de sécurité si le conteneur manque

    const icones = { succes: '✅', erreur: '❌', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast-notif ${type}`;
    toast.innerHTML = `
        <span>${icones[type] || 'ℹ️'}</span>
        <span>${message}</span>
        <button class="toast-fermer" aria-label="Fermer">&times;</button>
    `;

    const retirer = () => toast.remove();
    toast.querySelector('.toast-fermer').addEventListener('click', retirer);
    setTimeout(retirer, 5000);

    conteneur.appendChild(toast);
}

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

// Chemins vers les logos officiels des écuries (dossier images/team)
const LOGOS_ECURIES_2026 = {
    "Red Bull": "images/team/redbull.avif",
    "Ferrari": "images/team/ferrari.avif",
    "McLaren": "images/team/mclaren.avif",
    "Mercedes": "images/team/mercedes.avif",
    "Aston Martin": "images/team/astonmartin.avif",
    "Alpine": "images/team/alpine.avif",
    "Williams": "images/team/williams.avif",
    "Racing Bulls": "images/team/racingbulls.avif",
    "Audi": "images/team/audi.avif",
    "Haas": "images/team/haas.avif",
    "Cadillac": "images/team/cadillac.avif"
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
    { round: 1, nom: "Grand Prix d'Australie", circuit: "Melbourne", pays: "Australie", date: "2026-03-08" },
    { round: 2, nom: "Grand Prix de Chine", circuit: "Shanghai", pays: "Chine", date: "2026-03-15" },
    { round: 3, nom: "Grand Prix du Japon", circuit: "Suzuka", pays: "Japon", date: "2026-03-29" },
    { round: 4, nom: "Grand Prix de Miami", circuit: "Miami Gardens", pays: "USA", date: "2026-05-03" }, // "Miami Gardens" pour l'API
    { round: 5, nom: "Grand Prix du Canada", circuit: "Montréal", pays: "Canada", date: "2026-05-24" },
    { round: 6, nom: "Grand Prix de Monaco", circuit: "Monte Carlo", pays: "Monaco", date: "2026-06-07" }, // "Monte Carlo" pour l'API
    { round: 7, nom: "Grand Prix d'Espagne (Barcelone)", circuit: "Barcelona", pays: "Espagne", date: "2026-06-14" }, // "Barcelona" pour l'API
    { round: 8, nom: "Grand Prix d'Autriche", circuit: "Spielberg", pays: "Autriche", date: "2026-06-28" },
    { round: 9, nom: "Grand Prix de Grande-Bretagne", circuit: "Silverstone", pays: "Royaume-Uni", date: "2026-07-05" },
    { round: 10, nom: "Grand Prix de Belgique", circuit: "Spa-Francorchamps", pays: "Belgique", date: "2026-07-19" },
    { round: 11, nom: "Grand Prix de Hongrie", circuit: "Budapest", pays: "Hongrie", date: "2026-07-26" },
    { round: 12, nom: "Grand Prix des Pays-Bas", circuit: "Zandvoort", pays: "Pays-Bas", date: "2026-08-23" },
    { round: 13, nom: "Grand Prix d'Italie", circuit: "Monza", pays: "Italie", date: "2026-09-06" },
    { round: 14, nom: "Grand Prix d'Espagne (Madrid)", circuit: "Madrid", pays: "Espagne", date: "2026-09-13" }, // Ajouté et synchronisé !
    { round: 15, nom: "Grand Prix d'Azerbaïdjan", circuit: "Baku", pays: "Azerbaïdjan", date: "2026-09-26" }, // "Baku" pour l'API
    { round: 16, nom: "Grand Prix de Singapour", circuit: "Marina Bay", pays: "Singapour", date: "2026-10-11" },
    { round: 17, nom: "Grand Prix des États-Unis", circuit: "Austin", pays: "USA", date: "2026-10-25" },
    { round: 18, nom: "Grand Prix du Mexique", circuit: "Mexico City", pays: "Mexique", date: "2026-11-01" }, // "Mexico City" pour l'API
    { round: 19, nom: "Grand Prix du Brésil", circuit: "São Paulo", pays: "Brésil", date: "2026-11-08" }, // "São Paulo" pour l'API
    { round: 20, nom: "Grand Prix de Las Vegas", circuit: "Las Vegas", pays: "USA", date: "2026-11-21" },
    { round: 21, nom: "Grand Prix du Qatar", circuit: "Lusail", pays: "Qatar", date: "2026-11-29" }, // "Lusail" pour l'API
    { round: 22, nom: "Grand Prix d'Abou Dhabi", circuit: "Yas Marina", pays: "Émirats Arabes Unis", date: "2026-12-06" }
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
            #auth-deconnecte, #auth-connecte {
                display: flex !important;
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 10px !important;
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

// ==========================================
// 2. GESTION DE LA MODALE DE CONNEXION / INSCRIPTION
// ==========================================
const modaleConnexion = document.getElementById('modale-connexion');

// Traduit les codes d'erreur Firebase en messages compréhensibles
function traduireErreurFirebase(error) {
    switch (error.code) {
        case 'auth/invalid-email': return "L'adresse email n'est pas valide.";
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return "Email ou mot de passe incorrect.";
        case 'auth/email-already-in-use': return "Un compte existe déjà avec cet email.";
        case 'auth/weak-password': return "Le mot de passe doit contenir au moins 6 caractères.";
        default: return "Une erreur est survenue : " + error.message;
    }
}

function ouvrirModaleConnexion() {
    if (!modaleConnexion) return;
    document.getElementById('login-erreur').innerText = "";
    document.getElementById('inscription-erreur').innerText = "";
    modaleConnexion.style.display = 'flex';
}

function fermerModaleConnexion() {
    if (modaleConnexion) modaleConnexion.style.display = 'none';
}

document.getElementById('btn-ouvrir-connexion')?.addEventListener('click', ouvrirModaleConnexion);
document.getElementById('btn-fermer-connexion')?.addEventListener('click', fermerModaleConnexion);
window.addEventListener('click', (e) => {
    if (e.target === modaleConnexion) fermerModaleConnexion();
});

// Bascule entre l'onglet "Connexion" et l'onglet "Inscription"
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('actif'));
        document.querySelectorAll('.auth-panel').forEach(p => p.style.display = 'none');
        tab.classList.add('actif');
        document.getElementById(tab.dataset.panel).style.display = 'block';
    });
});

// --- Mot de passe oublié ---
document.getElementById('link-recup-mdp')?.addEventListener('click', (e) => {
    e.preventDefault();
    const erreurZone = document.getElementById('login-erreur');
    const email = document.getElementById('login-email').value.trim();
    if (!email) {
        erreurZone.innerText = "Saisis d'abord ton email ci-dessus.";
        return;
    }
    auth.sendPasswordResetEmail(email)
        .then(() => {
            erreurZone.style.color = "#4cd137";
            erreurZone.innerText = `📨 Email de réinitialisation envoyé à ${email} (pense à vérifier tes spams).`;
        })
        .catch((error) => {
            erreurZone.style.color = "#ef4444";
            erreurZone.innerText = traduireErreurFirebase(error);
        });
});

// --- Connexion ---
document.getElementById('btn-connexion')?.addEventListener('click', async () => {
    const bouton = document.getElementById('btn-connexion');
    const erreurZone = document.getElementById('login-erreur');
    const email = document.getElementById('login-email').value.trim();
    const mdp = document.getElementById('login-mdp').value;

    erreurZone.style.color = "#ef4444";
    if (!email || !mdp) {
        erreurZone.innerText = "Merci de renseigner ton email et ton mot de passe.";
        return;
    }

    bouton.disabled = true;
    bouton.innerText = "Connexion en cours...";
    try {
        await auth.signInWithEmailAndPassword(email, mdp);
        fermerModaleConnexion();
    } catch (error) {
        erreurZone.innerText = traduireErreurFirebase(error);
    } finally {
        bouton.disabled = false;
        bouton.innerText = "🏁 Se connecter";
    }
});

// --- Inscription ---
document.getElementById('btn-inscription')?.addEventListener('click', async () => {
    const bouton = document.getElementById('btn-inscription');
    const erreurZone = document.getElementById('inscription-erreur');
    const pseudo = document.getElementById('inscription-pseudo').value.trim();
    const email = document.getElementById('inscription-email').value.trim();
    const mdp = document.getElementById('inscription-mdp').value;

    erreurZone.style.color = "#ef4444";
    if (!pseudo) {
        erreurZone.innerText = "Le pseudo est obligatoire (c'est ce que verront tes potes).";
        return;
    }
    if (!email || !mdp) {
        erreurZone.innerText = "Merci de renseigner un email et un mot de passe.";
        return;
    }

    bouton.disabled = true;
    bouton.innerText = "Création en cours...";
    try {
        const resultat = await auth.createUserWithEmailAndPassword(email, mdp);
        await resultat.user.updateProfile({ displayName: pseudo });
        // Met à jour l'affichage tout de suite, sans recharger la page
        const nomUserSpan = document.getElementById('nom-utilisateur');
        if (nomUserSpan) nomUserSpan.innerHTML = `<span style="font-weight: bold; color: #fff;">${pseudo}</span>`;
        fermerModaleConnexion();
    } catch (error) {
        erreurZone.innerText = traduireErreurFirebase(error);
    } finally {
        bouton.disabled = false;
        bouton.innerText = "🏆 Créer mon compte";
    }
});

// ==========================================
// 3. GESTION DE LA FENÊTRE MODALE DU RÈGLEMENT
// ==========================================
document.getElementById('btn-reglement')?.addEventListener('click', () => {
    const modale = document.getElementById('modale-reglement');
    if (modale) modale.style.display = 'flex'; 
});

document.getElementById('btn-fermer-reglement')?.addEventListener('click', () => {
    const modale = document.getElementById('modale-reglement');
    if (modale) modale.style.display = 'none'; 
});

window.addEventListener('click', (e) => {
    const modale = document.getElementById('modale-reglement');
    if (e.target === modale) {
        modale.style.display = 'none';
    }
});

// ==========================================
// 4. GESTION DE LA MODALE DES RÉSULTATS OFFICIELS
// ==========================================
const selectResultats = document.getElementById('select-resultats-course');

// Compare deux noms sans tenir compte des accents ni de la casse
// (ex : "Nico Hülkenberg" doit correspondre à "Nico Hulkenberg" renvoyé par l'API/le cron)
function normaliserNom(texte) {
    return (texte || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// Retrouve le pilote local (couleur, écurie) correspondant à un nom
// officiel OpenF1 — même logique de correspondance que dans cron-calcul.js
function trouverPiloteLocalParNom(nomOfficiel) {
    const cible = normaliserNom(nomOfficiel);
    return pilotesData.find(p => {
        const local = normaliserNom(p.nom);
        return local.includes(cible) || cible.includes(local);
    });
}

// Compare deux noms (pilote ou écurie) sans tenir compte des accents/casse
function nomsCorrespondentLocal(nomA, nomB) {
    const a = normaliserNom(nomA);
    const b = normaliserNom(nomB);
    return a.includes(b) || b.includes(a);
}

function initialiserSelectResultats() {
    if (!selectResultats || selectResultats.options.length > 0) return; // déjà rempli
    calendrier2026.forEach(gp => {
        const opt = document.createElement('option');
        opt.value = gp.round;
        opt.innerText = `Round ${gp.round} : ${gp.nom}`;
        selectResultats.appendChild(opt);
    });
}

async function chargerResultatOfficielGP(round) {
    const zone = document.getElementById('zone-resultat-gp');
    if (!zone) return;
    zone.innerHTML = `<p style="color:#aaa; text-align:center;">Chargement...</p>`;

    try {
        const doc = await db.collection("historique_courses").doc(`2026_${round}`).get();

        if (!doc.exists) {
            zone.innerHTML = `<p style="color:#aaa; font-style:italic; text-align:center;">🏗️ Résultat pas encore disponible pour ce Grand Prix.</p>`;
            return;
        }

        const data = doc.data();
        const top10 = data.top10 || [];
        const poleman = data.poleman || "Inconnu";

        const top10Html = top10.map((nomPilote, index) => {
            const local = trouverPiloteLocalParNom(nomPilote);
            const couleur = local ? local.couleur : '#616e88';
            const medaille = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `P${index + 1}`;
            return `
                <li style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px dashed #2d3954;">
                    <span style="min-width:32px; font-weight:bold; color:${couleur};">${medaille}</span>
                    <span style="flex-grow:1;">${nomPilote}</span>
                    ${local ? `<span style="font-size:0.75rem; color:#616e88; text-transform:uppercase;">${local.ecurie}</span>` : ''}
                </li>
            `;
        }).join('');

        zone.innerHTML = `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid #2f3e56; border-radius: 8px; padding: 12px 15px; margin-bottom: 15px;">
                <span style="color:#ff8000; font-weight:bold;">⚡ Pole Position :</span> ${poleman}
            </div>
            <h5 style="color:#00d2d3; text-transform:uppercase; font-size:0.85rem; margin-bottom:10px;">🏁 Classement final (Top 10)</h5>
            <ul style="list-style:none; margin:0; padding:0;">
                ${top10Html || '<li style="color:#aaa;">Aucune donnée.</li>'}
            </ul>
        `;
    } catch (error) {
        console.error("Erreur chargement résultat officiel :", error);
        zone.innerHTML = `<p style="color:#ef4444; text-align:center;">Erreur lors du chargement du résultat.</p>`;
    }
}

document.getElementById('btn-resultats')?.addEventListener('click', () => {
    initialiserSelectResultats();
    const modale = document.getElementById('modale-resultats');
    if (modale) modale.style.display = 'flex';
    if (selectResultats) chargerResultatOfficielGP(selectResultats.value);
});

document.getElementById('btn-fermer-resultats')?.addEventListener('click', () => {
    const modale = document.getElementById('modale-resultats');
    if (modale) modale.style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modale = document.getElementById('modale-resultats');
    if (e.target === modale) modale.style.display = 'none';
});

selectResultats?.addEventListener('change', () => {
    chargerResultatOfficielGP(selectResultats.value);
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
        
        try {
            if (nomUserSpan) {
                nomUserSpan.innerHTML = `<span style="font-weight: bold; color: #fff;">${user.displayName || user.email}</span>`;
            }
            
            if (selectCourse) {
                const courseId = selectCourse.value;
                const doc = await db.collection("pronostics").doc(`${user.uid}_${courseId.replace('/', '_')}`).get();
                if (doc.exists && nomUserSpan) {
                    const data = doc.data();
                    const pts = (data.bilanCalcul && data.bilanCalcul.pointsTotaux) || 0;
                    nomUserSpan.innerHTML = `
                        <span style="font-weight: bold; color: #fff;">${user.displayName || user.email}</span>
                        <span style="color: #ff8000; font-weight: 800; margin-left: 10px; background: rgba(255,128,0,0.15); padding: 2px 8px; border-radius: 20px; font-size: 13px;">🏆 ${pts} pts</span>
                    `;
                }
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
document.getElementById('btn-deconnexion')?.addEventListener('click', () => auth.signOut());

// ==========================================
// 5. CHARGEMENT ET GENERATION GRILLE TV
// ==========================================
async function chargerDonneesEsthetiquesOpenF1() {
    try {
        const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        const drivers = await response.json();
        
        drivers.forEach(d => {
            const nomComplet = `${d.first_name} ${d.last_name}`;
            designPilotesF1[nomComplet] = { couleur: `#${d.team_colour || '2d3954'}` };
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

    verifierVerrouillageCourse();
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
// 6. SECURITE CONTROLE DES DOUBLONS
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

// Un Grand Prix est considéré "clôturé" dès que sa date est passée :
// on ne peut plus pronostiquer ni modifier son prono pour ce week-end.
function courseEstVerrouillee(courseIdString) {
    const round = parseInt((courseIdString || "").split('/')[1]);
    const gp = calendrier2026.find(g => g.round === round);
    if (!gp) return false;
    return new Date(gp.date) <= new Date();
}

function appliquerVerrouillage(verrouille) {
    const banniere = document.getElementById('banniere-verrouillage');
    if (banniere) banniere.style.display = verrouille ? 'flex' : 'none';

    for (let i = 1; i <= 10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if (s) s.disabled = verrouille;
    }
    if (selectPole) selectPole.disabled = verrouille;

    ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"].forEach(id => {
        const conteneur = document.getElementById(id);
        if (!conteneur) return;
        conteneur.style.pointerEvents = verrouille ? 'none' : 'auto';
        conteneur.style.opacity = verrouille ? '0.5' : '1';
    });

    const checkJoker = document.getElementById('check-joker');
    if (checkJoker) checkJoker.disabled = verrouille;
    const btnAleatoire = document.getElementById('btn-aleatoire');
    if (btnAleatoire) btnAleatoire.disabled = verrouille;

    const btnValider = document.getElementById('btn-valider');
    if (btnValider) {
        btnValider.disabled = verrouille;
        btnValider.style.opacity = verrouille ? '0.5' : '1';
        btnValider.style.cursor = verrouille ? 'not-allowed' : 'pointer';
    }
}

// Affiche "il reste Xj Xh" avant la clôture des pronos du GP sélectionné
function mettreAJourCountdown() {
    const zone = document.getElementById('countdown-pronos');
    if (!zone || !selectCourse) return;

    const round = parseInt((selectCourse.value || "").split('/')[1]);
    const gp = calendrier2026.find(g => g.round === round);
    if (!gp) { zone.style.display = 'none'; return; }

    const echeance = new Date(gp.date);
    const maintenant = new Date();
    const diffMs = echeance - maintenant;

    if (diffMs <= 0) {
        zone.style.display = 'none'; // la bannière de verrouillage prend le relais
        return;
    }

    const jours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const heures = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

    let texteRestant;
    if (jours > 0) {
        texteRestant = `${jours}j ${heures}h`;
    } else if (heures > 0) {
        texteRestant = `${heures}h ${minutes}min`;
    } else {
        texteRestant = `${minutes}min`;
    }

    const urgent = diffMs < 1000 * 60 * 60 * 24; // moins de 24h restantes
    zone.classList.toggle('urgent', urgent);
    zone.style.display = 'flex';
    zone.innerHTML = `⏳ Il reste <span style="margin: 0 4px;">${texteRestant}</span> pour valider ce pronostic`;
}

function verifierVerrouillageCourse() {
    if (!selectCourse) return false;
    const verrouille = courseEstVerrouillee(selectCourse.value);
    appliquerVerrouillage(verrouille);
    mettreAJourCountdown();
    return verrouille;
}

// Rafraîchit le countdown toutes les minutes sans avoir à recharger la page
setInterval(mettreAJourCountdown, 60 * 1000);

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
    selectCourse.setAttribute('value', prochainRoundValue);
}

function initialiserPolePosition() {
    if (!selectPole) return;
    selectPole.innerHTML = '<option value="">-- Sélectionne ton poleman --</option>';
    pilotesData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nom; opt.innerText = p.nom; selectPole.appendChild(opt);
    });
}

function initialiserEcuriesTopFlop() {
    const slots = ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"];
    
    slots.forEach(id => {
        const conteneur = document.getElementById(id);
        if (!conteneur) return;

        conteneur.style = "background: #0f131c; border: 2px dashed #2d3954; border-radius: 8px; height: 90px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all 0.2s ease; overflow: hidden; padding: 5px;";
        
        conteneur.innerHTML = `
            <div class="placeholder-team" style="text-align: center; color: #616e88; font-size: 12px; font-weight: bold;">
                ➕ CHOISIR<br><span style="font-size: 10px; opacity: 0.7;">UNE ÉCURIE</span>
            </div>
            <img class="logo-selectionne" src="" style="display: none; height: 75%; max-width: 90%; object-fit: contain; z-index: 2;">
            <div class="nom-selectionne" style="display: none; position: absolute; bottom: 2px; font-size: 10px; font-weight: bold; color: #fff; background: rgba(0,0,0,0.6); padding: 1px 6px; border-radius: 4px; text-transform: uppercase;"></div>
        `;

        conteneur.addEventListener('click', () => ouvrirSelecteurVisuelEcurie(id));
    });
}

function appliquerSelectionEcurieVisuelle(slotId, nomEcurie) {
    const conteneur = document.getElementById(slotId);
    if (!conteneur) return;

    conteneur.setAttribute('data-ecurie-value', nomEcurie);

    const placeholder = conteneur.querySelector('.placeholder-team');
    const img = conteneur.querySelector('.logo-selectionne');
    const txt = conteneur.querySelector('.nom-selectionne');

    if (nomEcurie && LOGOS_ECURIES_2026[nomEcurie]) {
        placeholder.style.display = "none";
        img.src = LOGOS_ECURIES_2026[nomEcurie];
        img.style.display = "block";
        txt.innerText = nomEcurie;
        txt.style.display = "block";
        conteneur.style.border = slotId.includes('top') ? "2px solid #00e6c3" : "2px solid #ef4444";
        conteneur.style.background = "rgba(255,255,255,0.02)";
    } else {
        placeholder.style.display = "block";
        img.style.display = "none";
        img.src = "";
        txt.style.display = "none";
        txt.innerText = "";
        conteneur.style.border = "2px dashed #2d3954";
        conteneur.style.background = "#0f131c";
    }
}

function ouvrirSelecteurVisuelEcurie(slotId) {
    let modale = document.getElementById('modale-choix-ecurie');
    if (!modale) {
        modale = document.createElement('div');
        modale.id = 'modale-choix-ecurie';
        modale.style = "position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10000; display:flex; align-items:center; justify-content:center;";
        document.body.appendChild(modale);
    }
    modale.style.display = "flex";

    // Une même écurie ne peut pas être choisie dans deux emplacements
    // (ex : Ferrari en Top 1 ET en Top 2, ou en Top ET en Flop).
    const autresSlots = ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"].filter(id => id !== slotId);
    const ecuriesDejaPrises = autresSlots
        .map(id => document.getElementById(id)?.getAttribute('data-ecurie-value'))
        .filter(Boolean);

    let grilleHtml = "";
    ecuriesSaison.forEach(ecurie => {
        const logoPath = LOGOS_ECURIES_2026[ecurie] || "";
        const dejaPrise = ecuriesDejaPrises.includes(ecurie);
        grilleHtml += `
            <div class="tuile-ecurie" data-name="${ecurie}" data-verrouillee="${dejaPrise}" style="background:#111622; border:1px solid ${dejaPrise ? '#3b4256' : '#2d3954'}; border-radius:8px; padding:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:${dejaPrise ? 'not-allowed' : 'pointer'}; transition:all 0.2s; min-height:80px; opacity:${dejaPrise ? '0.35' : '1'};">
                <img src="${logoPath}" style="max-height:45px; max-width:100%; object-fit:contain; margin-bottom:6px; ${dejaPrise ? 'filter:grayscale(100%);' : ''}">
                <span style="font-size:11px; font-weight:bold; color:#a0aec0; text-align:center; text-transform:uppercase;">${ecurie}${dejaPrise ? ' 🔒' : ''}</span>
            </div>
        `;
    });

    modale.innerHTML = `
        <div style="background:#1f293d; width:90%; max-width:500px; border-radius:12px; border:1px solid #2f3e56; padding:20px; position:relative; color:#fff;">
            <button id="fermer-choix-ecurie" style="position:absolute; top:12px; right:12px; background:transparent; border:none; color:#616e88; font-size:16px; cursor:pointer;">❌</button>
            <h3 style="margin-top:0; color:#ff8000; font-size:16px; margin-bottom:15px; text-transform:uppercase; letter-spacing:0.5px;">🏎️ Sélectionner l'écurie</h3>
            ${ecuriesDejaPrises.length ? `<p style="font-size:11px; color:#616e88; margin-top:-8px; margin-bottom:12px;">🔒 Une écurie déjà choisie ailleurs ne peut pas être reprise.</p>` : ''}

            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; max-height:400px; overflow-y:auto; padding-right:5px;">
                <div class="tuile-ecurie" data-name="" style="background:rgba(239,68,68,0.1); border:1px dashed #ef4444; border-radius:8px; padding:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:bold; color:#ef4444; font-size:12px;">❌ VIDER L'EMPLACEMENT</div>
                ${grilleHtml}
            </div>
        </div>
    `;

    document.getElementById('fermer-choix-ecurie').onclick = () => modale.style.display = "none";

    modale.querySelectorAll('.tuile-ecurie').forEach(tuile => {
        if (tuile.getAttribute('data-verrouillee') === 'true') return; // ni hover ni clic possible

        tuile.onmouseenter = () => tuile.style.borderColor = "#ff8000";
        tuile.onmouseleave = () => tuile.style.borderColor = "#2d3954";
        tuile.onclick = function() {
            const choix = this.getAttribute('data-name');
            appliquerSelectionEcurieVisuelle(slotId, choix);
            modale.style.display = "none";
        };
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
    
    ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"].forEach(id => {
        appliquerSelectionEcurieVisuelle(id, "");
    });

    if (doc.exists) {
        const data = doc.data();
        const listePilotes = data.classementPilotes || [];
        listePilotes.forEach((nom, idx) => {
            const s = document.getElementById(`select-grid-p${idx+1}`);
            if (s) { s.value = nom; mettreAJourDesignSlot(idx+1, nom); }
        });
        
        if(selectPole && data.poleman) selectPole.value = data.poleman;
        
        const ecuriesTop = data.ecuriesTop || [];
        const ecuriesFlop = data.ecuriesFlop || [];
        appliquerSelectionEcurieVisuelle("ecurie-top-1", ecuriesTop[0] || "");
        appliquerSelectionEcurieVisuelle("ecurie-top-2", ecuriesTop[1] || "");
        appliquerSelectionEcurieVisuelle("ecurie-flop-1", ecuriesFlop[0] || "");
        appliquerSelectionEcurieVisuelle("ecurie-flop-2", ecuriesFlop[1] || "");
    }
    controlerDoublonsPilotes();
}

document.getElementById('btn-valider')?.addEventListener('click', async () => {
    if (!utilisateurActuel) return afficherNotification("Tu dois être connecté !", "erreur");
    const courseId = selectCourse.value;

    if (courseEstVerrouillee(courseId)) {
        afficherNotification("🔒 Ce Grand Prix est déjà passé, les pronostics sont clôturés.", "erreur");
        return;
    }

    const top10Selection = [];
    
    for(let i=1; i<=10; i++) {
        const val = document.getElementById(`select-grid-p${i}`).value;
        if(!val) return afficherNotification(`Il manque la position P${i} !`, "erreur");
        top10Selection.push(val);
    }
    
    const pronoData = {
        uidJoueur: utilisateurActuel.uid,
        pseudo: utilisateurActuel.displayName || utilisateurActuel.email,
        course: courseId,
        classementPilotes: top10Selection,
        poleman: selectPole.value,
        ecuriesTop: [
            document.getElementById('ecurie-top-1')?.getAttribute('data-ecurie-value') || "", 
            document.getElementById('ecurie-top-2')?.getAttribute('data-ecurie-value') || ""
        ],
        ecuriesFlop: [
            document.getElementById('ecurie-flop-1')?.getAttribute('data-ecurie-value') || "", 
            document.getElementById('ecurie-flop-2')?.getAttribute('data-ecurie-value') || ""
        ],
        dateEnregistrement: new Date()
    };
    
    await db.collection("pronostics").doc(`${utilisateurActuel.uid}_${courseId.replace('/', '_')}`).set(pronoData, { merge: true });
    afficherNotification("🏁 Grille et Écuries enregistrées avec succès !", "succes");
    chargerClassementGeneral();
});

// CHARGEMENT DU CLASSEMENT GENERAL TOTAL (TOP 5 DE LA SAISON)
async function chargerClassementGeneral() {
    const liste = document.getElementById('liste-classement') || document.getElementById('ranking-list') || document.querySelector('.liste-classement'); 
    if(!liste) return;
    
    liste.innerHTML = "<div style='color:#616e88; padding:10px;'>Calcul du classement général...</div>";
    
    try {
        const snapshot = await db.collection("pronostics").get();
        liste.innerHTML = "";
        
        if (snapshot.empty) {
            liste.innerHTML = "<div style='color:#616e88; padding:10px; text-align:center;'>Aucun pronostic enregistré sur la saison.</div>";
            return;
        }

        let cumulPoints = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const pseudo = data.pseudo || 'Pilote Anonyme';
            
            const pointsCourse = (data.bilanCalcul && data.bilanCalcul.pointsTotaux) || 0;

            if (!cumulPoints[pseudo]) {
                cumulPoints[pseudo] = 0;
            }
            cumulPoints[pseudo] += Number(pointsCourse) || 0;
        });

        let joueurs = Object.keys(cumulPoints).map(pseudo => {
            return { pseudo: pseudo, points: cumulPoints[pseudo] };
        });

        joueurs.sort((a, b) => b.points - a.points);
        let top5Joueurs = joueurs.slice(0, 5);

        if (top5Joueurs.length === 0) {
            liste.innerHTML = "<div style='color:#616e88; padding:10px; text-align:center;'>Aucun point à afficher.</div>";
            return;
        }

        let pos = 1;
        top5Joueurs.forEach(u => {
            const div = document.createElement('div');
            div.style = 'display:grid; grid-template-columns:50px 1fr 80px; padding:12px; border-bottom:1px solid #1c2437; align-items:center; color:#fff;';
            div.innerHTML = `
                <div><strong style="color:${pos === 1 ? '#ff8000' : '#616e88'}">#${pos}</strong></div>
                <div>${u.pseudo}</div>
                <div style="text-align:right; font-weight:bold; color:#ff8000;">${u.points} pts</div>
            `;
            liste.appendChild(div); 
            pos++;
        });

    } catch (error) {
        console.error("Erreur lors du calcul du classement général cumulé :", error);
        liste.innerHTML = "<div style='color:#ef4444; padding:10px;'>Erreur d'accès au classement Firebase.</div>";
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

// --- GESTION DE L'AFFICHAGE DE L'ESPACE MEMBRE ---
const btnVersProfil = document.getElementById('btn-vers-profil');
const btnRetourPronos = document.getElementById('btn-retour-pronos');
const logoAccueil = document.getElementById('logo-accueil');
const sectionPronos = document.getElementById('main-content-pronos');
const sectionProfil = document.getElementById('workspace-profil');

if(btnVersProfil) {
    btnVersProfil.addEventListener('click', () => {
        sectionPronos.style.display = 'none';
        sectionProfil.style.display = 'block';
        chargerHistoriqueProfil();
    });
}

const retournerAuxPronos = () => {
    sectionProfil.style.display = 'none';
    sectionPronos.style.display = 'grid';
};

if(btnRetourPronos) btnRetourPronos.addEventListener('click', retournerAuxPronos);
if(logoAccueil) logoAccueil.addEventListener('click', retournerAuxPronos);

// --- FONCTIONS DE CHARGEMENT DES DONNÉES (FIRESTORE) ---
function chargerHistoriqueProfil() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    db.collection("pronostics").where("uidJoueur", "==", user.uid).get().then((querySnapshot) => {
        const listeGpsContainer = document.getElementById('profil-liste-gps');
        if (!listeGpsContainer) return;
        listeGpsContainer.innerHTML = "";

        if(querySnapshot.empty) {
            listeGpsContainer.innerHTML = `<div style="padding: 15px; text-align: center; color: #aaa;">Aucun prono enregistré pour le moment.</div>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            const courseIdString = data.course || "Inconnu";
            const roundNumero = courseIdString.includes('/') ? courseIdString.split('/')[1] : courseIdString;
            const gpInfo = calendrier2026.find(gp => gp.round === Number(roundNumero));
            const nomAffichageGP = gpInfo ? gpInfo.nom.toUpperCase() : `ROUND ${roundNumero}`;
            
            const pointsAffiches = (data.bilanCalcul && data.bilanCalcul.pointsTotaux) || 0;

            const ligne = document.createElement('div');
            ligne.className = 'ligne-profil-gp';
            ligne.style = "display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #1c2437; cursor: pointer; color: #fff;";
            ligne.innerHTML = `
                <div style="font-weight: bold;">🏎️ ${nomAffichageGP}</div>
                <div style="text-align: right; color: #4cd137; font-weight: bold;">${pointsAffiches} pts</div>
            `;
            ligne.addEventListener('click', () => afficherDetailGP(data));
            listeGpsContainer.appendChild(ligne);
        });
    });
}

async function afficherDetailGP(data) {
    const detailContainer = document.getElementById('profil-detail-gp');
    if (!detailContainer) return;

    detailContainer.innerHTML = `<p style="color:#aaa; text-align:center;">Chargement du comparatif...</p>`;

    const bilan = data.bilanCalcul || {};
    const detailPilotes = bilan.detailPilotes || [];
    const dejaCalcule = bilan.pointsTotaux !== undefined;

    const courseIdString = data.course || "2026/12";
    const roundNumero = courseIdString.includes('/') ? courseIdString.split('/')[1] : courseIdString;

    const gpInfo = calendrier2026.find(gp => gp.round === Number(roundNumero));
    const nomCompletGP = gpInfo ? `${gpInfo.nom} (${gpInfo.circuit})` : `ROUND ${roundNumero}`;

    const listePilotesPronostiques = data.classementPilotes || [];

    // Résultat officiel du GP (pour le comparatif côte à côte)
    let officialTop10 = [];
    let officialPoleman = null;
    let ecurieGagnante = null;
    try {
        const histoDoc = await db.collection("historique_courses").doc(`2026_${roundNumero}`).get();
        if (histoDoc.exists) {
            const histo = histoDoc.data();
            officialTop10 = histo.top10 || [];
            officialPoleman = histo.poleman || null;
            if (officialTop10[0]) {
                const local = trouverPiloteLocalParNom(officialTop10[0]);
                ecurieGagnante = local ? local.ecurie : null;
            }
        }
    } catch (error) {
        console.error("Erreur chargement résultat officiel pour comparatif :", error);
    }

    // --- Comparatif Top 10 : ton choix vs le résultat réel, position par position ---
    let top10Html = "";
    if (listePilotesPronostiques.length === 0) {
        top10Html = `<li style="color: #616e88; font-style: italic;">Aucune grille enregistrée</li>`;
    } else {
        top10Html = listePilotesPronostiques.map((pilote, index) => {
            const resultatReel = officialTop10[index] || "—";

            if (!dejaCalcule) {
                return `<li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #2d3954; font-size: 0.9rem;">
                    <span><strong>P${index + 1} :</strong> ${pilote}</span>
                    <span style="color: #616e88; font-weight: bold;">-- pts</span>
                </li>`;
            }

            const infoPilote = detailPilotes[index] || { points: 0, statut: "hors_top10" };
            let icone = "❌";
            let precision = "";
            if (infoPilote.statut === "position_exacte") {
                icone = "✅";
            } else if (infoPilote.statut === "dans_le_top10") {
                icone = "➕";
                const positionReelle = officialTop10.findIndex(p => nomsCorrespondentLocal(p, pilote));
                if (positionReelle !== -1) precision = ` (fini P${positionReelle + 1})`;
            }
            const colorPoints = infoPilote.points > 0 ? `#4cd137` : `#ef4444`;

            return `<li style="display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px dashed #2d3954; font-size: 0.85rem;">
                <span style="min-width: 26px;">${icone}</span>
                <span style="flex: 1;"><strong>P${index + 1} :</strong> ${pilote}${precision ? `<span style="color:#616e88;">${precision}</span>` : ''}</span>
                <span style="flex: 1; text-align: right; color: #616e88;">Réel : ${resultatReel}</span>
                <span style="min-width: 55px; text-align: right; color: ${colorPoints}; font-weight: bold;">+${infoPilote.points} pts</span>
            </li>`;
        }).join('');
    }

    const ptsTotaux = bilan.pointsTotaux || 0;
    const ptsGrille = bilan.pointsGrille || 0;
    const ptsPole = bilan.pointsPole || 0;
    const ptsEcuries = bilan.pointsEcuries || 0;

    const ecoTop1 = (data.ecuriesTop && data.ecuriesTop[0]) || 'Aucune';
    const ecoTop2 = (data.ecuriesTop && data.ecuriesTop[1]) || 'Aucune';
    const ecoFlop1 = (data.ecuriesFlop && data.ecuriesFlop[0]) || 'Aucune';
    const ecoFlop2 = (data.ecuriesFlop && data.ecuriesFlop[1]) || 'Aucune';

    // --- Comparatif Pole Position ---
    let ligneComparatifPole = `<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>⚡ Poleman :</span> <strong>${data.poleman || 'Aucun'}</strong></div>`;
    if (dejaCalcule) {
        const poleCorrecte = data.poleman && officialPoleman && nomsCorrespondentLocal(officialPoleman, data.poleman);
        ligneComparatifPole = `<div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
            <span>${poleCorrecte ? '✅' : '❌'} Poleman : <strong>${data.poleman || 'Aucun'}</strong></span>
            <span style="color: #616e88;">Réel : ${officialPoleman || '—'}</span>
        </div>`;
    }

    // --- Comparatif Écuries Top/Flop ---
    function ligneEcurie(label, nomEcurie, estUnTop) {
        if (!dejaCalcule || !nomEcurie || nomEcurie === 'Aucune' || !ecurieGagnante) {
            return `<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>${label} :</span> <strong>${nomEcurie}</strong></div>`;
        }
        const correspond = nomsCorrespondentLocal(ecurieGagnante, nomEcurie);
        // Pour un Top : correspondre à l'écurie gagnante est une bonne pioche.
        // Pour un Flop : correspondre à l'écurie gagnante est une mauvaise pioche (pénalité).
        const bonPari = estUnTop ? correspond : !correspond;
        return `<div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span>${bonPari ? '✅' : '❌'} ${label} : <strong>${nomEcurie}</strong></span>
        </div>`;
    }

    detailContainer.innerHTML = `
        <h4 style="color: #ff8000; margin-bottom: 5px; text-transform: uppercase; font-size: 1.1rem; letter-spacing: 0.5px;">🏁 ${nomCompletGP}</h4>
        <p style="font-size: 0.85rem; color: #aaa; margin-top:0;">Statut : <strong style="color: ${dejaCalcule ? '#4cd137' : '#ff8000'};">${dejaCalcule ? 'Calculé' : 'En attente du calcul'}</strong></p>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid #2f3e56; border-radius: 8px; padding: 15px; margin-bottom: 15px; text-align: center;">
            <div style="font-size: 0.85rem; color: #616e88; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Score obtenu</div>
            <div style="font-size: 2rem; font-weight: 900; color: #4cd137; margin: 5px 0;">${ptsTotaux} <span style="font-size: 1rem; font-weight: bold;">pts</span></div>
        </div>

        <h5 style="margin: 0 0 10px 0; color: #00d2d3; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">📊 Répartition des Points</h5>
        <div style="font-size: 0.9rem; color: #e2e8f0; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; padding: 5px 0;"><span>🏎️ Prono Grille Top 10 :</span> <strong style="color: #fff;">+${ptsGrille} pts</strong></div>
            <div style="display: flex; justify-content: space-between; padding: 5px 0;"><span>⚡ Bonus Pole Position :</span> <strong style="color: #fff;">+${ptsPole} pts</strong></div>
            <div style="display: flex; justify-content: space-between; padding: 5px 0;"><span>🏁 Bonus Écuries (Top/Flop) :</span> <strong style="color: #fff;">+${ptsEcuries} pts</strong></div>
        </div>

        <hr style="border: 0; border-top: 1px solid #2d3954; margin: 15px 0;">

        <h5 style="margin: 0 0 10px 0; color: #ff8000; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">📋 Vos choix vs le résultat réel</h5>
        <div style="font-size: 0.9rem; color: #e2e8f0; margin-bottom: 15px;">
            ${ligneComparatifPole}
            ${ligneEcurie('🚀 Écurie Top 1', ecoTop1, true)}
            ${ligneEcurie('🚀 Écurie Top 2', ecoTop2, true)}
            ${ligneEcurie('⚠️ Écurie Flop 1', ecoFlop1, false)}
            ${ligneEcurie('⚠️ Écurie Flop 2', ecoFlop2, false)}
        </div>

        <h5 style="margin: 20px 0 10px 0; color: #00d2d3; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">🏎️ Votre Grille Top 10 vs le résultat réel</h5>
        <ul style="margin: 0; padding: 0; list-style: none;">
            ${top10Html}
        </ul>
    `;
}

// INITIALISATIONS DE BASE AU CHARGEMENT
initialiserSelectCourse();
initialiserPolePosition();
initialiserEcuriesTopFlop();
chargerClassementGeneral();
chargerDonneesEsthetiquesOpenF1();
verifierVerrouillageCourse();

if(selectCourse) {
    selectCourse.addEventListener('change', () => {
        chargerPronosticsUtilisateur();
        chargerClassementGeneral();
        verifierVerrouillageCourse();
    });
}
