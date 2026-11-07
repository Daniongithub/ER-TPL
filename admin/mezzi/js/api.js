window.MezziAPI = (() => {
    // Nomi SQL -> nomi JSON. path_html è scrivibile; page_link è derivato dal backend.
    const fields = Object.freeze({
        provincia: 'basin', matricola: 'number', targa: 'plate_num', modello: 'model',
        short_model: 'short_model', settore: 'sector', path_html: 'path_html',
        page_link: 'page_link', photo_path: 'photo_path', stato: 'status',
        pedana: 'ramp', has_aep: 'has_aep', updated_at: 'updated_at'
    });
    const companies = ['START', 'METE', 'SETA', 'TPER'];

    async function request(url, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' });
            return { status: response.status, ok: response.ok, body: await response.text() };
        } catch (error) {
            const detail = error.name === 'AbortError' ? 'Tempo di attesa scaduto.' : 'Errore di rete.';
            throw new Error(detail + (options.method ? ' Esito non verificabile: aggiorna la lista prima di riprovare.' : ' Riprova il caricamento.'));
        } finally {
            clearTimeout(timeout);
        }
    }

    async function readJSON(url) {
        const response = await request(url);
        const body = response.body;
        if (!response.ok) throw new Error('HTTP ' + response.status + '\n' + body);
        try {
            return JSON.parse(body);
        } catch {
            throw new Error('HTTP ' + response.status + '\nRisposta JSON non valida:\n' + body);
        }
    }

    function columnKey(column) {
        if (column.name === 'last_seen') {
            return /^date$/i.test(column.type) ? 'last_seen_date' : 'last_seen_datetime';
        }
        return fields[column.name] || column.name;
    }

    async function load(company) {
        const url = await getApiUrl();
        const [columns, result] = await Promise.all([
            readJSON(url + '/listcols/' + company), readJSON(url + '/list/' + company)
        ]);
        const rows = result === null ? [] : result;
        if (!Array.isArray(columns) || !columns.length || !columns.every(column => column && typeof column.name === 'string' && typeof column.type === 'string') || !columns.some(column => column.name === 'matricola')) {
            throw new Error('Formato delle colonne non valido.');
        }
        if (!Array.isArray(rows) || !rows.every(row => row && typeof row === 'object' && !Array.isArray(row) && row.number != null)) {
            throw new Error('Formato della lista mezzi non valido.');
        }
        return { columns, rows };
    }

    async function mutate(company, operation, body) {
        const methods = { add: 'POST', update: 'PUT', delete: 'DELETE' };
        const token = await getValidToken();
        if (!token) throw new Error('Errore di autenticazione, token non disponibile.');
        const url = await getApiUrl();
        const response = await request(url + '/' + operation + '/' + company, {
            method: methods[operation],
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(body)
        });
        const text = response.body;
        let result;
        try { result = JSON.parse(text); } catch { /* Mostra il body originale anche se non è JSON. */ }
        if (response.status !== 200 || !result || result.status !== 'OK') {
            throw new Error('HTTP ' + response.status + '\n' + text);
        }
    }

    return { companies, columnKey, load, mutate };
})();
