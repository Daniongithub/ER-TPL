const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const searchBar = document.getElementById('searchBar');
const stopCodeBar = document.getElementById('stopCodeBar');
const stopCode = document.getElementById('stopCode');
const resultsContainer = document.getElementById('results-container');
const quickContainer = document.getElementById('quick-container');
const comeLeggere = document.getElementById('comeleggere-p');

var searching = false;
var oldTerm;
var allresults = [];

getApiUrl().then(url => {
    fetch(url + "/stoplist")
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
        stopCode.style.display = '';
    } else {
        const searchTerm = searchBar.value.trim().toLowerCase();
        search(searchTerm);
    }
});

stopCodeBar.addEventListener('input', () => {
    var code = "MO" + stopCodeBar.value.trim().toUpperCase();
    comeLeggere.innerHTML = '';
    resultsContainer.innerHTML = '';

    const div = document.createElement('div');
    const a = document.createElement('a');
    a.className = 'bianco';
    a.href = `fermata.html?code=${encodeURIComponent(code)}&name=${encodeURIComponent(code)}`;
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
    stopCode.style.display = 'none';
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Nessun risultato trovato</p>';
        return;
    }

    results.forEach(item => {
        const div = document.createElement('div');
        const a = document.createElement('a');
        a.className = 'bianco';
        a.href = `fermata.html?code=${encodeURIComponent(item.code)}&name=${encodeURIComponent(item.name)}`;
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