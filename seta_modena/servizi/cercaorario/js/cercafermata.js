const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const searchBar = document.getElementById('searchBar');
const stopCodeBar = document.getElementById('stopCodeBar');
const resultsContainer = document.getElementById('results-container');
const quickContainer = document.getElementById('quick-container');
const comeLeggere = document.getElementById('comeleggere-p');

var searching = false;
var oldTerm;
var allresults = false;

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
    } else {
        const searchTerm = searchBar.value.toLowerCase();
        search(searchTerm);
    }
});

stopCodeBar.addEventListener('input', () => {
    var code = "MO" + stopCodeBar.value.toUpperCase();
    comeLeggere.innerHTML = '';
    resultsContainer.innerHTML = '';

    const div = document.createElement('div');
    const a = document.createElement('a');
    a.href = "fermata.html?code=${code}&name=${code}";
    div.className = 'search-result';
    div.innerHTML = `
        <div>
            <h3>${code}</h3>
            <p>Codice fermata: ${code}</p>
        </div>
    `;
    a.appendChild(div);

    resultsContainer.appendChild(div);
    if (stopCodeBar.value == '') {
        resultsContainer.innerHTML = '';
        quickContainer.style.display = '';
        comeLeggere.style.display = '';
    }
});

function renderResults(results) {
    quickContainer.style.display = 'none';
    comeLeggere.style.display = 'none';
    if (results.length == 0) {
        resultsContainer.innerHTML = '<p>Nessun risultato trovato</p>';
        return;
    }

    results.forEach(item => {
        const div = document.createElement('div');
        const a = document.createElement('a');
        a.setAttribute('class', 'bianco');
        a.setAttribute('href', `fermata.html?code=${item.code}&name=${item.name}`);
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
        .filter(item => item.name.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
            const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
            const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return 0;
        });
    renderResults(filtered);
}