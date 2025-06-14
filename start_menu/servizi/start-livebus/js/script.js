// Funzione per applicare il filtro su ogni colonna
function applyFilter() {
    const filterZona = document.getElementById('filterZona').value.toLowerCase();
    const filterLinea = document.getElementById('filterLinea').value.toLowerCase();
    const filterVeicolo = document.getElementById('filterVeicolo').value.toLowerCase();
    const filterCodiceFermata = document.getElementById('filterCodiceFermata').value.toLowerCase();
    
    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tr');

    rows.forEach((row, index) => {
      // Non applicare il filtro sulla prima riga (intestazione)
      if (index === 0) return;

      const cells = row.getElementsByTagName('td');
      let match = true;

      // Verifica ogni cella rispetto al filtro per la colonna
      if (cells[0] && !cells[0].textContent.toLowerCase().includes(filterZona)) match = false;
      if (cells[1] && !cells[1].textContent.toLowerCase().includes(filterLinea)) match = false;
      if (cells[4] && !cells[4].textContent.toLowerCase().includes(filterVeicolo)) match = false;
      if (cells[3] && !cells[3].textContent.toLowerCase().includes(filterCodiceFermata)) match = false;

      // Mostra o nascondi la riga in base al filtro
      row.style.display = match ? '' : 'none';
    });
  }
  fetchData(); // Primo fetch
  // Fetch dei dati ogni 30 secondi (30 000 millisecondi)
  timer = setInterval(() => {
        fetchData();
  }, 30000);
  // Fetch dei dati e creazione della tabella
  function fetchData() {
    fetch('https://api.vichingo455.freeddns.org/infobus/')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('data-container');
      container.innerHTML = ''; // Svuota il div prima di aggiungere la tabella

      // Crea la tabella
      const table = document.createElement('table');

      // Aggiungi l'intestazione della tabella
      const header = table.createTHead();
      const headerRow = header.insertRow();
      headerRow.insertCell().textContent = 'Zona';
      headerRow.insertCell().textContent = 'Linea';
      headerRow.insertCell().textContent = 'Fermata';
      headerRow.insertCell().textContent = 'Codice Fermata';
      headerRow.insertCell().textContent = 'Veicolo';
      headerRow.insertCell().textContent = ' ';
      headerRow.insertCell().textContent = 'Ultimo Aggiornamento';

      // Aggiungi i dati alla tabella
      const tbody = table.createTBody();
      data.forEach(row => {
        const rowElement = tbody.insertRow();
        row.forEach(cellData => {
          const cell = rowElement.insertCell();
          cell.textContent = cellData;
        });
      });

      // Aggiungi la tabella alla pagina
      container.appendChild(table);
      // Preserva il filtro
      applyFilter();
    })
    .catch(err => {
      //console.error("Errore nel caricamento dati:", err);
      document.getElementById('data-container').innerHTML = `<p>Errore nel caricamento dei dati. Potrebbe essere un problema di rete, o un problema con la nostra API. Per favore <a href="#" onclick="fetchData()">riprova adesso</a> o riprova più tardi.</p>`;
    });
  }
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
  }
  function clearFilters() {
    // Pulisci tutti i filtri
    document.getElementById("filterZona").value = "";
    document.getElementById("filterLinea").value = "";
    document.getElementById("filterVeicolo").value = "";
    document.getElementById("filterCodiceFermata").value = "";
    // Esegui la funzione per applicare i filtri (per sicurezza)
    applyFilter();
  }

  setInterval(updateClock, 1000);
  updateClock();
// Applica il filtro ogni volta che l'utente digita
document.getElementById('filterZona').addEventListener('input', applyFilter);
document.getElementById('filterLinea').addEventListener('input', applyFilter);
document.getElementById('filterVeicolo').addEventListener('input', applyFilter);
document.getElementById('filterCodiceFermata').addEventListener('input', applyFilter);
