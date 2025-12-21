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
        <div>
      <a href="/start_menu/starturbano.html" class="blue button">Urbano</a>
      <a href="/start_menu/startsub.html" class="blue button">Suburbano</a>
      <a href="/start_menu/startextra.html" class="blue button">Extraurbano</a>
    </div>
    <div>
      <h3>Ambito di Ravenna</h3>
      <a href="/ravenna_menu/mete.html" class="blue button">Privati METE S.p.A.</a>
      <a href="/ravenna_menu/articoli.html" class="green button">Articoli</a>
    </div>
    <hr class="solid">
    <h2>Servizi START Romagna</h2>
    <div>
      <a class="green button" href="/start_menu/servizi/start-livebus/">Autobus in tempo reale</a>
      <a class="green button" href="/start_menu/servizi/start-corsesopp/">Corse non garantite</a>
      <a class="green button" href="/start_bus/listamezzi.html">Lista mezzi</a>
      <a class="green button" href="/start_menu/servizi/start-fermatebus/">Visualizzatore fermate</a>
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