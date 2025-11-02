const searchBar = document.getElementById('searchBar');
const stopCodeBar = document.getElementById('stopCodeBar');
const resultsContainer = document.getElementById('searchResults');

let allresults = [];

const url = 'https://setaapi.serverissimo.freeddns.org/stopcodesarchive';
//const url='http://localhost:5001/stoplist';
fetch(url)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        allresults = data;
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));

searchBar.addEventListener('input', () => {
    const warning=document.getElementById('warning-mo');
    if (searchBar.value == '') {
        resultsContainer.innerHTML=`
            <h3 style="margin-bottom:4px;">Fermate rapide:</h3>
            <a href="/seta_menu/cercaorario/altrecorsie.html?location=STAZIONE FS" class="bianco"><div class="search-result"><h3>Autostazione</h3></div></a>
            <a href="/seta_menu/cercaorario/altrecorsie.html?location=MODENA AUTOSTAZIONE" class="bianco"><div class="search-result"><h3>Stazione FS</h3></div></a>
            <a href="/seta_menu/cercaorario/altrecorsie.html?location=GARIBALDI" class="bianco"><div class="search-result"><h3>Largo Garibaldi</h3></div></a>
        `;
        warning.innerHTML = `
            <p id="warning-mo"><a href="comeleggere.html" style="color: white;">Come leggere il codice fermata.</a></p>
        `;
    }else{
        const searchTerm = searchBar.value.toLowerCase();
        warning.innerHTML='';
        const filtered = allresults
        .filter(item => item.fermata.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
            const aStartsWith = a.fermata.toLowerCase().startsWith(searchTerm);
            const bStartsWith = b.fermata.toLowerCase().startsWith(searchTerm);
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return 0;
        });
        renderresults(filtered);
    }
});

stopCodeBar.addEventListener('input', () => {
    var code=stopCodeBar.value.toUpperCase();
    code="MO"+code;
    //renderresultscode(filtered);
    const searchResultsContainer = document.getElementById('searchResults');
    const warning=document.getElementById('warning-mo');
    warning.innerHTML='';
    searchResultsContainer.innerHTML = '';

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

    searchResultsContainer.appendChild(div);
    if (stopCodeBar.value == '') {
        resultsContainer.innerHTML=`
            <h3 style="margin-bottom:4px;">Fermate rapide:</h3>
            <a href="" class="bianco"><div class="search-result"><h3>Autostazione</h3></div></a>
            <a href="" class="bianco"><div class="search-result"><h3>Stazione FS</h3></div></a>
            <a href="" class="bianco"><div class="search-result"><h3>Largo Garibaldi</h3></div></a>
        `;
        warning.innerHTML = `
            <p id="warning-mo"><a href="comeleggere.html" style="color: white;">Come leggere il codice fermata.</a></p>
        `;
        return;
    }
});

function renderresultscode(results) {
    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = '';

    const div = document.createElement('div');
    div.className = 'search-result';
    div.innerHTML = `
        <div>
            <h3>${results.fermata}</h3>
            <p>Codice fermata: ${results.valore}</p>
        </div>
    `;

    div.addEventListener('click', () => {
        const url = `fermata.html?code=${item.valore}&name=${item.fermata}`;
        parent.location=url;
    });

    searchResultsContainer.appendChild(div);
}

function renderresults(results) {
    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = '';

    if (results.length === 0) {
        searchResultsContainer.innerHTML = '<p>Nessun risultato trovato</p>';
        return;
    }

    results.forEach(item => {
        const div = document.createElement('div');
        div.className = 'search-result';
        div.innerHTML = `
            <div>
                <h3>${item.fermata}</h3>
                <p>Codice fermata: ${item.valore}</p>
            </div>
        `;

        div.addEventListener('click', () => {
            const url = `fermata.html?code=${item.valore}&name=${item.fermata}`;
            parent.location=url;
        });

        searchResultsContainer.appendChild(div);
    });
}