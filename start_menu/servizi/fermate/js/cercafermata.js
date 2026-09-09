// API source code: https://github.com/Daniongithub/startfermate-api

const API_ENDPOINT = "https://ertpl-api.vichingo455.com/startfermate";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    //return cfg.url;
    return "https://startapi.serverissimo.com"
}

const basinSelect = document.getElementById('basin-select')
const filtersContainer = document.getElementById('filters-container')
const nameButton = document.getElementById('name-button')
const longcodeButton = document.getElementById('longcode-button')
const shortcodeButton = document.getElementById('shortcode-button')
const searchBar = document.getElementById('search-bar')
const resultsContainer = document.getElementById('search-results')

let selectedBasin
let searchMethod
let stops

async function loadStops() {
    //Locks search if we need to get stops
    searchBar.disabled = 'true'
    searchBar.className = 'blocked'
    searchBar.style.display = ''
    //Default search by name
    searchByName()
    resultsContainer.style.display = 'block'
    resultsContainer.textContent = 'Caricamento lista fermate...'
    const baseUrl = await getApiUrl()
    fetch(baseUrl + "/static/stops/" + selectedBasin)
        .then(response => {
            if (!response.ok) { resultsContainer.textContent = "Errore nel caricamento lista fermate"; throw new Error("Errore nel caricamento lista fermate.") }
            return response.json()
        })
        .then(data => {
            stops = data
            searchBar.disabled = ''
            searchBar.className = ''
            resultsContainer.innerHTML = ''
            resultsContainer.style.display = 'none'
            searchBar.focus()
        })
}

//Detect basin selection and spawns buttons
basinSelect.addEventListener('change', async function (event) {
    selectedBasin = basinSelect.value

    filtersContainer.style.display = ''
    await loadStops()
    //Default search by name moved to loadStops
});

function searchByName() {
    searchMethod = "name"
    searchBar.style.display = ''
    searchBar.value = ''
    resultsContainer.innerHTML = ''
    nameButton.classList.add("selected")
    //Removes other buttons selection
    longcodeButton.classList.remove("selected")
    shortcodeButton.classList.remove("selected")
    searchBar.focus()
}

function searchByLongCode() {
    searchMethod = "longcode"
    searchBar.style.display = ''
    searchBar.value = ''
    resultsContainer.innerHTML = ''
    longcodeButton.classList.add("selected")
    //Removes other buttons selection
    nameButton.classList.remove("selected")
    shortcodeButton.classList.remove("selected")
    searchBar.focus()
}

function searchByShortCode() {
    searchMethod = "shortcode"
    searchBar.style.display = ''
    searchBar.value = ''
    resultsContainer.innerHTML = ''
    shortcodeButton.classList.add("selected")
    //Removes other buttons selection
    nameButton.classList.remove("selected")
    longcodeButton.classList.remove("selected")
    searchBar.focus()
}

searchBar.addEventListener('input', function (event) {
    if (searchBar.value == '') {
        resultsContainer.innerHTML = ''
        resultsContainer.style.display = 'none'
    } else {
        const searchTerm = searchBar.value.trim().toLowerCase();
        search(searchTerm);
    }
})

function search(searchTerm) {
    let results = []
    stops.forEach(stop => {
        switch (searchMethod) {
            case "name":
                if (stop.stop_name.toLowerCase().includes(searchTerm)) {
                    results.push(stop)
                }
                break
            case "longcode":
                if (stop.stop_code == searchTerm) {
                    results.push(stop)
                }
                break
            case "shortcode":
                if (searchTerm.length == 3) {
                    searchTerm = "700" + searchTerm + "0"
                } else {
                    searchTerm = "70" + searchTerm + "0"
                }
                if (stop.stop_code == searchTerm) {
                    results.push(stop)
                }
                break
        }
    });

    renderResults(results)
}

function renderResults(results) {
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'block'
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Nessun risultato trovato</p>';
        return;
    }

    results.forEach(item => {
        const div = document.createElement('div');
        const a = document.createElement('a');
        a.className = 'bianco';
        a.href = `fermata.html?code=${item.stop_code}&basin=${item.basin}`;
        a.target = `_blank`;
        div.className = 'search-result';
        div.innerHTML = `
            <div>
                <h3>${item.stop_name}</h3>
                <p>Codice fermata: ${item.stop_code}</p>
            </div>
        `;
        a.appendChild(div);

        resultsContainer.appendChild(a);
    });
}