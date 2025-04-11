        const searchBar = document.getElementById('searchBar');
        const productsContainer = document.getElementById('bus-container');
        const buttons = document.getElementById('buttons');

        let allProducts = [];

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
                    <h3>Oppure sfoglia una categoria</h3>
                    <a href="/seta_menu/setaurbano.html" class="button">Urbano</a>
                    <a href="/seta_menu/setasub.html" class="button">Suburbano</a>
                    <a href="/seta_menu/setaextra.html" class="button">Extraurbano</a>
                    <a href="/seta_menu/setafilobus.html" class="button">Filobus</a>
                    <a href="/setamodena_bus/minibus/sprinter.html" class="button">Minibus</a>
                </div>
                <div style="height: 35px;"></div>
                <div>
                    <a class="gbutton" href="atcmlalinea.html">Archivio La Linea ATCM</a>
                    <a class="gbutton" href="setastreetview.html">Storico StreetView</a>
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
                    <p>${bus.settore}</p>
                    <p>${bus.modello}</p>
                    </a>
                `;
                productsContainer.appendChild(div);
            });
        }