const searchBar = document.getElementById('searchBar');
        const productsContainer = document.getElementById('bus-container');
        let allProducts = [];

        const url = 'bus.json'; // cambia con il tuo URL

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

        function renderProducts(products) {
            productsContainer.innerHTML = '';
            products.forEach(bus => {
                const div = document.createElement('div');
                div.className = 'product-card';
                div.innerHTML = `
                    <a href="${bus.link}">
                    <h3>${bus.matricola}</h3>
                    <p>${bus.compagnia} - ${bus.settore}</p>
                    <p>${bus.modello}</p>
                    </a>
                `;
                productsContainer.appendChild(div);
            });
        }