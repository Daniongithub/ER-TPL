const API_ENDPOINT = "https://ertpl-api.vercel.app/seta";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}

const searchBar = document.getElementById('searchBar');
const stopCodeBar = document.getElementById('stopCodeBar');
const resultsContainer = document.getElementById('searchResults');
const comeLeggere = document.getElementById('comeleggere-p');

var searching = false;
var oldTerm;
var allresults = false;

//const url = 'https://setaapi.serverissimo.freeddns.org/stopcodesarchive';
getApiUrl().then(url => {
fetch(url + "/stopcodesarchive")
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        allresults = data;
        if(searching){
            search(oldTerm);
        }
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));})


searchBar.addEventListener('input', () => {
    if (searchBar.value == '') {
        resultsContainer.innerHTML=`
            <h3 style="margin-bottom:4px;">Fermate rapide:</h3>
            <a href="/seta_modena/servizi/cercaorario/altrecorsie.html?location=STAZIONE FS" class="bianco"><div class="search-result"><h3>Autostazione</h3></div></a>
            <a href="/seta_modena/servizi/cercaorario/altrecorsie.html?location=MODENA AUTOSTAZIONE" class="bianco"><div class="search-result"><h3>Stazione FS</h3></div></a>
            <a href="/seta_modena/servizi/cercaorario/altrecorsie.html?location=GARIBALDI" class="bianco"><div class="search-result"><h3>Largo Garibaldi</h3></div></a>
        `;
        comeLeggere.innerHTML = `
            <a href="comeleggere.html" style="color: white;">Come leggere il codice fermata.</a>
        `;
    }else{
        const searchTerm = searchBar.value.toLowerCase();
        search(searchTerm);
    }
});

stopCodeBar.addEventListener('input', () => {
    var code="MO"+stopCodeBar.value.toUpperCase();
    comeLeggere.innerHTML='';
    resultsContainer.innerHTML = '';

    const div = document.createElement('div');
    div.className = 'search-result';
    div.innerHTML = `
        <div>
            <h3>${code}</h3>
            <p>Codice fermata: ${code}</p>
        </div>
    `;

    div.addEventListener('click', () => {
        const url = `fermata.html?code=${code}&name=${code}`;
        parent.location=url;
    });

    resultsContainer.appendChild(div);
    if (stopCodeBar.value == '') {
        resultsContainer.innerHTML=`
            <h3 style="margin-bottom:4px;">Fermate rapide:</h3>
            <a href="" class="bianco"><div class="search-result"><h3>Autostazione</h3></div></a>
            <a href="" class="bianco"><div class="search-result"><h3>Stazione FS</h3></div></a>
            <a href="" class="bianco"><div class="search-result"><h3>Largo Garibaldi</h3></div></a>
        `;
        comeLeggere.innerHTML = `
            <a href="comeleggere.html" style="color: white;">Come leggere il codice fermata.</a>
        `;
    }
});

function renderResults(results) {
    resultsContainer.innerHTML = '';
    comeLeggere.innerHTML='';
    if (results.length == 0) {
        resultsContainer.innerHTML = '<p>Nessun risultato trovato</p>';
        return;
    }

    results.forEach(item => {
        const div = document.createElement('div');
        const a = document.createElement('a');
        a.setAttribute('class','bianco');
        a.setAttribute('href',`fermata.html?code=${item.valore}&name=${item.fermata}`);
        div.className = 'search-result';
        div.innerHTML = `
            <div>
                <h3>${item.fermata}</h3>
                <p>Codice fermata: ${item.valore}</p>
            </div>
        `;
        a.appendChild(div);

        resultsContainer.appendChild(a);
    });
}

function search(searchTerm){
    //Filters taking first elements as the one starting with the letters in the search term
    searching = true;
    oldTerm = searchTerm;
    const filtered = allresults
    .filter(item => item.fermata.toLowerCase().includes(searchTerm))
    .sort((a, b) => {
        const aStartsWith = a.fermata.toLowerCase().startsWith(searchTerm);
        const bStartsWith = b.fermata.toLowerCase().startsWith(searchTerm);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return 0;
    });
    renderResults(filtered);
}