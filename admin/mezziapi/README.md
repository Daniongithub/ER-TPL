# ER-TPL Mezzi

Pannello Bootstrap statico, disponibile in `/admin/mezziapi/`. Le colonne e i tipi
vengono caricati da `/listcols/{azienda}`; i dati da `/list/{azienda}`.

## Configurazione

`js/config.js` contiene i punti di integrazione:

- `apiEndpoint`: resolver HA `https://ertpl-api.vichingo455.com/mezzi`, come negli
  altri pannelli. Viene interrogato a ogni caricamento o scrittura; le risoluzioni
  contemporanee sono condivise. Non c'è un fallback fisso al server di test.
- `apiBaseUrl`: lasciare `null` in produzione. Per test manuali si può impostare
  `https://mezziapi.serverissimo.com`.
- `getToken`: collegare la propria funzione che restituisce il token senza il
  prefisso `Bearer`, anche tramite Promise. La generazione del token e il login
  sono intenzionalmente lasciati all'integrazione futura. In assenza del token le
  richieste di scrittura non partono; lettura e preparazione delle modifiche sono
  disponibili.

## Scritture

- POST `/add/{azienda}`: array di oggetti, anche per l'aggiunta singola. Il batch
  include entrambe le matricole estreme e copia gli altri campi. Le matricole già
  caricate vengono rifiutate prima dell'invio. Massimo 10000 mezzi per batch.
- PUT `/update/{azienda}`: un oggetto completo per ogni mezzo, in sequenza. Si
  conserva l'intero oggetto originale, inclusi campi null e campi non esposti da
  `listcols`, applicando i soli cambiamenti confermati. In caso di errore la
  sequenza si ferma e le bozze non salvate restano disponibili.
- DELETE `/delete/{azienda}`: array di matricole numeriche, dopo conferma nel
  pannello. La selezione si conserva tra pagine e filtri della stessa azienda.

Tutte le scritture hanno gli header `Content-Type: application/json` e
`Authorization: Bearer <token>`. Solo HTTP 200 con JSON `{"status":"OK"}` è un
successo. Gli altri esiti mostrano codice HTTP e body integrale come testo.
Le scritture non vengono ripetute automaticamente in caso di errore di rete.
Il pulsante Aggiorna ricarica la lista conservando le bozze non salvate.

La matricola è la chiave del PUT e non è modificabile inline. `updated_at` è
mostrato come metadato del server. `path_html` è il percorso modificabile;
`page_link` è il link derivato, mostrato in sola lettura.

Il tipo SQL determina il campo `last_seen` usato: `date` corrisponde a
`last_seen_date`, `datetime` a `last_seen_datetime`. Le GET verificate restituiscono
entrambi come `GG-MM-AAAA` e `GG-MM-AAAA HH:mm`. I controlli data usano il formato
del browser; alla modifica si aggiornano entrambe le rappresentazioni JSON senza
conversioni di fuso orario. I valori originali non modificati restano identici.
