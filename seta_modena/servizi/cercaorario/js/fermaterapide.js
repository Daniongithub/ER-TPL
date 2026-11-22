const QUICK_STOPS_KEY = 'quick_stops';
const DEFAULT_QUICK_STOPS = [
    { code: 'a!MODENA AUTOSTAZIONE', name: 'Autostazione' },
    { code: 'a!STAZIONE FS', name: 'Stazione FS' },
    { code: 'a!GARIBALDI', name: 'Largo Garibaldi' },
];

function loadQuickStops() {
    try {
        const entries = JSON.parse(localStorage.getItem(QUICK_STOPS_KEY) ?? '[]');
        return new Map(entries.filter(entry =>
            Array.isArray(entry) && entry.length === 2 &&
            entry.every(value => typeof value === 'string' && value.length > 0)
        ));
    } catch (error) {
        console.warn('Impossibile leggere le fermate rapide salvate:', error);
        return new Map();
    }
}

function isStopGroup(code) {
    return code.startsWith('a!');
}

function quickStopUrl(code) {
    if (isStopGroup(code)) {
        return `altrecorsie.html?location=${encodeURIComponent(code.slice(2))}`;
    }
    return `fermata.html?code=${encodeURIComponent(code)}`;
}

function createQuickStopDetails(code, name) {
    const details = document.createElement('div');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    title.textContent = name;
    description.textContent = isStopGroup(code) ? 'Tutte le corsie' : `Codice fermata: ${code}`;
    details.append(title, description);
    return details;
}
