const searchBar = document.getElementById('searchBar');
const productsContainer = document.getElementById('bus-container');
let allProducts = [];

const url = '/scripts/bus.json'; // cambia con il tuo URL

window.onbeforeunload=searchBar.value="";
fetch(url)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        allProducts = data;
        //renderProducts(allProducts);
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));

searchBar.addEventListener('input', () => {
    if (searchBar.value == '') {
        productsContainer.innerHTML = '';
        return;
    }
    const searchTerm = searchBar.value.toLowerCase();
    const filtered = allProducts.filter(bus =>
        bus.matricola.toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
});
searchBar.addEventListener('click', () => {
    if (searchBar.value == '') {
        productsContainer.innerHTML = '';
        return;
    }
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
            <a href="${bus.link}"><h3>${bus.matricola}</h3></a>
            <a href="${bus.linksettore}"><p>${bus.compagnia} - ${bus.settore}</p></a>
            <a href="${bus.linkmodello}"><p>${bus.modello}</p></a>
        `;
        productsContainer.appendChild(div);
    });
}