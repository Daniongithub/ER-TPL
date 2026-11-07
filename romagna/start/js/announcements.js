// Non usare var: usare let/const. Per i link nelle tabelle usare <a href>, mai onclick sulle celle.
(() => {
    const API_ENDPOINT = 'https://ertpl-api.vichingo455.com/start';
    const announcementsContainer = document.getElementById('announcements-container');
    if (!announcementsContainer) return;

    async function loadAnnouncements() {
        try {
            const registry = await fetch(API_ENDPOINT, { cache: 'no-store' });
            if (!registry.ok) throw new Error('Registry API non raggiungibile');
            const cfg = await registry.json();
            if (cfg.status !== 'ok' || typeof cfg.url !== 'string' || !cfg.url.trim()) {
                throw new Error('API annunci non disponibile');
            }

            const url = cfg.url.trim().replace(/\/+$/, '');
            const response = await fetch(url + '/announcements', { cache: 'no-store' });
            // L'API restituisce 404 quando non ci sono annunci, con un corpo non JSON.
            if (response.status === 404) {
                announcementsContainer.innerHTML = '';
                announcementsContainer.hidden = true;
                return;
            }
            if (!response.ok) throw new Error('Errore nel caricamento annunci. HTTP: ' + response.status);
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error('Elenco annunci non valido');

            // Gli annunci inseriti dal pannello admin supportano intenzionalmente HTML.
            const messages = data.map(announcement => announcement?.message)
                .filter(message => typeof message === 'string' && message.trim() !== '');
            announcementsContainer.innerHTML = messages.join('<br>');
            announcementsContainer.hidden = messages.length === 0;
        } catch (err) {
            console.error('Errore nel caricamento annunci:', err);
        }
    }

    loadAnnouncements();
})();
