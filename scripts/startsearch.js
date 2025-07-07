const searchBar = document.getElementById('searchBar');
const productsContainer = document.getElementById('bus-container');
const buttons = document.getElementById('buttons');

let allProducts = [];
window.onbeforeunload=searchBar.value="";

const url = '/scripts/startbus.json';
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
        <div class="verticale">
            <a href="/start_menu/starturbano.html" class="button">Urbano</a>
            <a href="/start_menu/startsub.html" class="button">Suburbano</a>
            <a href="/start_menu/startextra.html" class="button">Extraurbano</a>
        </div>
        <div style="height: 35px;"></div>
        <div class="verticale">
            <a class="gbutton" href="/start_menu/servizi/start-livebus/">Autobus in tempo reale</a>
            <a class="gbutton" href="/start_menu/servizi/start-corsesopp/">Corse non garantite</a>
            <a class="gbutton" href="/startravenna_bus/listamezzi.html">Lista mezzi</a>
            <a class="gbutton" href="/start_menu/servizi/start-fermatebus/">Visualizzatore fermate</a>
        </div>
        <p>I servizi "Autobus in tempo reale", "Corse non garantite" e "Visualizzatore fermate" fanno uso di dati forniti dai servizi di Start Romagna. <br>L'unica cosa che facciamo è ottenerli e impaginarli in maniera differente dai siti di Start per esigenze nostre.</p>
        `;
        return;
    }
    buttons.innerHTML = ' ';
        const searchTerm = searchBar.value.toLowerCase();
        const filtered = allProducts.filter(bus =>
            bus.matricola.toLowerCase().includes(searchTerm)
        );
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