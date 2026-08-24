import { pilotesData, ecuriesSaison, LOGOS_ECURIES_2026 } from "../utils";
import { resoudrePilote } from "./driversService";

export function mettreAJourDesignSlot(position: number, nomPilote: string): void {
    const card = document.getElementById(`card-f1-p${position}`);
    const badge = document.getElementById(`badge-p${position}`);
    const numTarget = document.getElementById(`num-f1-p${position}`);
    const flagTarget = document.getElementById(`flag-f1-p${position}`) as HTMLImageElement | null;
    const imgTarget = document.getElementById(`img-grid-p${position}`) as HTMLImageElement | null;
    const carTarget = document.getElementById(`car-grid-p${position}`) as HTMLImageElement | null;
    const teamTarget = document.getElementById(`team-grid-p${position}`);
    
    const localData = pilotesData.find(p => p.nom === nomPilote) || (nomPilote ? resoudrePilote(nomPilote) : null);

    if (nomPilote && localData) {
        if (card) card.style.borderLeft = `5px solid ${localData.couleur}`;
        if (badge) badge.style.background = localData.couleur;
        
        if (numTarget) {
            numTarget.innerText = localData.numero;
            numTarget.style.color = localData.couleur;
        }
        if (flagTarget) {
            flagTarget.src = `https://flagcdn.com/w20/${localData.pays}.png`;
            flagTarget.style.display = "inline-block";
        }
        
        if (imgTarget) {
            imgTarget.src = localData.driverImg;
            imgTarget.style.display = "block";
        }
        if (carTarget) carTarget.src = localData.carImg;
        
        if (teamTarget) {
            teamTarget.innerText = localData.ecurie;
            teamTarget.style.color = "#ff8000";
        }
    } else {
        if (card) card.style.borderLeft = `1px solid #2f3e56`;
        if (badge) badge.style.background = "#232e44";
        if (numTarget) {
            numTarget.innerText = "--";
            numTarget.style.color = "rgba(255,255,255,0.15)";
        }
        if (flagTarget) flagTarget.style.display = "none";
        if (imgTarget) imgTarget.style.display = "none";
        if (carTarget) carTarget.removeAttribute('src');
        if (teamTarget) {
            teamTarget.innerText = "⚡ PLACE À PRENDRE";
            teamTarget.style.color = "#616e88";
        }
    }
}

export function controlerDoublonsPilotes(): void {
    const selections: string[] = [];
    for(let i = 1; i <= 10; i++) {
        const val = (document.getElementById(`select-grid-p${i}`) as HTMLSelectElement | null)?.value;
        if(val) selections.push(val);
    }

    for(let i = 1; i <= 10; i++) {
        const select = document.getElementById(`select-grid-p${i}`) as HTMLSelectElement | null;
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

export function creerLaGrilleDeDepartTV(onSlotChange?: (pos: number, val: string) => void): void {
    const conteneurGrille = document.getElementById('grille-pronos');
    if (!conteneurGrille) return;
    conteneurGrille.innerHTML = "";

    for (let i = 1; i <= 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'grid-slot';
        slot.setAttribute('data-pos', String(i));

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

        const selectElem = slot.querySelector('select');
        selectElem?.addEventListener('change', function(this: HTMLSelectElement) {
            mettreAJourDesignSlot(i, this.value);
            controlerDoublonsPilotes();
            if (onSlotChange) onSlotChange(i, this.value);
        });
    }
}

export function appliquerSelectionEcurieVisuelle(slotId: string, nomEcurie: string): void {
    const conteneur = document.getElementById(slotId);
    if (!conteneur) return;

    conteneur.setAttribute('data-ecurie-value', nomEcurie);

    const placeholder = conteneur.querySelector<HTMLElement>('.placeholder-team');
    const img = conteneur.querySelector<HTMLImageElement>('.logo-selectionne');
    const txt = conteneur.querySelector<HTMLElement>('.nom-selectionne');

    if (nomEcurie && LOGOS_ECURIES_2026[nomEcurie]) {
        if (placeholder) placeholder.style.display = "none";
        if (img) {
            img.src = LOGOS_ECURIES_2026[nomEcurie];
            img.style.display = "block";
        }
        if (txt) {
            txt.innerText = nomEcurie;
            txt.style.display = "block";
        }
        conteneur.style.border = slotId.includes('top') ? "2px solid #00e6c3" : "2px solid #ef4444";
        conteneur.style.background = "rgba(255,255,255,0.02)";
    } else {
        if (placeholder) placeholder.style.display = "block";
        if (img) {
            img.style.display = "none";
            img.src = "";
        }
        if (txt) {
            txt.style.display = "none";
            txt.innerText = "";
        }
        conteneur.style.border = "2px dashed #2d3954";
        conteneur.style.background = "#0f131c";
    }
}

export function ouvrirSelecteurVisuelEcurie(slotId: string): void {
    let modale = document.getElementById('modale-choix-ecurie');
    if (!modale) {
        modale = document.createElement('div');
        modale.id = 'modale-choix-ecurie';
        modale.setAttribute('style', "position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10000; display:flex; align-items:center; justify-content:center;");
        document.body.appendChild(modale);
    }
    modale.style.display = "flex";

    const autresSlots = ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"].filter(id => id !== slotId);
    const ecuriesDejaPrises = autresSlots
        .map(id => document.getElementById(id)?.getAttribute('data-ecurie-value'))
        .filter(Boolean) as string[];

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

    const btnFermer = document.getElementById('fermer-choix-ecurie');
    if (btnFermer) btnFermer.onclick = () => { if (modale) modale.style.display = "none"; };

    modale.querySelectorAll<HTMLElement>('.tuile-ecurie').forEach(tuile => {
        if (tuile.getAttribute('data-verrouillee') === 'true') return;

        tuile.onmouseenter = () => tuile.style.borderColor = "#ff8000";
        tuile.onmouseleave = () => tuile.style.borderColor = "#2d3954";
        tuile.onclick = function() {
            const choix = this.getAttribute('data-name') || "";
            appliquerSelectionEcurieVisuelle(slotId, choix);
            if (modale) modale.style.display = "none";
        };
    });
}

export function initialiserEcuriesTopFlop(): void {
    const slots = ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"];
    slots.forEach(id => {
        const conteneur = document.getElementById(id);
        if (!conteneur) return;

        conteneur.setAttribute('style', "background: #0f131c; border: 2px dashed #2d3954; border-radius: 8px; height: 90px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all 0.2s ease; overflow: hidden; padding: 5px;");
        
        conteneur.innerHTML = `
            <div class="placeholder-team" style="text-align: center; color: #616e88; font-size: 12px; font-weight: bold;">
                ➕ CHOISIR<br><span style="font-size: 10px; opacity: 0.7;">UNE ÉCURIE</span>
            </div>
            <img class="logo-selectionne" src="" style="display: none; height: 75%; max-width: 90%; object-fit: contain; z-index: 2;">
            <div class="nom-selectionne" style="display: none; position: absolute; bottom: 2px; font-size: 10px; font-weight: bold; color: #fff; background: rgba(0,0,0,0.6); padding: 1px 6px; border-radius: 4px; text-transform: uppercase;"></div>
        `;

        conteneur.onclick = () => ouvrirSelecteurVisuelEcurie(id);
    });
}

export function mettreAJourDesignSlotSprint(position: number, nomPilote: string): void {
    const card = document.getElementById(`card-sprint-p${position}`);
    const badge = document.getElementById(`badge-sprint-p${position}`);
    const numTarget = document.getElementById(`num-sprint-p${position}`);
    const flagTarget = document.getElementById(`flag-sprint-p${position}`) as HTMLImageElement | null;
    const imgTarget = document.getElementById(`img-sprint-p${position}`) as HTMLImageElement | null;
    const carTarget = document.getElementById(`car-sprint-p${position}`) as HTMLImageElement | null;
    const teamTarget = document.getElementById(`team-sprint-p${position}`);

    const localData = pilotesData.find(p => p.nom === nomPilote) || (nomPilote ? resoudrePilote(nomPilote) : null);

    if (nomPilote && localData) {
        if (card) card.style.borderLeft = `5px solid ${localData.couleur}`;
        if (badge) badge.style.background = localData.couleur;

        if (numTarget) {
            numTarget.innerText = localData.numero;
            numTarget.style.color = localData.couleur;
        }
        if (flagTarget) {
            flagTarget.src = `https://flagcdn.com/w20/${localData.pays}.png`;
            flagTarget.style.display = "inline-block";
        }

        if (imgTarget) {
            imgTarget.src = localData.driverImg;
            imgTarget.style.display = "block";
        }
        if (carTarget) {
            carTarget.src = localData.carImg;
            carTarget.style.display = "block";
        }

        if (teamTarget) {
            teamTarget.innerText = localData.ecurie;
            teamTarget.style.color = "#00e6c3";
        }
    } else {
        if (card) card.style.borderLeft = `1px solid #3b4263`;
        if (badge) badge.style.background = "#4f46e5";
        if (numTarget) {
            numTarget.innerText = "--";
            numTarget.style.color = "rgba(255,255,255,0.2)";
        }
        if (flagTarget) flagTarget.style.display = "none";
        if (imgTarget) imgTarget.style.display = "none";
        if (carTarget) carTarget.style.display = "none";
        if (teamTarget) {
            teamTarget.innerText = "⚡ PLACE SPRINT À PRENDRE";
            teamTarget.style.color = "#818cf8";
        }
    }
}

export function controlerDoublonsSprint(): void {
    const selections: string[] = [];
    for (let i = 1; i <= 5; i++) {
        const val = (document.getElementById(`select-sprint-p${i}`) as HTMLSelectElement | null)?.value;
        if (val) selections.push(val);
    }

    for (let i = 1; i <= 5; i++) {
        const select = document.getElementById(`select-sprint-p${i}`) as HTMLSelectElement | null;
        if (!select) continue;
        const valeurActuelle = select.value;

        Array.from(select.options).forEach(option => {
            if (option.value === "") return;
            if (selections.includes(option.value) && option.value !== valeurActuelle) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    }
}

export function creerLaGrilleSprintTV(onSlotChange?: (pos: number, val: string) => void): void {
    const conteneurGrille = document.getElementById('grille-sprint-slots');
    if (!conteneurGrille) return;
    conteneurGrille.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'sprint-slot';
        slot.setAttribute('data-pos', String(i));
        slot.setAttribute('style', 'display:flex; align-items:center; gap:10px; margin-bottom:10px;');

        let optionsHtml = `<option value="">👉 CHOISIS TON PILOTE SPRINT</option>`;
        pilotesData.forEach(p => { optionsHtml += `<option value="${p.nom}">${p.nom} (${p.ecurie})</option>`; });

        slot.innerHTML = `
            <div class="sprint-pos-badge" id="badge-sprint-p${i}" style="min-width:44px; height:44px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.85rem; border-radius:8px; background:#4f46e5; color:#fff; flex-shrink:0; box-shadow:0 2px 8px rgba(0,0,0,0.3); transition:background 0.3s ease;">⚡ S${i}</div>
            <div class="sprint-card-f1" id="card-sprint-p${i}" style="position:relative; background:#1e2640; display:flex; align-items:center; flex-grow:1; min-width:0; border-radius:8px; border:1px solid #3b4263; padding:6px 12px; transition:all 0.3s ease; overflow:hidden;">
                <img id="car-sprint-p${i}" class="car-bg-image-sprint" src="" style="position:absolute; right:0; bottom:-8px; height:120%; max-width:55%; opacity:0.28; object-fit:contain; pointer-events:none; z-index:1; display:none;">
                <div style="flex-grow:1; display:flex; flex-direction:column; justify-content:center; min-width:0; position:relative; z-index:2;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">
                        <span id="num-sprint-p${i}" style="font-size:18px; font-weight:900; font-style:italic; color:rgba(255,255,255,0.2);">--</span>
                        <img id="flag-sprint-p${i}" src="" style="width:18px; border-radius:2px; display:none;">
                    </div>
                    <select id="select-sprint-p${i}" class="sprint-select-paddock" data-position="${i}" style="width:100%; background:transparent; border:none; color:#fff; font-size:14px; font-weight:bold; cursor:pointer; padding:2px 0; outline:none; text-overflow:ellipsis;">
                        ${optionsHtml}
                    </select>
                    <div id="team-sprint-p${i}" style="color:#818cf8; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">⚡ PLACE SPRINT À PRENDRE</div>
                </div>
                <div style="position:relative; width:55px; height:55px; display:flex; justify-content:center; overflow:hidden; margin-left:10px; border-radius:4px; z-index:2; flex-shrink:0;">
                    <img id="img-sprint-p${i}" src="" style="width:100%; height:100%; object-fit:cover; object-position:top; display:none;">
                </div>
            </div>
        `;
        conteneurGrille.appendChild(slot);

        const selectElem = slot.querySelector('select');
        selectElem?.addEventListener('change', function(this: HTMLSelectElement) {
            mettreAJourDesignSlotSprint(i, this.value);
            controlerDoublonsSprint();
            if (onSlotChange) onSlotChange(i, this.value);
        });
    }
}
