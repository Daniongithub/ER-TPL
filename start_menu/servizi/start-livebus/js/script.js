const apiurl = 'https://startapi.serverissimo.freeddns.org/infobus/';
// Funzione per applicare il filtro su ogni colonna
function applyFilter() {
    const filterZona = document.getElementById('filterZona').value.toLowerCase();
    const filterLinea = document.getElementById('filterLinea').value.toLowerCase();
    const filterVeicolo = document.getElementById('filterVeicolo').value.toLowerCase();
    const filterCodiceFermata = document.getElementById('filterCodiceFermata').value.toLowerCase();
    
    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tr');

    rows.forEach((row, index) => {
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
  function numeromezzi() {
    const table = document.getElementById('tabella');
    //let nummezzi = table.tBodies[0].rows.length;
    const rows = table.querySelectorAll('tbody tr');
    const visibili = Array.from(rows).filter(row => {
      return window.getComputedStyle(row).display !== 'none';
    });
    document.getElementById('nummezzi').innerHTML = visibili.length;
  }
  fetchData(); // Primo fetch
  // Fetch dei dati ogni 30 secondi (30 000 millisecondi)
  timer = setInterval(() => {
        fetchData();
  }, 30000);
  // Fetch dei dati e creazione della tabella
  function fetchData() {
    fetch(apiurl)
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('data-container');
      container.innerHTML = ''; // Svuota il div prima di aggiungere la tabella

      // Crea la tabella
      const table = document.createElement('table');

      // Aggiungi l'intestazione della tabella
      let th = document.createElement('th');
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      th.innerHTML='Zona';
      thead.appendChild(th);
      th = document.createElement('th');
      th.innerHTML='Linea';
      thead.appendChild(th);
      th = document.createElement('th');
      th.innerHTML='Fermata';
      thead.appendChild(th);
      th = document.createElement('th');
      th.innerHTML='Codice fermata';
      thead.appendChild(th);
      th = document.createElement('th');
      th.innerHTML='Veicolo';
      thead.appendChild(th);
      th = document.createElement('th');
      th.innerHTML='Ultimo aggiornamento';
      thead.appendChild(th);
      table.appendChild(thead);

      // Aggiungi i dati alla tabella
      data.forEach(row => {
        const rowt = document.createElement('tr');
        row.forEach(cellData => {
          if(cellData!=""){
            const cell = document.createElement('td');
            cell.innerHTML = cellData;
            rowt.appendChild(cell);
          }
        });
        tbody.appendChild(rowt);
      });
      table.appendChild(tbody);
      // Aggiungi la tabella alla pagina
      container.appendChild(table);
      table.id = "tabella";
      // Preserva il filtro
      applyFilter();
      numeromezzi();
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
    numeromezzi();
  }

  setInterval(updateClock, 1000);
  updateClock();
// Applica il filtro ogni volta che l'utente digita
document.getElementById('filterZona').addEventListener('input', applyFilter);
document.getElementById('filterLinea').addEventListener('input', applyFilter);
document.getElementById('filterVeicolo').addEventListener('input', applyFilter);
document.getElementById('filterCodiceFermata').addEventListener('input', applyFilter);
document.getElementById('filterZona').addEventListener('input', numeromezzi);
document.getElementById('filterLinea').addEventListener('input', numeromezzi);
document.getElementById('filterVeicolo').addEventListener('input', numeromezzi);
document.getElementById('filterCodiceFermata').addEventListener('input', numeromezzi);