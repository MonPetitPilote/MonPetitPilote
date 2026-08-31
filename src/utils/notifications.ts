// Affiche une notification discrète en haut à droite (remplace les alert() bloquants)
// type : 'succes' | 'erreur' | 'info'
export function afficherNotification(message: string, type: 'succes' | 'erreur' | 'info' = 'info'): void {
    const conteneur = document.getElementById('conteneur-notifications');
    if (!conteneur) {
        console.warn(`[${type}] ${message}`);
        return;
    }

    const icones: Record<string, string> = { succes: '✅', erreur: '❌', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast-notif ${type}`;
    toast.innerHTML = `
        <span>${icones[type] || 'ℹ️'}</span>
        <span>${message}</span>
        <button class="toast-fermer" aria-label="Fermer">&times;</button>
    `;

    const retirer = () => toast.remove();
    toast.querySelector('.toast-fermer')?.addEventListener('click', retirer);
    setTimeout(retirer, 5000);

    conteneur.appendChild(toast);
}
