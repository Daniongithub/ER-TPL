const API_ENDPOINT = 'https://ertpl-ha.cfw.serverissimo.com/seta';

async function loadStops() {
    const configResponse = await fetch(API_ENDPOINT);
    if (!configResponse.ok) throw new Error('Configurazione API non disponibile.');
    const config = await configResponse.json();
    if (config.status !== 'ok' || !config.url) throw new Error('Configurazione API non valida.');

    const response = await fetch(config.url + '/stops');
    if (!response.ok) throw new Error('Elenco fermate non disponibile.');
    return response.json();
}

const currentContainer = document.getElementById('current-container');
const searchBar = document.getElementById('search-bar');
const resultsContainer = document.getElementById('results-container');
const saveError = document.getElementById('save-error');

const selectedStops = loadQuickStops();
const resultsByCode = new Map();
let allStops = DEFAULT_QUICK_STOPS;

function createStopCard({ code, name }, onToggle) {
    const card = document.createElement('div');
    card.className = 'search-result';
    const details = createQuickStopDetails(code, name);
    const controls = document.createElement('div');
    controls.className = 'quick-stop-controls';

    let button;
    if (onToggle) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'styled';
        controls.append(button);
        card.classList.add('editable-stop');
        card.addEventListener('click', onToggle);
    }

    const arrivals = document.createElement('a');
    arrivals.className = 'styled';
    arrivals.href = quickStopUrl(code);
    arrivals.target = '_blank';
    arrivals.rel = 'noopener';
    arrivals.textContent = 'Visualizza arrivi';
    arrivals.setAttribute('aria-label', `Visualizza arrivi per ${name}`);
    arrivals.addEventListener('click', event => event.stopPropagation());
    controls.append(arrivals);
    details.append(controls);
    card.append(details);
    return { card, button };
}

function setSelectionAction(button, name, selected) {
    const action = selected ? 'Rimuovi' : 'Aggiungi';
    button.textContent = action;
    button.setAttribute('aria-label', `${action} ${name}`);
}

function updateResultSelection(code) {
    const result = resultsByCode.get(code);
    if (result) {
        const selected = selectedStops.has(code);
        result.card.classList.toggle('selected', selected);
        setSelectionAction(result.button, result.name, selected);
    }
}

function renderCurrentStops() {
    currentContainer.replaceChildren();

    if (selectedStops.size === 0) {
        for (const stop of DEFAULT_QUICK_STOPS) {
            currentContainer.append(createStopCard(stop).card);
        }
        return;
    }

    for (const [code, name] of selectedStops) {
        const { card, button } = createStopCard({ code, name }, () => {
            const restoreFocus = document.activeElement === button;
            selectedStops.delete(code);
            updateResultSelection(code);
            renderCurrentStops();
            if (restoreFocus) {
                const nextControl = resultsByCode.get(code)?.button ?? searchBar;
                nextControl.focus();
            }
        });
        setSelectionAction(button, name, true);
        currentContainer.append(card);
    }
}

function searchStops() {
    const term = searchBar.value.trim().toLowerCase();
    resultsContainer.replaceChildren();
    resultsByCode.clear();
    if (term === '') return;

    const results = allStops
        .filter(stop => stop.name.toLowerCase().includes(term))
        .sort((a, b) => {
            const groupOrder = Number(isStopGroup(b.code)) - Number(isStopGroup(a.code));
            return groupOrder || a.name.toLowerCase().indexOf(term) - b.name.toLowerCase().indexOf(term);
        });

    if (results.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'Nessun risultato trovato';
        resultsContainer.append(message);
        return;
    }

    for (const stop of results) {
        const { code, name } = stop;
        const { card, button } = createStopCard(stop, () => {
            if (!selectedStops.delete(code)) {
                selectedStops.set(code, name);
            }
            updateResultSelection(code);
            renderCurrentStops();
        });
        resultsByCode.set(code, { card, button, name });
        updateResultSelection(code);
        resultsContainer.append(card);
    }
}

function closeEditor() {
    if (window.opener) {
        window.close();
    } else {
        window.location.replace('index.html');
    }
}

function saveStops() {
    try {
        localStorage.setItem(QUICK_STOPS_KEY, JSON.stringify(Array.from(selectedStops)));
    } catch (error) {
        saveError.textContent = 'Impossibile salvare le fermate rapide. Verifica le impostazioni di archiviazione del browser e riprova.';
        saveError.hidden = false;
        console.warn('Impossibile salvare le fermate rapide:', error);
        return;
    }
    closeEditor();
}

renderCurrentStops();
searchBar.addEventListener('input', searchStops);
document.getElementById('close-editor').addEventListener('click', closeEditor);
document.getElementById('save-stops').addEventListener('click', saveStops);

loadStops()
    .then(stops => {
        allStops = [...DEFAULT_QUICK_STOPS, ...stops];
        searchStops();
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));
