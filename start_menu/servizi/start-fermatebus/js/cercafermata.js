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
            window.open(url, "_blank");
        });

        searchResultsContainer.appendChild(div);
    });
}

function getFermatadaBreve(codbreve){
    const middle = String(codbreve).padStart(4, "0");
    return `7${middle}0`;
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

searchBar.addEventListener('input', function() {
    const query = searchBar.value;
    let filteredOptions;

    if (currentSelectedOption !== "ra") {
        filteredOptions = filterOptions(query, allOptions);
    } else {
        //placeholder: qui metteremo il filtro dettagliato per "ra"
        filteredOptions = filterOptions(query, allOptions); 
        //TODO: implementare filtro "ra" custom
    }

    populateSearchResults(filteredOptions, currentSelectedOption);
});


document.getElementById('bacino').addEventListener('change', function(event) {
    const selectedOption = event.target.value;
    currentSelectedOption = selectedOption;

    //const radiobuttons = document.getElementById('radios');
    const ricerca = document.getElementById('ricerca');
    ricerca.removeAttribute('style');

    document.getElementById('searchBar').value = "";
    
    if(selectedOption == "n"){
        ricerca.setAttribute("style", "display: none;");
        //radiobuttons.setAttribute("style", "display: none;");
        allOptions = [];
        document.getElementById('searchResults').innerHTML = '';
        return;
    }
    /*else if(selectedOption == "ra"){
        radiobuttons.removeAttribute('style')
    }*/

    if(selectedOption != "n"){
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '<p>Caricamento lista fermate in corso...</p>';

        fetch(`https://api.vichingo455.freeddns.org/fermateapi/bacino?selectedOption=${selectedOption}`)
        .then(res => res.json())
        .then(data => {
            allOptions = data;
            populateSearchResults(allOptions, selectedOption);
        })
        .catch(err => {
            resultsContainer.innerHTML = '<p>Errore nel caricamento delle fermate.</p>';
            console.error('Errore:', err);
        });
    }
});