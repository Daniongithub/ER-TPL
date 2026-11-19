const API_ENDPOINT = "https://ertpl-ha.cfw.serverissimo.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const searchBar = document.getElementById('search-bar');
const stopCodeBar = document.getElementById('stop-code-bar');
const resultsContainer = document.getElementById('results-container');
const quickContainer = document.getElementById('quick-container');
const quickStopsContainer = document.getElementById('quick-stops-container');
const comeLeggere = document.getElementById('comeleggere-p');
const aggiornamentoP = document.getElementById('aggiornamento-p')

var searching = false;
var oldTerm;
var allresults = [];

//Loads preferred quick stops
const currentStopsStr = localStorage.getItem("quick_stops");
var selectedStops = new Map();

if (currentStopsStr != null) {
    try {
        selectedStops = new Map(JSON.parse(currentStopsStr));
        if (selectedStops.size != 0) {
            quickStopsContainer.innerHTML = '';
        }
        selectedStops.forEach((name, code) => {
            const div = document.createElement('div');
            div.className = 'search-result';
            //Fermate dummy altre corsie
            if (code.includes("a!")) {
                div.innerHTML = `
                    <div>
                        <h3>${name}</h3>
                        <p>Tutte le corsie</p>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div>
                        <h3>${name}</h3>
                        <p>Codice fermata: ${code}</p>
                    </div>
                `;
            }

            quickStopsContainer.appendChild(div);
        });
    } catch (e) {
        console.error("Errore nel parsing delle fermate salvate:", e);
        selectedStops = new Map();
    }
}

getApiUrl().then(url => {
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
        })
        .catch(error => console.error('Errore nel caricamento dei dati:', error));
})

searchBar.addEventListener('input', () => {
    if (searchBar.value == '') {
        resultsContainer.innerHTML = '';
        quickContainer.style.display = '';
        comeLeggere.style.display = '';
    } else {
        const searchTerm = searchBar.value.trim().toLowerCase();
        stopCodeBar.value = ''
        search(searchTerm);
    }
});

stopCodeBar.addEventListener('input', () => {
    var code = "MO" + stopCodeBar.value.trim().toUpperCase();
    resultsContainer.innerHTML = '';
    quickContainer.style.display = 'none';
    comeLeggere.style.display = 'none';
    searchBar.value = ''

    const div = document.createElement('div');
    const a = document.createElement('a');
    a.className = 'bianco';
    a.href = `fermata.html?code=${code}`;
    div.className = 'search-result';
    div.innerHTML = `
        <div>
            <h3>${code}</h3>
            <p>Codice fermata: ${code}</p>
        </div>
    `;
    a.appendChild(div);

    resultsContainer.appendChild(a);
    if (stopCodeBar.value == '') {
        resultsContainer.innerHTML = '';
        quickContainer.style.display = '';
        comeLeggere.style.display = '';
    }
});

function renderResults(results) {
    resultsContainer.innerHTML = '';
    quickContainer.style.display = 'none';
    comeLeggere.style.display = 'none';
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Nessun risultato trovato</p>';
        return;
    }

    results.forEach(item => {
        const div = document.createElement('div');
        const a = document.createElement('a');
        a.className = 'bianco';
        a.href = `fermata.html?code=${item.code}`;
        div.className = 'search-result';
        div.innerHTML = `
            <div>
                <h3>${item.name}</h3>
                <p>Codice fermata: ${item.code}</p>
            </div>
        `;
        a.appendChild(div);

        resultsContainer.appendChild(a);
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

            const aIndex = aName.indexOf(searchTerm);
            const bIndex = bName.indexOf(searchTerm);

            return aIndex - bIndex;
        });
    renderResults(filtered);
}