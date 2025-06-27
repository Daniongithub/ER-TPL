function loadJSON(file, callback) {
    fetch(file)
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => console.error('Errore nel caricare il file JSON:', error));
}

function populateSearchResults(results, selectedOption) {
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
                <h3>${item.nome}</h3>
                <p>Palina: ${item.palina}, Target ID: ${item.targetID}</p>
            </div>
        `;

        div.addEventListener('click', () => {
            const url = `fermata.html?palina=${encodeURIComponent(item.palina)}&targetID=${encodeURIComponent(item.targetID)}&selectedOption=${encodeURIComponent(selectedOption)}`;
            window.location.href = url;
        });

        searchResultsContainer.appendChild(div);
    });
}

function filterOptions(query, data) {
    const q = query.toLowerCase();
    return data.filter(item =>
        (item.nome || '').toLowerCase().includes(q) ||
        (item.palina || '').toLowerCase().includes(q) ||
        (item.targetID || '').toLowerCase().includes(q)
    );
}


let allOptions = [];
let currentSelectedOption = '';

const searchBar = document.getElementById('searchBar');
searchBar.addEventListener('input', function() {
    const query = searchBar.value;
    const filteredOptions = filterOptions(query, allOptions);
    populateSearchResults(filteredOptions, currentSelectedOption);
});

document.getElementById('bacino').addEventListener('change', function(event) {
    const selectedOption = event.target.value;
    currentSelectedOption = selectedOption;

    let file = '';
    switch (selectedOption) {
        case 'ra':
            file = 'js/fermate-ra.json';
            break;
        case 'rn':
            file = 'js/fermate-rn.json'; 
            break;
        case 'fc':
            file = 'js/fermate-fc.json';
            break;
        default:
            allOptions = [];
            document.getElementById('searchResults').innerHTML = '';
            return;
    }

    loadJSON(file, (data) => {
        allOptions = data;
        populateSearchResults(allOptions, currentSelectedOption);
    });
});
