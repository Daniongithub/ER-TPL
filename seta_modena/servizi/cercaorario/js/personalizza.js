
const API_ENDPOINT = "https://ertpl-ha.cfw.serverissimo.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const currentContainer = document.getElementById('current-container');
const searchBar = document.getElementById('search-bar');
const resultsContainer = document.getElementById('results-container');

const currentStopsStr = localStorage.getItem("quick_stops");
var selectedStops = new Map();

if (currentStopsStr != null) {
    try {
        selectedStops = new Map(JSON.parse(currentStopsStr));
    } catch (e) {
        console.error("Errore nel parsing delle fermate salvate:", e);
        selectedStops = new Map();
    }
}

var resultsByCode = new Map();

//Mostra le fermate rapide attuali (quelle selezionate, o i 3 default se non ce n'e' nessuna)
function renderCurrentStops() {
    currentContainer.innerHTML = '';

    if (selectedStops.size === 0) {
        currentContainer.innerHTML = `
            <div class="search-result">
                <div>
                    <h3>Autostazione</h3>
                    <p>Tutte le corsie</p>
                    <button class="styled altrecorsie">Visualizza arrivi</button>
                </div>
            </div>
            <div class="search-result">
                <div>
                    <h3>Stazione FS</h3>
                    <p>Tutte le corsie</p>
                    <button class="styled altrecorsie">Visualizza arrivi</button>
                </div>
            </div>
            <div class="search-result">
                <div>
                    <h3>Largo Garibaldi</h3>
                    <p>Tutte le corsie</p>
                    <button class="styled altrecorsie">Visualizza arrivi</button>
                </div>
            </div>
        `;
        return;
    }

    selectedStops.forEach((name, code) => {
        const div = document.createElement('div');
        div.className = 'search-result';
        //Fermate dummy altre corsie
        if (code.includes("a!")) {
            trimmedCode = code.replace("a!","")
            div.innerHTML = `
                <div>
                    <h3>${name}</h3>
                    <p>Tutte le corsie</p>
                    <button class="styled altrecorsie">Visualizza arrivi</button>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div>
                    <h3>${name}</h3>
                    <p>Codice fermata: ${code}</p>
                    <button class="styled">Visualizza arrivi</button>
                </div>
            `;
        }

        //Visualizza arrivi
        div.querySelector('button').addEventListener('click', (event) => {
            event.stopPropagation();
            if (event.target.className.includes('altrecorsie')) {
                window.open(`altrecorsie.html?location=${encodeURIComponent(trimmedCode)}`, '_blank');
            } else {
                window.open(`fermata.html?code=${encodeURIComponent(item.code)}`, '_blank');
            }
        });

        div.addEventListener('click', () => {
            selectedStops.delete(code);
            renderCurrentStops();
            setResultSelected(code, false);
        });

        currentContainer.appendChild(div);
    });
}

// Allinea la classe "selected" su un eventuale risultato di ricerca visibile
// con lo stesso codice fermata (usato quando si rimuove da "Fermate attuali").
function setResultSelected(code, selected) {
    const node = resultsByCode.get(code);
    if (node) {
        node.classList.toggle('selected', selected);
    }
}

renderCurrentStops();

//Stop search logic
var searching = false;
var oldTerm;
var allresults = [];

getApiUrl().then(url => {
    if (!url) return;
    fetch(url + "/stops")
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
            return response.json();
        })
        .then(data => {
            allresults = data;
            if (searching) {
                search(oldTerm);
            }
            allresults.push(
                {code:"a!MODENA AUTOSTAZIONE", name: "Autostazione"},
                {code:"a!STAZIONE FS", name: "Stazione FS"},
                {code:"a!GARIBALDI", name: "Largo Garibaldi"},
            );
        })
        .catch(error => console.error('Errore nel caricamento dei dati:', error));
});



searchBar.addEventListener('input', () => {
    if (searchBar.value == '') {
        resultsContainer.innerHTML = '';
        resultsByCode.clear();
        searching = false;
    } else {
        const searchTerm = searchBar.value.trim().toLowerCase();
        search(searchTerm);
    }
});

function renderResults(results) {
    resultsContainer.innerHTML = '';
    resultsByCode.clear();

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Nessun risultato trovato</p>';
        return;
    }

    results.forEach(item => {
        const div = document.createElement('div');
        div.className = 'search-result';
        if (selectedStops.has(item.code)) {
            div.classList.add('selected');
        }
        //Fermate dummy altre corsie
        if (item.code.includes("a!")) {
            trimmedCode = item.code.replace("a!","")
            div.innerHTML = `
                <div>
                    <h3>${item.name}</h3>
                    <p>Tutte le corsie</p>
                    <button class="styled altrecorsie">Visualizza arrivi</button>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div>
                    <h3>${item.name}</h3>
                    <p>Codice fermata: ${item.code}</p>
                    <button class="styled">Visualizza arrivi</button>
                </div>
            `;
        }

        // Bottone "Visualizza arrivi": apre in una nuova scheda e non deve
        // propagare il click al contenitore (che gestisce la selezione).
        div.querySelector('button').addEventListener('click', (event) => {
            event.stopPropagation();
            if (event.target.className.includes('altrecorsie')) {
                window.open(`altrecorsie.html?location=${encodeURIComponent(trimmedCode)}`, '_blank');
            } else {
                window.open(`fermata.html?code=${encodeURIComponent(item.code)}`, '_blank');
            }
        });

        // Click sulla card: aggiunge/rimuove la fermata dalle rapide.
        div.addEventListener('click', () => {
            if (selectedStops.has(item.code)) {
                selectedStops.delete(item.code);
                div.classList.remove('selected');
            } else {
                selectedStops.set(item.code, item.name);
                div.classList.add('selected');
            }
            renderCurrentStops();
        });

        resultsByCode.set(item.code, div);
        resultsContainer.appendChild(div);
    });
}

function search(searchTerm) {
    //Filters taking first elements as the one starting with the letters in the search term
    searching = true;
    oldTerm = searchTerm;
    const filtered = allresults
        .filter(item =>
            item.name.toLowerCase().includes(searchTerm)
        )
        .sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();

            const aIsCorsie = a.code.includes('a!');
            const bIsCorsie = b.code.includes('a!');

            // Prima gli elementi Corsie
            if (aIsCorsie !== bIsCorsie) {
                return aIsCorsie ? -1 : 1;
            }

            // Poi ordina in base alla corrispondenza con searchTerm
            const aIndex = aName.indexOf(searchTerm);
            const bIndex = bName.indexOf(searchTerm);

            return aIndex - bIndex;
        });
    renderResults(filtered);
}

//Salvataggio delle fermate rapide scelte
function saveStops() {
    localStorage.setItem("quick_stops", JSON.stringify(Array.from(selectedStops.entries())));
    window.close();
}
window.saveStops = saveStops;