const searchBar = document.getElementById('searchBar');
const stopCodeBar = document.getElementById('stopCodeBar');
const resultsContainer = document.getElementById('searchResults');

let allresults = [];
window.onbeforeunload=searchBar.value="";
window.onbeforeunload=stopCodeBar.value="";

const url = 'https://setaapi.serverissimo.freeddns.org/stoplist';
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
    const searchTerm = searchBar.value.toLowerCase();
    const filtered = allresults.filter(item =>
        item.fermata.toLowerCase().includes(searchTerm)
    );
    renderresults(filtered);
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
        const url = `fermata.html?code=${encodeURIComponent(code)}&name=${encodeURIComponent(code)}`;
        parent.location=url;
    });

    searchResultsContainer.appendChild(div);
    if (stopCodeBar.value == '') {
        resultsContainer.innerHTML='';
        warning.innerHTML = `
        Attenzione! Se la palina non riporta MO all'inizio del codice, il MO viene inserito in automatico!
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
        const url = `fermata.html?code=${encodeURIComponent(item.valore)}&name=${encodeURIComponent(item.fermata)}`;
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
            const url = `fermata.html?code=${encodeURIComponent(item.valore)}&name=${encodeURIComponent(item.fermata)}`;
            parent.location=url;
        });

        searchResultsContainer.appendChild(div);
    });
}