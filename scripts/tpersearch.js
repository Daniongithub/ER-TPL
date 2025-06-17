const searchBar = document.getElementById('searchBar');
const productsContainer = document.getElementById('bus-container');
const buttons = document.getElementById('buttons');

let allProducts = [];
window.onbeforeunload=searchBar.value="";

const url = '/scripts/tperbus.json';
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
            <a href="/tper_menu/tperurb.html" class="button">Urbano</a>
            <a href="/tper_menu/tpersub.html" class="button">Suburbano</a>
            <a href="/tper_menu/tperext.html" class="button">Extraurbano</a>
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
                <p>${bus.settore}</p>
            </a>
        `;
        productsContainer.appendChild(div);
    });
}