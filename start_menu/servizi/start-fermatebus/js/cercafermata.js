// API source code: https://github.com/Daniongithub/startfermate-api

// New fallback system (HA)
const API_ENDPOINT = "https://ertpl-api.vercel.app/startfermate";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}

let allOptions = [];
let currentSelectedOption = '';

const searchBar = document.getElementById('searchBar');

function populateSearchResults(results, selectedOption) {
    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = '';

    if (results.length === 0 && searchBar.value !== "") {
        searchResultsContainer.innerHTML = '<p>Nessun risultato trovato</p>';
        return;
    }

    results.forEach(item => {
        const div = document.createElement('div');
        const url = `fermata.html?cod=${encodeURIComponent(item.palina)}&tID=${encodeURIComponent(item.targetID)}&prov=${encodeURIComponent(selectedOption)}`;
        div.className = 'search-result';
        div.innerHTML = `
            <a class="risultato" href="${url}" target="_blank">
                <h3>${item.nome}</h3>
                <p>Fermata: ${item.palina}</p>
            </a>
        `;
        searchResultsContainer.appendChild(div);
    });
}

function getFermatadaBreve(codice){
    const middle = String(codice).padStart(4, "0");
    return `7${middle}0`;
}

function filterOptions(query, data) {
    const q = query.toLowerCase();
    return data.filter(item =>
        (item.nome || '').toLowerCase().includes(q) ||
        (item.palina || '').toLowerCase().includes(q) /*||
        (item.targetID || '').toLowerCase().includes(q)*/
    );
}

function filtraTesto(query, data){
    const q = query.toLowerCase();
    return data
    .filter(item => (item.nome || '').toLowerCase().includes(q))
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
}

function filtraLungo(query, data){
    const q = query.toLowerCase();
    return data
    .filter(item => (item.palina || '').toLowerCase().includes(q))
    .sort((a, b) => (a.palina || '').localeCompare(b.palina || ''));
}

function filtraBreve(query, data){
    const cod = getFermatadaBreve(query);
    return filtraLungo(cod, data);
}

searchBar.addEventListener('input', function() {
    const query = searchBar.value;
    let filteredOptions;

    if (currentSelectedOption !== "ra") {
        filteredOptions = filterOptions(query, allOptions);
    } else {
        if (document.getElementById('text').checked){
            filteredOptions = filtraTesto(query, allOptions);
        }
        else if (document.getElementById('lungo').checked){
            filteredOptions = filtraLungo(query, allOptions);
        }
        else if (document.getElementById('breve').checked){
            filteredOptions = filtraBreve(query, allOptions);
        }
    }
    populateSearchResults(filteredOptions, currentSelectedOption);
});

const radios = document.querySelectorAll('#radios input[type="radio"]');
radios.forEach(radio => {
    radio.addEventListener('change', () => {
        searchBar.value = '';
        document.getElementById('searchResults').innerHTML = '';
    });
});

document.getElementById('bacino').addEventListener('change', function(event) {
    searchBar.setAttribute("disabled", "");
    getApiUrl().then(url => {
        const selectedOption = event.target.value;
        currentSelectedOption = selectedOption;

        const urlFermate = `${url}/bacino?prov=${selectedOption}`;

        const radiobuttons = document.getElementById('radios');
        const ricerca = document.getElementById('ricerca');
        ricerca.removeAttribute('style');

        document.getElementById('searchBar').value = "";
        
        if(selectedOption == "n"){
            ricerca.setAttribute("style", "display: none;");
            radiobuttons.setAttribute("style", "display: none;");
            searchBar.setAttribute("disabled", "");
            allOptions = [];
            document.getElementById('searchResults').innerHTML = '';
            return;
        }
        else if(selectedOption == "ra"){
            radiobuttons.removeAttribute('style')
        }

        if(selectedOption != "n"){
            const resultsContainer = document.getElementById('searchResults');
            resultsContainer.innerHTML = '<p>Caricamento lista fermate in corso...</p>';
            if(selectedOption != "ra"){
                radiobuttons.setAttribute("style", "display: none !important;");
            }
            fetch(urlFermate)
            .then(res => res.json())
            .then(data => {
                allOptions = data;
                populateSearchResults(allOptions, selectedOption);
                searchBar.removeAttribute("disabled");
            })
            .catch(err => {
                resultsContainer.innerHTML = '<p>Errore nel caricamento delle fermate.</p>';
                console.error('Errore:', err);
            });
        }
    });
});