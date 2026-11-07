const API_ENDPOINT = 'https://ertpl-api.vichingo455.com/mezzi';
async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

function getValidToken() {
    const token = localStorage.getItem('access_token');
    const expiry = Number(localStorage.getItem('token_expiry'));
    if (!token || !Number.isFinite(expiry) || Date.now() >= expiry) {
        return null;
    }
    return token;
}

function checkAuth() {
    if (!getValidToken()) {
        redirectToLogin();
        return false;
    }
    document.getElementById('loading-container').classList.add('d-none');
    document.getElementById('page-container').classList.remove('d-none');
    return true;
}

const api = window.MezziAPI;
const collator = new Intl.Collator('it', { numeric: true, sensitivity: 'base' });
const states = new Map(api.companies.map(company => [company, {
    company, columns: [], rows: [], loaded: false, loading: false, stale: false,
    error: '', edits: new Map(), selected: new Set(), query: '', page: 0,
    sort: 'number', direction: 1
}]));

let currentCompany = 'START';
let busy = false;
let disabledControls = [];
let addContext = null;
let deleteContext = null;
const activeState = () => states.get(currentCompany);

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function button(text, className, action) {
    const node = element('button', 'btn ' + className, text);
    node.type = 'button';
    node.disabled = busy;
    node.addEventListener('click', action);
    return node;
}

function message(text, type = 'danger') {
    const container = document.getElementById('page-message');
    container.className = 'alert alert-' + type + ' request-error';
    container.textContent = text;
    container.setAttribute('role', type === 'danger' ? 'alert' : 'status');
}

function formError(id, text = '') {
    document.getElementById(id).textContent = text;
    document.getElementById(id).classList.toggle('d-none', !text);
}

function editable(column) {
    return !['matricola', 'updated_at', 'page_link'].includes(column.name);
}

function enumValues(type) {
    return Array.from(type.matchAll(/'((?:[^'\\]|\\.|'')*)'/g), match => match[1].replace(/''/g, "'").replace(/\\'/g, "'"));
}

function dateInputValue(value, withTime) {
    if (!value) return '';
    const text = String(value);
    const italian = /^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(text);
    const iso = italian ? italian[3] + '-' + italian[2] + '-' + italian[1] + 'T' + (italian[4] || '00') + ':' + (italian[5] || '00') + ':' + (italian[6] || '00') : text.replace(' ', 'T');
    return iso.slice(0, withTime ? 19 : 10);
}

function createControl(column, value, id, adding = false) {
    const type = column.type.toLowerCase();
    let control;
    if (type.startsWith('enum(') || /^tinyint\(1\)/.test(type)) {
        control = element('select', 'form-select form-select-sm');
        const options = type.startsWith('enum(')
            ? [['__null__', 'Non impostato'], ...enumValues(column.type).map(item => [item, item || '(vuoto)'])]
            : [['__null__', 'Non impostato'], ['true', 'Sì'], ['false', 'No']];
        for (const [key, label] of options) {
            const option = element('option', '', label);
            option.value = key;
            control.appendChild(option);
        }
        control.value = value == null ? '__null__' : String(/^tinyint\(1\)/.test(type) ? Boolean(value) : value);
    } else {
        control = element('input', 'form-control form-control-sm');
        if (/^(date|datetime|timestamp)\b/.test(type)) {
            const withTime = !/^date$/.test(type);
            control.type = withTime ? 'datetime-local' : 'date';
            control.step = withTime ? '60' : '1';
            control.classList.add('date-control');
            control.value = dateInputValue(value, withTime).slice(0, withTime ? 16 : 10);
        } else if (/^(tinyint|smallint|mediumint|int|bigint|decimal|float|double)\b/.test(type)) {
            control.type = 'number';
            control.step = /^(decimal|float|double)/.test(type) ? 'any' : '1';
            control.value = value == null ? '' : String(value);
        } else {
            control.type = 'text';
            control.value = value == null ? '' : String(value);
            const varchar = /^(?:var)?char\((\d+)\)/.exec(type);
            if (varchar) control.maxLength = Number(varchar[1]);
        }
    }
    control.id = id;
    control.name = api.columnKey(column);
    control.setAttribute('aria-label', column.name);
    control.title = column.name + ' · ' + column.type;
    control.dataset.column = column.name;
    if (column.name === 'matricola') {
        control.required = true;
        control.min = '0';
        control.max = '2147483647';
    }
    if (adding) control.classList.remove('form-control-sm', 'form-select-sm');
    return control;
}

function readControl(column, control) {
    if (!control.reportValidity()) throw new Error('Controlla il campo ' + column.name + '.');
    const raw = control.value;
    const type = column.type.toLowerCase();
    if (control.tagName === 'SELECT') {
        if (raw === '__null__') return null;
        return /^tinyint\(1\)/.test(type) ? raw === 'true' : raw;
    }
    if (column.name === 'matricola') {
        if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) > 2147483647) {
            throw new Error('La matricola deve essere un intero tra 0 e 2147483647.');
        }
        return String(Number(raw));
    }
    if (raw === '') return null;
    if (control.type === 'number') {
        const number = Number(raw);
        if (!Number.isFinite(number) || (control.step === '1' && !Number.isSafeInteger(number))) {
            throw new Error('Valore numerico non valido per ' + column.name + '.');
        }
        return number;
    }
    if (control.type === 'date' || control.type === 'datetime-local') {
        const [date, time] = raw.split('T');
        const [year, month, day] = date.split('-');
        return day + '-' + month + '-' + year + (time ? ' ' + time : '');
    }
    return raw;
}

function applyValue(record, column, value) {
    record[api.columnKey(column)] = value;
    if (column.name === 'last_seen') {
        record.last_seen_date = value ? value.slice(0, 10) : null;
        record.last_seen_datetime = value ? value + (/^date$/i.test(column.type) ? ' 00:00' : '') : null;
    }
}

function filteredRows(state) {
    const query = state.query.trim().toLocaleLowerCase('it');
    const rows = state.rows.filter(row => !query || Object.values(row).some(value => value != null && String(value).toLocaleLowerCase('it').includes(query)));
    rows.sort((a, b) => collator.compare(String(a[state.sort] ?? ''), String(b[state.sort] ?? '')) * state.direction);
    return rows;
}

function visibleRows(state) {
    return filteredRows(state);
}

function updateToolbar() {
    const state = activeState();
    const unavailable = busy || state.loading || !state.loaded || state.stale;
    document.getElementById('table-title').textContent = 'Mezzi ' + state.company;
    document.getElementById('add-button').disabled = unavailable;
    document.getElementById('batch-button').disabled = unavailable;
    document.getElementById('delete-button').disabled = unavailable || !state.selected.size;
    document.getElementById('save-button').disabled = unavailable || !state.edits.size;
    document.getElementById('save-button').textContent = 'Salva modifiche' + (state.edits.size ? ' (' + state.edits.size + ')' : '');
    document.getElementById('delete-button').textContent = 'Rimuovi selezionati' + (state.selected.size ? ' (' + state.selected.size + ')' : '');
    document.getElementById('reload-button').disabled = busy || state.loading;
    document.getElementById('reload-button').title = state.edits.size ? 'Aggiorna i dati dal server conservando le modifiche non salvate.' : '';
    document.getElementById('search-input').disabled = busy || !state.loaded;
    for (const tab of document.querySelectorAll('#company-tabs button')) tab.disabled = busy;
    const count = filteredRows(state).length;
    document.getElementById('table-summary').textContent = state.loaded ? count + ' di ' + state.rows.length + ' mezzi · ' + state.selected.size + ' selezionati' : '';
}

function setBusy(value) {
    busy = value;
    for (const state of states.values()) document.getElementById('panel-' + state.company).setAttribute('aria-busy', String(value || state.loading));
    if (value) {
        disabledControls = Array.from(document.querySelectorAll('#company-panels button, #company-panels input, #company-panels select'), control => [control, control.disabled]);
        for (const [control] of disabledControls) control.disabled = true;
    } else {
        for (const [control, disabled] of disabledControls) control.disabled = disabled;
        disabledControls = [];
    }
    updateToolbar();
}

function displayValue(cell, key, value) {
    if (value == null) {
        cell.appendChild(element('span', 'text-body-secondary', '—'));
    } else if (typeof value === 'boolean') {
        cell.textContent = value ? 'Sì' : 'No';
    } else if (['page_link', 'path_html', 'photo_path'].includes(key) && value) {
        let url;
        try { url = new URL(String(value), window.location.href); } catch { cell.textContent = String(value); return; }
        if (['http:', 'https:'].includes(url.protocol)) {
            const link = element('a', '', String(value));
            link.href = url.href;
            link.target = '_blank';
            cell.appendChild(link);
        } else cell.textContent = String(value);
    } else cell.textContent = String(value);
}

function render(state) {
    const panel = document.getElementById('panel-' + state.company);
    panel.replaceChildren();
    panel.setAttribute('aria-busy', String(state.loading || busy));
    if (state.loading) {
        const loading = element('div', 'text-center p-5');
        loading.setAttribute('role', 'status');
        const spinner = element('span', 'spinner-border me-2');
        spinner.setAttribute('aria-hidden', 'true');
        loading.append(spinner, document.createTextNode('Caricamento mezzi ' + state.company + '…'));
        panel.appendChild(loading);
    } else {
        if (state.error) {
            panel.appendChild(element('div', 'alert alert-danger request-error', state.error));
            panel.appendChild(button('Riprova caricamento', 'btn-secondary mb-2', () => loadCompany(state)));
        }
        if (state.loaded) renderTable(state, panel);
    }
    if (state.company === currentCompany) updateToolbar();
}

function renderTable(state, panel) {
    const visible = visibleRows(state);
    const container = element('div', 'table-responsive vehicles-table-container');
    const table = element('table', 'table table-striped table-hover vehicles-table mb-0');
    const thead = element('thead');
    const trhead = element('tr');
    const selectionHeader = element('th', 'selection-cell bg-secondary bg-opacity-50');
    selectionHeader.scope = 'col';
    const selectAll = element('input', 'form-check-input');
    selectAll.type = 'checkbox';
    selectAll.checked = visible.length > 0 && visible.every(row => state.selected.has(String(row.number)));
    selectAll.indeterminate = !selectAll.checked && visible.some(row => state.selected.has(String(row.number)));
    selectAll.disabled = busy || state.stale;
    selectAll.addEventListener('change', () => {
        for (const row of visible) {
            if (selectAll.checked) state.selected.add(String(row.number));
            else state.selected.delete(String(row.number));
        }
        render(state);
    });
    selectionHeader.appendChild(selectAll);
    trhead.appendChild(selectionHeader);
    const columns = [...state.columns];
    for (const column of columns) {
        const th = element('th');
        th.classList.add("bg-secondary", "bg-opacity-50")
        th.scope = 'col';
        const key = api.columnKey(column);
        th.setAttribute('aria-sort', state.sort === key ? (state.direction === 1 ? 'ascending' : 'descending') : 'none');
        const sort = button(column.name + (state.sort === key ? (state.direction === 1 ? ' ↑' : ' ↓') : ''), 'border-0 p-0 fw-bold text-body text-nowrap', () => {
            state.direction = state.sort === key ? -state.direction : 1;
            state.sort = key;
            render(state);
        });
        const pd = document.createElement('p');
        pd.classList.add("mb-0", "pe-2", "p-0", "opacity-50", "fw-normal")
        pd.textContent = column.type.includes("enum") ? column.type.replaceAll(",", ", ") : column.type;
        th.append(sort, pd);
        trhead.appendChild(th);
    }
    thead.appendChild(trhead)
    table.appendChild(thead)
    const body = table.createTBody();
    if (!visible.length) {
        const cell = body.insertRow().insertCell();
        cell.colSpan = columns.length + 2;
        cell.className = 'text-center p-4';
        cell.textContent = state.rows.length ? 'Nessun mezzo corrisponde alla ricerca.' : 'Nessun mezzo registrato.';
    }
    for (const record of visible) {
        const number = String(record.number);
        const edit = state.edits.get(number);
        const row = body.insertRow();
        const selection = row.insertCell();
        selection.className = 'selection-cell';
        const checkbox = element('input', 'form-check-input');
        checkbox.type = 'checkbox';
        checkbox.checked = state.selected.has(number);
        checkbox.disabled = busy || state.stale;
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) state.selected.add(number);
            else state.selected.delete(number);
            render(state);
        });
        selection.appendChild(checkbox);
        for (const column of columns) {
            const cell = row.insertCell();
            const key = api.columnKey(column);
            if (edit && editable(column)) {
                const control = createControl(column, edit.original[key], 'edit-' + state.company + '-' + number + '-' + column.name);
                if (edit.values.has(column.name)) control.value = edit.values.get(column.name);
                control.disabled = busy || state.stale;
                control.addEventListener('input', () => edit.values.set(column.name, control.value));
                control.addEventListener('change', () => edit.values.set(column.name, control.value));
                cell.appendChild(control);
            } else displayValue(cell, key, record[key]);
        }
    }
    container.appendChild(table);
    panel.appendChild(container);
}

async function loadCompany(state) {
    if (state.loading) return;
    state.loading = true;
    state.error = '';
    render(state);
    try {
        const data = await api.load(state.company);
        let filtered = []
        data.columns.forEach(col => {
            if (col.name != "updated_at") {
                filtered.push(col)
            }
        })
        state.columns = filtered;
        state.rows = data.rows;
        state.loaded = true;
        state.stale = false;
        const numbers = new Set(state.rows.map(row => String(row.number)));
        for (const number of state.selected) if (!numbers.has(number)) state.selected.delete(number);
    } catch (error) {
        state.stale = true;
        state.error = error.message;
    } finally {
        state.loading = false;
        render(state);
    }
}

function editedRecord(state, number) {
    const edit = state.edits.get(number);
    // Il PUT sostituisce l'intero veicolo: conserva anche i campi non esposti da listcols.
    const record = { ...edit.original };
    for (const column of state.columns) {
        if (!editable(column) || !edit.values.has(column.name)) continue;
        const control = createControl(column, edit.original[api.columnKey(column)], 'validate-field');
        control.value = edit.values.get(column.name);
        // reportValidity richiede un controllo nel documento per mostrare l'errore.
        const visible = document.querySelector('#panel-' + state.company + ' tr[data-number="' + CSS.escape(number) + '"] [data-column="' + CSS.escape(column.name) + '"]');
        applyValue(record, column, readControl(column, visible || control));
    }
    return record;
}

async function saveEdits(state, numbers) {
    if (busy || state.stale) return;
    let records;
    try {
        // Valida tutte le righe prima di iniziare la sequenza di PUT.
        records = numbers.map(number => editedRecord(state, number));
    } catch (error) {
        message(error.message);
        return;
    }
    setBusy(true);
    let saved = 0;
    try {
        for (let index = 0; index < records.length; index++) {
            await api.mutate(state.company, 'update', records[index]);
            const number = numbers[index];
            const rowIndex = state.rows.findIndex(row => String(row.number) === number);
            state.rows[rowIndex] = records[index];
            state.edits.delete(number);
            saved++;
        }
        message(saved + ' mezzi ' + state.company + ' salvati.', 'success');
    } catch (error) {
        message(saved + ' di ' + records.length + ' mezzi salvati. Le modifiche rimanenti sono conservate.\n' + error.message);
    } finally {
        setBusy(false);
        // Aggiorna i campi gestiti dal server senza perdere le bozze delle altre righe.
        if (saved) await loadCompany(state);
        else render(state);
    }
}

function emptyRecord(state) {
    const record = Object.fromEntries(Object.keys(state.rows[0] || {}).map(key => [key, null]));
    for (const column of state.columns) {
        record[api.columnKey(column)] = /^enum\(/i.test(column.type) && enumValues(column.type).includes('') ? '' : null;
    }
    record.page_link = null;
    return record;
}

function openAdd(batch) {
    const state = activeState();
    if (busy || !state.loaded || state.stale) return;
    const form = document.getElementById('add-form');
    form.reset();
    formError('add-error');
    addContext = { state, batch };
    document.getElementById('add-title').textContent = (batch ? 'Aggiungi mezzi in batch · ' : 'Aggiungi mezzo · ') + state.company;
    document.getElementById('add-description').textContent = batch
        ? 'Gli estremi sono inclusi. Tutti i mezzi avranno gli stessi dati, a eccezione della matricola. Le matricole già presenti non verranno sovrascritte.'
        : 'Compila i dati del nuovo mezzo. I campi vuoti vengono inviati come null; lo stato può essere una stringa vuota.';
    document.getElementById('batch-range').classList.toggle('d-none', !batch);
    document.getElementById('batch-from').disabled = !batch;
    document.getElementById('batch-to').disabled = !batch;
    document.getElementById('batch-from').required = batch;
    document.getElementById('batch-to').required = batch;
    document.getElementById('add-submit').textContent = batch ? 'Aggiungi mezzi' : 'Aggiungi';
    const fields = document.getElementById('add-fields');
    fields.replaceChildren();
    const defaults = emptyRecord(state);
    for (const column of state.columns) {
        if (['updated_at', 'page_link'].includes(column.name) || (batch && column.name === 'matricola')) continue;
        const container = element('div', 'col-md-6');
        const id = 'add-' + column.name;
        const label = element('label', 'form-label fw-bold', column.name);
        label.htmlFor = id;
        const control = createControl(column, defaults[api.columnKey(column)], id, true);
        const pd = document.createElement('p');
        pd.textContent = column.type;
        container.append(label, control, pd);
        fields.appendChild(container);
    }
    bootstrap.Modal.getOrCreateInstance(document.getElementById('add-modal')).show();
}

function newRecords(context) {
    const { state, batch } = context;
    const record = emptyRecord(state);
    for (const column of state.columns) {
        const control = document.getElementById('add-' + column.name);
        if (control) applyValue(record, column, readControl(column, control));
    }
    let from = Number(record.number);
    let to = from;
    if (batch) {
        const numberColumn = state.columns.find(column => column.name === 'matricola');
        from = Number(readControl(numberColumn, document.getElementById('batch-from')));
        to = Number(readControl(numberColumn, document.getElementById('batch-to')));
        if (to < from) throw new Error('La matricola finale deve essere maggiore o uguale a quella iniziale.');
        if (to - from + 1 > 10000) throw new Error('Puoi aggiungere al massimo 10000 mezzi per batch. Riduci l’intervallo.');
    }
    const existing = new Set(state.rows.map(row => Number(row.number)));
    for (let number = from; number <= to; number++) {
        if (existing.has(number)) throw new Error('La matricola ' + number + ' è già presente in ' + state.company + '. Nessun mezzo è stato inviato.');
    }
    return Array.from({ length: to - from + 1 }, (_, index) => ({ ...record, number: String(from + index) }));
}

function openDelete(state, numbers) {
    if (busy || state.stale || !numbers.length) return;
    if (numbers.some(number => state.edits.has(number))) {
        message('Salva o annulla le modifiche dei mezzi selezionati prima di rimuoverli.');
        return;
    }
    const parsed = numbers.map(number => Number(number));
    if (!parsed.every(number => Number.isSafeInteger(number) && number >= 0)) {
        message('Le matricole da rimuovere devono essere interi validi.');
        return;
    }
    deleteContext = { state, numbers: parsed };
    formError('delete-error');
    document.getElementById('delete-description').textContent = 'Confermi la rimozione di ' + numbers.length + ' mezzi di ' + state.company + '?';
    document.getElementById('delete-numbers').textContent = numbers.join(', ');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('delete-modal')).show();
}

async function submitMutation(form, modalId, errorId, state, operation, payload) {
    if (busy) return;
    const controls = Array.from(form.querySelectorAll('button, input, select'));
    const previous = controls.map(control => control.disabled);
    setBusy(true);
    for (const control of controls) control.disabled = true;
    form.setAttribute('aria-busy', 'true');
    formError(errorId);
    let succeeded = false;
    try {
        await api.mutate(state.company, operation, payload);
        succeeded = true;
        if (operation === 'delete') {
            for (const number of payload) state.selected.delete(String(number));
        }
        message((operation === 'add' ? 'Aggiunti ' : 'Rimossi ') + payload.length + ' mezzi ' + state.company + '.', 'success');
    } catch (error) {
        formError(errorId, error.message);
    } finally {
        setBusy(false);
        controls.forEach((control, index) => { control.disabled = previous[index]; });
        form.removeAttribute('aria-busy');
    }
    if (succeeded) {
        bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId)).hide();
        await loadCompany(state);
    }
}

document.getElementById('add-form').addEventListener('submit', event => {
    event.preventDefault();
    if (busy || !addContext) return;
    try {
        const records = newRecords(addContext);
        submitMutation(event.currentTarget, 'add-modal', 'add-error', addContext.state, 'add', records);
    } catch (error) {
        formError('add-error', error.message);
    }
});

document.getElementById('delete-form').addEventListener('submit', event => {
    event.preventDefault();
    if (deleteContext) submitMutation(event.currentTarget, 'delete-modal', 'delete-error', deleteContext.state, 'delete', deleteContext.numbers);
});

for (const id of ['add-modal', 'delete-modal']) {
    document.getElementById(id).addEventListener('hide.bs.modal', event => { if (busy) event.preventDefault(); });
    document.getElementById(id).addEventListener('shown.bs.modal', () => document.getElementById(id).querySelector('input:not(:disabled), button[type="submit"]').focus());
}

for (const company of api.companies) {
    document.getElementById('tab-' + company).addEventListener('shown.bs.tab', () => {
        currentCompany = company;
        const state = activeState();
        document.getElementById('search-input').value = state.query;
        if (!state.loaded && !state.loading) loadCompany(state);
        else updateToolbar();
    });
}
document.getElementById('add-button').addEventListener('click', () => openAdd(false));
document.getElementById('batch-button').addEventListener('click', () => openAdd(true));
document.getElementById('delete-button').addEventListener('click', () => openDelete(activeState(), [...activeState().selected]));
document.getElementById('save-button').addEventListener('click', () => saveEdits(activeState(), [...activeState().edits.keys()]));
document.getElementById('reload-button').addEventListener('click', () => loadCompany(activeState()));
document.getElementById('search-input').addEventListener('input', event => {
    const state = activeState();
    state.query = event.target.value;
    state.page = 0;
    render(state);
});

if (checkAuth()) {
    loadCompany(activeState());
}
