const searchBar = document.getElementById('searchBar');
const productsContainer = document.getElementById('bus-container');
const buttons = document.getElementById('buttons');

let allProducts = [];
window.onbeforeunload=searchBar.value="";

const url = '/scripts/setabus.json';
fetch(url)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        allProducts = data;
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));

searchBar.addEventListener('input', () => {
    if (searchBar.value == '') {
        productsContainer.innerHTML = ' ';
        buttons.innerHTML = `
        <div>
            <a href="/seta_menu/setaurbano.html" class="button">Urbano</a>
            <a href="/seta_menu/setasub.html" class="button">Suburbano</a>
            <a href="/seta_menu/setaextra.html" class="button">Extraurbano</a>
            <a href="/seta_menu/setafilobus.html" class="button">Filobus</a>
            <a href="/setamodena_bus/minibus/sprinter.html" class="button">Minibus</a>
            <div style="height: 8px;"></div>
            <a href="/setamodena_bus/servizio.html" class="button">Veicoli di servizio</a>
            <div style="height: 8px;"></div>
            <a href="/seta_menu/radiatimenu.html" class="rbutton">Veicoli radiati</a>
        </div>
        <div style="height: 35px;"></div>
        <div>
            <a class="gbutton" href="atcmlalinea.html">Archivio La Linea ATCM</a>
            <a class="gbutton" href="setastreetview.html">Storico StreetView</a>
        </div>
        <div style="height: 5px;"></div>
        <h2>Servizi SETA Modena:</h2>
        <div>
            <a class="gbutton" href="cercaorario/index.html">Orari in tempo reale</a>
            <a class="gbutton" href="businservizio/index.html">Monitor autobus in servizio</a>
            <a class="gbutton" href="percorsi/index.html">Percorsi</a>
        </div>
        `;
        return;
    }
    buttons.innerHTML = ' ';
    const searchTerm = searchBar.value.toLowerCase();
    const filtered = allProducts.filter(bus => bus.matricola.toLowerCase().includes(searchTerm))
    .sort((a, b) => {
        const aStartsWith = a.matricola.toLowerCase().startsWith(searchTerm);
        const bStartsWith = b.matricola.toLowerCase().startsWith(searchTerm);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return 0; // keep original order if both or neither match at start
    });
    renderProducts(filtered);
});

function renderProducts(products) {
    productsContainer.innerHTML = '';
    products.forEach(bus => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <a href="${bus.link}">
                <h3>${bus.matricola}</h3>
                <p>${bus.modello}</p>
                <p>${bus.settore}</p>
            </a>
        `;
        productsContainer.appendChild(div);
    });
}