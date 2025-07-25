const searchBar = document.getElementById('searchBar');
const resultsContainer = document.getElementById('searchResults');

let allresults = [];
window.onbeforeunload=searchBar.value="";

const url = 'http://setaapi.serverissimo.freeddns.org/stoplist';
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
            window.open(url, '_blank');
        });

        searchResultsContainer.appendChild(div);
    });
}