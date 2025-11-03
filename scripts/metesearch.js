const searchBar = document.getElementById('searchBar');
const productsContainer = document.getElementById('bus-container');
const buttons = document.getElementById('buttons');

let allProducts = [];
window.onbeforeunload=searchBar.value="";

const url = '/scripts/metebus.json';
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
            <a href="/ravenna_privatibus/gamberini.html" class="blue button">Gamberini</a>
            <a href="/ravenna_privatibus/pollini.html" class="blue button">Pollini</a>
            <a href="/ravenna_privatibus/zaganelli.html" class="blue button">Zaganelli</a>
			<a href="/ravenna_privatibus/riolo.html" class="blue button">C.T.R.T.</a>
        </div>
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
                <p>${bus.vettore}</p>
            </a>
        `;
        productsContainer.appendChild(div);
    });
}
