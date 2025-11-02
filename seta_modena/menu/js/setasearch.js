const searchBar = document.getElementById('searchBar');
const productsContainer = document.getElementById('bus-container');
const buttons = document.getElementById('buttons');

let allProducts = [];
window.onbeforeunload=searchBar.value="";

const url = '/seta_modena/menu/js/setabus.json';
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
        productsContainer.innerHTML = '';
        buttons.style.display="";
        return;
    }
    buttons.style.display="none";
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