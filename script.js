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

// Base de données des pilotes F1 2026
const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", statut: "favori", img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", statut: "outsider", img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", statut: "favori", img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", statut: "favori", img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Lando Norris", ecurie: "McLaren", statut: "favori", img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "Oscar Piastri", ecurie: "McLaren", statut: "favori", img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "George Russell", ecurie: "Mercedes", statut: "favori", img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", statut: "favori", img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", statut: "outsider", img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", statut: "outsider", img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Pierre Gasly", ecurie: "Alpine", statut: "outsider", img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Franco Colapinto", ecurie: "Alpine", statut: "outsider", img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Carlos Sainz", ecurie: "Williams", statut: "outsider", img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Alex Albon", ecurie: "Williams", statut: "outsider", img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", statut: "fond", img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", statut: "fond", img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", statut: "fond", img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", statut: "fond", img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Oliver Bearman", ecurie: "Haas", statut: "fond", img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Esteban Ocon", ecurie: "Haas", statut: "fond", img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", statut: "fond", img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", statut: "fond", img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"}
];
// ==========================================
// CALENDRIER OFFICIEL COMPLET (24 COURSES - SAISON 2026)
// ==========================================
const calendrierCourses = [
  { round: 1, nom: "GP d'Australie", dateCourse: "2026-03-15", limitePole: "2026-03-14T06:00:00Z" },
  { round: 2, nom: "GP de Chine", dateCourse: "2026-03-22", limitePole: "2026-03-21T07:00:00Z" },
  { round: 3, nom: "GP de Suzuka (Japon)", dateCourse: "2026-04-05", limitePole: "2026-04-04T06:00:00Z" },
  { round: 4, nom: "GP de Bahreïn", dateCourse: "2026-04-19", limitePole: "2026-04-18T16:00:00Z" },
  { round: 5, nom: "GP de Miami", dateCourse: "2026-05-03", limitePole: "2026-05-02T20:00:00Z" },
  { round: 6, nom: "GP de Monaco", dateCourse: "2026-05-24", limitePole: "2026-05-23T14:00:00Z" },
  { round: 7, nom: "GP de Barcelone (Espagne)", dateCourse: "2026-06-07", limitePole: "2026-06-06T14:00:00Z" },
  { round: 8, nom: "GP de Spielberg (Autriche)", dateCourse: "2026-06-28", limitePole: "2026-06-27T13:00:00Z" },
  { round: 9, nom: "GP de Grande-Bretagne (Silverstone)", dateCourse: "2026-07-05", limitePole: "2026-07-04T14:00:00Z" },
  { round: 10, nom: "GP de Hongrie", dateCourse: "2026-07-26", limitePole: "2026-07-25T14:00:00Z" },
  { round: 11, nom: "GP de Belgique (Spa)", dateCourse: "2026-08-30", limitePole: "2026-08-29T14:00:00Z" },
  { round: 12, nom: "GP des Pays-Bas (Zandvoort)", dateCourse: "2026-09-06", limitePole: "2026-09-05T13:00:00Z" },
  { round: 13, nom: "GP d'Italie (Monza)", dateCourse: "2026-09-13", limitePole: "2026-09-12T14:00:00Z" },
  { round: 14, nom: "GP d'Azerbaïdjan (Bakou)", dateCourse: "2026-09-20", limitePole: "2026-09-19T13:00:00Z" },
  { round: 15, nom: "GP de Singapour", dateCourse: "2026-10-04", limitePole: "2026-10-03T12:00:00Z" },
  { round: 16, nom: "GP des États-Unis (Austin)", dateCourse: "2026-10-18", limitePole: "2026-10-17T21:00:00Z" },
  { round: 17, nom: "GP du Mexique", dateCourse: "2026-10-25", limitePole: "2026-10-24T20:00:00Z" },
  { round: 18, nom: "GP du Brésil (Interlagos)", dateCourse: "2026-11-01", limitePole: "2026-11-03T18:00:00Z" },
  { round: 19, nom: "GP de Las Vegas", dateCourse: "2026-11-22", limitePole: "2026-11-21T06:00:00Z" },
  { round: 20, nom: "GP de l'Équateur / Qatar (Losail)", dateCourse: "2026-11-29", limitePole: "2026-11-28T16:00:00Z" },
  { round: 21, nom: "GP d'Abou Dabi (Yas Marina)", dateCourse: "2026-12-06", limitePole: "2026-12-05T13:00:00Z" }
  // Note : Tu peux rajouter ou ajuster les rounds selon le calendrier officiel publié de la FIA !
];


// Fonction pour générer la liste déroulante avec les dates visibles et la bonne pré-sélection
function initialiserSelectCourse() {
    const select = document.getElementById('select-course');
    if (!select) return;

    select.innerHTML = "";
    const maintenant = new Date();
    let courseActiveTrouvee = false;

    calendrierCourses.forEach(c => {
        const option = document.createElement('option');
        option.value = `2026/${c.round}`;

        // Formatage de la date de la course en version lisible (française)
        const optionsDate = { day: 'numeric', month: 'short' };
        const dateFormatee = new Date(c.dateCourse).toLocaleDateString('fr-FR', optionsDate);

        // Détermination du statut textuel à afficher à côté de la course
        let statut = `(${dateFormatee})`;
        const dateCourseFinie = new Date(c.dateCourse + "T23:59:59Z");

        if (maintenant > dateCourseFinie) {
            statut = `🏁 Terminé`;
        } else if (maintenant >= new Date(c.limitePole)) {
            statut = `🔒 En cours / Qualifs lancées`;
        }

        option.text = `${String(c.round).padStart(2, '0')}. ${c.nom} — ${statut}`;
        
        // CORRECTION ICI : On sélectionne le PREMIER Grand Prix qui n'est pas encore terminé
        if (maintenant <= dateCourseFinie && !courseActiveTrouvee) {
            option.selected = true;
            courseActiveTrouvee = true; // On passe le drapeau à vrai pour ne pas écraser avec les courses futures
        }

        select.appendChild(option);
    });

    // Sécurité : Si toutes les courses sont terminées (fin de saison), on sélectionne la dernière
    if (!courseActiveTrouvee && select.options.length > 0) {
        select.options[select.options.length - 1].selected = true;
    }
}


// Remplacer l'ancienne fonction de vérification par celle-ci pour gérer le verrouillage intelligent
function verifierStatutDuGrandPrix() {
    const selectCourse = document.getElementById('select-course');
    if (!selectCourse) return;

    const courseActuelle = selectCourse.value;
    const roundNumber = parseInt(courseActuelle.split('/')[1]);
    const courseData = calendrierCourses.find(c => c.round === roundNumber);

    const titreGrille = document.getElementById('titre-grille');
    const btnAleatoire = document.getElementById('btn-aleatoire');
    const btnValider = document.getElementById('btn-valider');
    const selectPole = document.getElementById('select-pole');

    const maintenant = new Date();
    const dateCourseFinie = new Date(courseData.dateCourse + "T23:59:59Z");
    const dateLimitePole = new Date(courseData.limitePole);

    // CAS 1 : Le week-end de course est complètement passé
    if (maintenant > dateCourseFinie) {
        if (titreGrille) titreGrille.innerText = "🏁 RÉSULTATS OFFICIELS DE LA COURSE :";
        if (btnAleatoire) btnAleatoire.style.display = 'none';
        if (btnValider) {
            btnValider.disabled = true;
            btnValider.innerText = "🔒 WEEK-END CLOS (MODIFICATION IMPOSSIBLE)";
            btnValider.style.backgroundColor = "#555";
        }
        desactiverFormulaire(true);

        // Appel API Ergast pour afficher la grille finale rétroactivement
        fetch(`https://ergast.com/api/f1/${courseActuelle}/results.json`)
            .then(res => res.json())
            .then(data => {
                const results = data.MRData.RaceTable.Race[0]?.Results;
                if (results) {
                    for (let i = 1; i <= 10; i++) {
                        const selectElement = document.getElementById(`pos-${i}`);
                        const apiDriver = results[i-1]?.Driver;
                        if (selectElement && apiDriver) {
                            const monPilote = pilotesData.find(p => p.nom.toLowerCase().includes(apiDriver.familyName.toLowerCase()));
                            if (monPilote) {
                                selectElement.innerHTML = `<option value="${monPilote.nom}" selected>${monPilote.nom}</option>`;
                                const img = selectElement.parentElement.querySelector('.img-monoplace');
                                if (img) { img.src = monPilote.img; img.style.display = 'block'; }
                            }
                        }
                    }
                }
            }).catch(err => console.log("Pas de données API.", err));

    } else {
        // Le week-end n'est pas encore fini, on réactive la mise en page normale
        if (titreGrille) titreGrille.innerText = "🏆 TON TOP 10 PILOTES :";
        if (btnAleatoire) btnAleatoire.style.display = 'block';
        if (btnValider) {
            btnValider.disabled = false;
            btnValider.innerText = "🏁 VALIDER MES PRONOSTICS";
            btnValider.style.backgroundColor = "#E10600";
        }
        
        desactiverFormulaire(false);
        mettreAJourListes();

        // CAS 2 : Le samedi des qualifs est commencé -> On bloque UNIQUEMENT le choix de la Pole Position !
        if (maintenant >= dateLimitePole) {
            if (selectPole) {
                selectPole.disabled = true;
                // On ajoute une indication visuelle
                const optionSelectionnee = selectPole.options[selectPole.selectedIndex];
                if (optionSelectionnee && !optionSelectionnee.text.includes("🔒")) {
                    optionSelectionnee.text += " 🔒 (Bloqué pour le samedi !)";
                }
            }
            console.log("⚡ Choix de la Pole position verrouillé pour cause de Qualifications en cours !");
        }
    }
}

// Pour initialiser correctement au chargement de ton script :
initialiserSelectCourse();
// (Assure-toi que cet appel est bien mis juste avant d'appeler verifierStatutDuGrandPrix())



const ecuriesList = [...new Set(pilotesData.map(p => p.ecurie))];
const grille = document.getElementById('grille-pronos');
const selectCourse = document.getElementById('select-course');

let utilisateurActuel = null;

// ==========================================
// 2. SURVEILLANCE ET AFFICHAGE ETAT D'AUTH
// ==========================================
auth.onAuthStateChanged((user) => {
    const zoneDeconnecte = document.getElementById('auth-deconnecte');
    const zoneConnecte = document.getElementById('auth-connecte');
    const nomUserSpan = document.getElementById('nom-utilisateur');

    if (user) {
        utilisateurActuel = user;
        if(zoneDeconnecte) zoneDeconnecte.style.display = 'none';
        if(zoneConnecte) zoneConnecte.style.display = 'flex';
        if(nomUserSpan) nomUserSpan.innerText = user.displayName || user.email;
    } else {
        utilisateurActuel = null;
        if(zoneDeconnecte) zoneDeconnecte.style.display = 'block';
        if(zoneConnecte) zoneConnecte.style.display = 'none';
    }
});

// Inscription
const btnInsc = document.getElementById('btn-inscription');
if(btnInsc) {
    btnInsc.addEventListener('click', () => {
        const pseudo = document.getElementById('auth-pseudo').value.trim();
        const email = document.getElementById('auth-email').value.trim();
        const mdp = document.getElementById('auth-mdp').value.trim();

        if(!pseudo || !email || !mdp) { alert("⚠️ Saisie incomplète pour créer un compte !"); return; }
        
        auth.createUserWithEmailAndPassword(email, mdp)
            .then((userCredential) => {
                userCredential.user.updateProfile({ displayName: pseudo }).then(() => {
                    alert(`🎉 Inscription réussie ! Bienvenue au club ${pseudo}.`);
                });
            })
            .catch(err => alert("❌ Erreur lors de l'inscription : " + err.message));
    });
}

// Connexion
const btnConn = document.getElementById('btn-connexion');
if(btnConn) {
    btnConn.addEventListener('click', () => {
        const email = document.getElementById('auth-email').value.trim();
        const mdp = document.getElementById('auth-mdp').value.trim();

        if(!email || !mdp) { alert("⚠️ Identifiants manquants !"); return; }

        auth.signInWithEmailAndPassword(email, mdp)
            .then(() => alert("👋 Heureux de te revoir ! Connexion établie."))
            .catch(err => alert("❌ Identifiants erronés : " + err.message));
    });
}

// Déconnexion
const btnDeco = document.getElementById('btn-deconnexion');
if(btnDeco) {
    btnDeco.addEventListener('click', () => {
        auth.signOut().then(() => alert("🔒 Déconnecté avec succès !"));
    });
}

// ==========================================
// 3. GENERATION DU P01 À P10 ET ÉCOUTEURS
// ==========================================
if (grille) {
    for (let i = 1; i <= 10; i++) {
        const ligne = document.createElement('div');
        ligne.className = 'ligne-pilote';
        ligne.style.display = 'flex';
        ligne.style.alignItems = 'center';
        ligne.style.gap = '10px';

        const badge = document.createElement('div');
        badge.className = 'badge-position';
        badge.innerText = `P${String(i).padStart(2, '0')}`;

        const select = document.createElement('select');
        select.id = `pos-${i}`;
        select.className = 'select-pilote';
        
        const optionVide = document.createElement('option');
        optionVide.value = "";
        optionVide.text = "Sélectionner un pilote...";
        select.appendChild(optionVide);

        const pokerContainer = document.createElement('label');
        pokerContainer.innerHTML = `<input type="checkbox" name="coup-poker" class="check-poker" value="${i}" style="margin-right:3px;">⭐`;

        const img = document.createElement('img');
        img.className = 'img-monoplace';
        img.style.display = 'none';

        select.addEventListener('change', () => {
            mettreAJourListes();
            const piloteTrouve = pilotesData.find(p => p.nom === select.value);
            if (piloteTrouve) {
                img.src = piloteTrouve.img;
                img.style.display = 'block';
            } else {
                img.src = "";
                img.style.display = 'none';
            }
        });

        ligne.appendChild(badge);
        ligne.appendChild(select);
        ligne.appendChild(pokerContainer);
        ligne.appendChild(img);
        grille.appendChild(ligne);
    }

    grille.addEventListener('change', (e) => {
        if (e.target.classList.contains('check-poker')) {
            const checkboxes = document.querySelectorAll('.check-poker');
            checkboxes.forEach(cb => { if (cb !== e.target) cb.checked = false; });
        }
    });
}

initialiserPolePosition();
mettreAJourListes();
initialiserEcuriesTopFlop();
verifierStatutDuGrandPrix();

if (selectCourse) {
    selectCourse.addEventListener('change', verifierStatutDuGrandPrix);
}

// ==========================================
// 4. VERROUILLAGE & LIEN HISTORIQUE API ERGAST
// ==========================================
function verifierStatutDuGrandPrix() {
    const courseActuelle = selectCourse.value;
    const roundNumber = parseInt(courseActuelle.split('/')[1]);

    const titreGrille = document.getElementById('titre-grille');
    const btnAleatoire = document.getElementById('btn-aleatoire');
    const btnValider = document.getElementById('btn-valider');
    
    if (roundNumber < 9) {
        if (titreGrille) titreGrille.innerText = "🏁 RÉSULTATS OFFICIELS DE LA COURSE :";
        if (btnAleatoire) btnAleatoire.style.display = 'none';
        if (btnValider) {
            btnValider.disabled = true;
            btnValider.innerText = "🔒 WEEK-END CLOS (MODIFICATION IMPOSSIBLE)";
            btnValider.style.backgroundColor = "#555";
        }
        
        desactiverFormulaire(true);

        fetch(`https://ergast.com/api/f1/${courseActuelle}/results.json`)
            .then(response => response.json())
            .then(data => {
                const results = data.MRData.RaceTable.Race[0]?.Results;
                if (results) {
                    for (let i = 1; i <= 10; i++) {
                        const selectElement = document.getElementById(`pos-${i}`);
                        const apiDriver = results[i-1]?.Driver;
                        if (selectElement && apiDriver) {
                            const monPilote = pilotesData.find(p => p.nom.toLowerCase().includes(apiDriver.familyName.toLowerCase()));
                            if (monPilote) {
                                selectElement.innerHTML = `<option value="${monPilote.nom}" selected>${monPilote.nom}</option>`;
                                const img = selectElement.parentElement.querySelector('.img-monoplace');
                                if (img) { img.src = monPilote.img; img.style.display = 'block'; }
                            }
                        }
                    }
                }
            })
            .catch(err => console.log("Pas de données API.", err));

    } else {
        if (titreGrille) titreGrille.innerText = "🏆 TON TOP 10 PILOTES :";
        if (btnAleatoire) btnAleatoire.style.display = 'block';
        if (btnValider) {
            btnValider.disabled = false;
            btnValider.innerText = "🏁 VALIDER MES PRONOSTICS";
            btnValider.style.backgroundColor = "#E10600";
        }
        
        desactiverFormulaire(false);
        mettreAJourListes();
    }
}

function desactiverFormulaire(statut) {
    document.querySelectorAll('.select-pilote').forEach(s => s.disabled = statut);
    document.querySelectorAll('.check-poker').forEach(c => c.disabled = statut);
    document.querySelectorAll('.select-ecurie').forEach(e => e.disabled = statut);
    const selectPole = document.getElementById('select-pole');
    if (selectPole) selectPole.disabled = statut;
}

// ==========================================
// 5. REMPLISSAGE DYNAMIQUE ET COTES
// ==========================================
function mettreAJourListes() {
    const tousLesSelects = document.querySelectorAll('.select-pilote');
    if (tousLesSelects.length === 0 || tousLesSelects[0].disabled) return;

    const choixFaits = Array.from(tousLesSelects).map(s => s.value).filter(val => val !== "");

    tousLesSelects.forEach(select => {
        const valeurActuelle = select.value;
        const idSelect = select.id;
        const position = parseInt(idSelect.split('-')[1]);

        select.innerHTML = '<option value="">Sélectionner un pilote...</option>';

        pilotesData.forEach(p => {
            if (!choixFaits.includes(p.nom) || p.nom === valeurActuelle) {
                const opt = document.createElement('option');
                opt.value = p.nom;
                
                let _cote = 1.5;
                if (p.statut === "favori") {
                    if (position === 1) _cote = 1.3;
                    else if (position <= 3) _cote = 1.1;
                    else if (position <= 6) _cote = 1.8;
                    else _cote = 2.5 + (position * 0.1);
                } 
                else if (p.statut === "outsider") {
                    if (position === 1) { _cote = 35.0; if (p.nom === "Fernando Alonso") _cote = 100.0; } 
                    else if (position <= 3) _cote = 10.0;
                    else if (position <= 6) _cote = 3.5;
                    else _cote = 1.6;
                } 
                else if (p.statut === "fond") {
                    if (position === 1) _cote = 120.0;
                    else if (position <= 3) _cote = 60.0;
                    else if (position <= 6) _cote = 18.0;
                    else if (position <= 8) _cote = 5.0;
                    else _cote = 1.3;
                }

                opt.text = `${p.nom} (${p.ecurie}) - Cote: x${_cote.toFixed(1)}`;
                if (p.nom === valeurActuelle) opt.selected = true;
                select.appendChild(opt);
            }
        });
    });
}

function initialiserPolePosition() {
    const selectPole = document.getElementById('select-pole');
    if (!selectPole) return;
    selectPole.innerHTML = '<option value="">Choisir le poleman du samedi...</option>';
    pilotesData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nom;
        opt.text = `${p.nom} (${p.ecurie})`;
        selectPole.appendChild(opt);
    });
}

function initialiserEcuriesTopFlop() {
    const selectsEcurie = document.querySelectorAll('.select-ecurie');
    selectsEcurie.forEach(select => {
        select.innerHTML = '<option value="">Choisir une écurie...</option>';
        ecuriesList.forEach(ecurie => {
            const opt = document.createElement('option');
            opt.value = ecurie;
            opt.text = ecurie;
            select.appendChild(opt);
        });
    });
}

// Prono aléatoire
const btnAleatoire = document.getElementById('btn-aleatoire');
if (btnAleatoire) {
    btnAleatoire.addEventListener('click', () => {
        const tousLesSelects = document.querySelectorAll('.select-pilote');
        const pilotesMelanges = [...pilotesData].sort(() => 0.5 - Math.random());
        tousLesSelects.forEach((select, index) => {
            select.value = pilotesMelanges[index].nom;
            const img = select.parentElement.querySelector('.img-monoplace');
            if (img) { img.src = pilotesMelanges[index].img; img.style.display = 'block'; }
        });
        mettreAJourListes();
    });
}

// Soumission
const btnValider = document.getElementById('btn-valider');
if (btnValider) {
    btnValider.addEventListener('click', () => {
        if (!utilisateurActuel) {
            alert("⚠️ Envoi impossible ! Tu dois obligatoirement t'identifier ou créer un compte dans l'ESPACE MEMBRE (en haut à gauche de la page) avant de soumettre ton prono.");
            return;
        }

        const poleman = document.getElementById('select-pole').value;
        if (!poleman) { alert("⚠️ N'oublie pas de choisir le Poleman du samedi !"); return; }

        const tousLesSelects = document.querySelectorAll('.select-pilote');
        const choixPilotes = Array.from(tousLesSelects).map(s => s.value);
        if (choixPilotes.includes("")) { alert(`⚠️ Ton Top 10 est incomplet !`); return; }

        const checkPokerCocha = document.querySelector('.check-poker:checked');
        const positionCoupPoker = checkPokerCocha ? parseInt(checkPokerCocha.value) : null;

        const top1 = document.getElementById('ecurie-top-1').value;
        const top2 = document.getElementById('ecurie-top-2').value;
        const flop1 = document.getElementById('ecurie-flop-1').value;
        const flop2 = document.getElementById('ecurie-flop-2').value;

        if (!top1 || !top2 || !flop1 || !flop2) { alert("⚠️ Section Écuries incomplète !"); return; }

        const donneesPronostic = {
            uidJoueur: utilisateurActuel.uid,
            pseudo: utilisateurActuel.displayName || "JoueurAnonyme",
            email: utilisateurActuel.email,
            course: selectCourse ? selectCourse.value : "Inconnu",
            poleman: poleman,
            classementPilotes: choixPilotes,
            ligneCoupPoker: positionCoupPoker,
            ecuriesTop: [top1, top2],
            ecuriesFlop: [flop1, flop2],
            date: new Date()
        };

        db.collection("pronostics").add(donneesPronostic)
        .then(() => { 
            alert(`🏆 Bravo ${donneesPronostic.pseudo} !\\n\\nTes pronostics pour le Grand Prix (${donneesPronostic.course}) ont bien été envoyés et sécurisés sur la base de données.`); 
        })
        .catch((err) => { 
            console.error("Erreur d'écriture Firebase : ", err);
            alert("❌ Erreur lors de la transmission au cloud."); 
        });
    });
}

// ==========================================
// 7. CHARGEMENT DYNAMIQUE DU CLASSEMENT GENERAL
// ==========================================
function chargerClassementGeneral() {
    const conteneurClassement = document.getElementById('liste-classement');
    if (!conteneurClassement) return;

    db.collection("utilisateurs").orderBy("points", "desc").onSnapshot((snapshot) => {
        conteneurClassement.innerHTML = ""; 
        
        if (snapshot.empty) {
            conteneurClassement.innerHTML = "<div style='padding: 10px; color: #aaa; font-style: italic;'>Aucun joueur enregistré pour le moment.</div>";
            return;
        }

        let position = 1;
        snapshot.forEach((doc) => {
            const data = doc.data();
            const pseudo = data.pseudo || "Joueur anonyme";
            const points = data.points !== undefined ? data.points : 0;

            let medaille = position;
            if (position === 1) medaille = "🥇 1";
            else if (position === 2) medaille = "🥈 2";
            else if (position === 3) medaille = "🥉 3";

            const ligne = document.createElement('div');
            ligne.className = 'ligne-joueur';
            ligne.style.marginTop = '8px';
            
            ligne.innerHTML = `
                <div class="pos-podium">${medaille}</div>
                <div>${pseudo}</div>
                <div class="score-points">${points} pts</div>
            `;

            conteneurClassement.appendChild(ligne);
            position++;
        });
    }, (error) => {
        console.error("Erreur lors du chargement du classement :", error);
    });
}

chargerClassementGeneral();
