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
    error: '', edits: new Map(), selected: new Set(), query: '', hideDemolished: false,
    sort: 'number', direction: 1
}]));

let currentCompany = 'START';
let busy = false;
let disabledControls = [];
let activeCell = null;
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

function editable(column) {
    return !['matricola', 'updated_at', 'page_link'].includes(column.name);
}

function startCellEdit(state, record, column, cell) {
    if (busy || state.loading || state.stale || activeCell?.cell === cell || !finishCellEdit()) return;
    const number = String(record.number);
    const edit = state.edits.get(number);
    const original = edit ? edit.original : state.rows.find(row => String(row.number) === number);
    const key = api.columnKey(column);
    const value = edit?.values.has(column.name) ? edit.values.get(column.name) : original[key];
    const control = createControl(column, value, 'edit-' + state.company + '-' + number + '-' + column.name);
    activeCell = {
        state, number, original, column, cell, control,
        originalValue: createControl(column, original[key], '').value
    };
    control.addEventListener('input', updateCellDraft);
    control.addEventListener('change', updateCellDraft);
    control.addEventListener('blur', event => {
        if (event.relatedTarget?.closest('#cancel-button')) return;
        if (activeCell?.control === control) finishCellEdit();
    });
    control.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (finishCellEdit()) cell.focus();
        }
    });
    cell.replaceChildren(control);
    control.focus();
}

function updateCellDraft() {
    if (!activeCell) return;
    const { state, number, original, column, cell, control, originalValue } = activeCell;
    if (control.checkValidity()) {
        if (control.value === originalValue) {
            const edit = state.edits.get(number);
            if (edit) {
                edit.values.delete(column.name);
                if (!edit.values.size) state.edits.delete(number);
            }
        } else {
            if (!state.edits.has(number)) state.edits.set(number, { original: { ...original }, values: new Map() });
            state.edits.get(number).values.set(column.name, readControl(column, control));
        }
    }
    cell.classList.toggle('table-warning', Boolean(state.edits.get(number)?.values.has(column.name)));
    updateToolbar();
}

function finishCellEdit() {
    if (!activeCell) return true;
    const { state, number, original, column, cell, control } = activeCell;
    if (!control.reportValidity()) return false;
    updateCellDraft();
    activeCell = null;
    const edit = state.edits.get(number);
    const value = edit?.values.has(column.name) ? edit.values.get(column.name) : original[api.columnKey(column)];
    cell.replaceChildren();
    displayValue(cell, api.columnKey(column), value);
    updateToolbar();
    return true;
}

function filteredRows(state) {
    const query = state.query.trim().toLocaleLowerCase('it');
    const rows = state.rows.map(row => state.edits.has(String(row.number)) ? editedRecord(state, String(row.number)) : row)
        .filter(row => !state.hideDemolished || row.status !== 'demolito')
        .filter(row => !query || Object.values(row).some(value => value != null && String(value).toLocaleLowerCase('it').includes(query)));
    rows.sort((a, b) => collator.compare(String(a[state.sort] ?? ''), String(b[state.sort] ?? '')) * state.direction);
    return rows;
}

function updateToolbar() {
    const state = activeState();
    const unavailable = busy || state.loading || !state.loaded || state.stale;
    const pendingCell = activeCell?.state === state && activeCell.control.value !== activeCell.originalValue;
    const changed = state.edits.size > 0 || pendingCell;
    document.getElementById('table-title').textContent = 'Mezzi ' + state.company;
    document.getElementById('add-button').disabled = unavailable;
    document.getElementById('batch-button').disabled = unavailable;
    document.getElementById('delete-button').disabled = unavailable || !state.selected.size;
    document.getElementById('save-button').disabled = unavailable || !changed;
    document.getElementById('cancel-button').disabled = unavailable || !changed;
    document.getElementById('save-button').textContent = 'Salva modifiche' + (state.edits.size ? ' (' + state.edits.size + ')' : '');
    document.getElementById('delete-button').textContent = 'Rimuovi selezionati' + (state.selected.size ? ' (' + state.selected.size + ')' : '');
    document.getElementById('reload-button').disabled = busy || state.loading;
    document.getElementById('reload-button').title = state.edits.size ? 'Aggiorna i dati dal server conservando le modifiche non salvate.' : '';
    document.getElementById('search-input').disabled = busy || !state.loaded;
    document.getElementById('hide-demolished').disabled = busy || !state.loaded;
    for (const tab of document.querySelectorAll('#company-tabs button')) tab.disabled = busy;
    document.getElementById('table-summary').textContent = state.loaded ? state.rows.length + ' mezzi · ' + state.selected.size + ' selezionati' : '';
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
    if (['photo_path', 'path_html'].includes(key) && value != null) {
        const text = element('span', 'd-block text-truncate path-value');
        text.title = String(value);
        cell.appendChild(text);
        cell = text;
    }
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
    if (!finishCellEdit()) return;
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
    const visible = filteredRows(state);
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
    const columns = state.columns;
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
        cell.colSpan = columns.length + 1;
        cell.className = 'text-center p-4';
        cell.textContent = state.rows.length ? 'Nessun mezzo corrisponde alla ricerca.' : 'Nessun mezzo registrato.';
    }
    for (const record of visible) {
        const number = String(record.number);
        const edit = state.edits.get(number);
        const row = body.insertRow();
        row.dataset.number = number;
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
            cell.dataset.column = column.name;
            displayValue(cell, key, record[key]);
            if (edit?.values.has(column.name)) cell.classList.add('table-warning');
            if (editable(column)) {
                cell.classList.add('editable-cell');
                cell.tabIndex = busy || state.stale ? -1 : 0;
                cell.title = 'Clicca per modificare ' + column.name;
                cell.addEventListener('click', event => {
                    if (activeCell?.cell === cell) return;
                    event.preventDefault();
                    startCellEdit(state, record, column, cell);
                });
                cell.addEventListener('keydown', event => {
                    if (event.target === cell && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        startCellEdit(state, record, column, cell);
                    }
                });
            }
        }
    }
    container.appendChild(table);
    panel.appendChild(container);
}

async function loadCompany(state) {
    if (state.loading || !finishCellEdit()) return;
    state.loading = true;
    state.error = '';
    render(state);
    try {
        const data = await api.load(state.company);
        state.columns = data.columns.filter(column => column.name !== 'updated_at');
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

for (const company of api.companies) {
    document.getElementById('tab-' + company).addEventListener('shown.bs.tab', () => {
        currentCompany = company;
        const state = activeState();
        document.getElementById('search-input').value = state.query;
        document.getElementById('hide-demolished').checked = state.hideDemolished;
        if (!state.loaded && !state.loading) loadCompany(state);
        else updateToolbar();
    });
}
document.addEventListener('pointerdown', event => {
    if (activeCell && !activeCell.cell.contains(event.target) && !event.target.closest('#cancel-button') && !finishCellEdit()) {
        event.preventDefault();
        event.stopPropagation();
    }
}, true);
document.getElementById('cancel-button').addEventListener('click', () => {
    if (busy) return;
    activeCell = null;
    activeState().edits.clear();
    render(activeState());
});
document.getElementById('reload-button').addEventListener('click', () => loadCompany(activeState()));
document.getElementById('search-input').addEventListener('input', event => {
    const state = activeState();
    state.query = event.target.value;
    render(state);
});
document.getElementById('hide-demolished').addEventListener('change', event => {
    const state = activeState();
    if (!finishCellEdit()) {
        event.target.checked = state.hideDemolished;
        return;
    }
    state.hideDemolished = event.target.checked;
    render(state);
});

if (checkAuth()) {
    loadCompany(activeState());
}
