const MEZZI_API_ENDPOINT = "https://ertpl-api.vichingo455.com/mezzi";

async function getApiUrl() {
    const res = await fetch(MEZZI_API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const searchBar = document.getElementById('searchBar');
const productsContainer = document.getElementById('bus-container');
const buttons = document.getElementById('buttons');

let allProducts = [];
window.onbeforeunload = searchBar.value = "";

getApiUrl().then(url => {
    fetch(url + "/list/SETA")
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
            return response.json();
        })
        .then(data => {
            allProducts = data;
        })
        .catch(error => console.error('Errore nel caricamento dei dati:', error));
});

searchBar.addEventListener('input', () => {
    if (searchBar.value == '') {
        productsContainer.innerHTML = '';
        buttons.style.display = "";
        return;
    }
    buttons.style.display = "none";
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
            <a href="${bus.page_link}">
                <h3>${bus.number}</h3>
                <p>${bus.model}</p>
                <p>${bus.sector}</p>
            </a>
        `;
        productsContainer.appendChild(div);
    });
}