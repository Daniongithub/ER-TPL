'use strict';

(() => {
    const api = window.MezziAPI;
    const pageSize = 50;
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
    const byId = id => document.getElementById(id);
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
        const container = byId('page-message');
        container.className = 'alert alert-' + type + ' request-error';
        container.textContent = text;
        container.setAttribute('role', type === 'danger' ? 'alert' : 'status');
    }

    function formError(id, text = '') {
        byId(id).textContent = text;
        byId(id).classList.toggle('d-none', !text);
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
        const rows = filteredRows(state);
        state.page = Math.max(0, Math.min(state.page, Math.ceil(rows.length / pageSize) - 1));
        return rows.slice(state.page * pageSize, (state.page + 1) * pageSize);
    }

    function updateToolbar() {
        const state = activeState();
        const unavailable = busy || state.loading || !state.loaded || state.stale;
        byId('table-title').textContent = 'Mezzi ' + state.company;
        byId('add-button').disabled = unavailable;
        byId('batch-button').disabled = unavailable;
        byId('delete-button').disabled = unavailable || !state.selected.size;
        byId('save-button').disabled = unavailable || !state.edits.size;
        byId('save-button').textContent = 'Salva modifiche' + (state.edits.size ? ' (' + state.edits.size + ')' : '');
        byId('delete-button').textContent = 'Rimuovi selezionati' + (state.selected.size ? ' (' + state.selected.size + ')' : '');
        byId('reload-button').disabled = busy || state.loading;
        byId('reload-button').title = state.edits.size ? 'Aggiorna i dati dal server conservando le modifiche non salvate.' : '';
        byId('search-input').disabled = busy || !state.loaded;
        for (const tab of document.querySelectorAll('#company-tabs button')) tab.disabled = busy;
        const count = filteredRows(state).length;
        const pages = Math.max(1, Math.ceil(count / pageSize));
        byId('table-summary').textContent = state.loaded ? count + ' di ' + state.rows.length + ' mezzi · ' + state.selected.size + ' selezionati' : '';
        byId('page-label').textContent = state.loaded ? 'Pagina ' + (state.page + 1) + ' di ' + pages : '';
        byId('previous-button').disabled = unavailable || state.page === 0;
        byId('next-button').disabled = unavailable || state.page + 1 >= pages;
    }

    function setBusy(value) {
        busy = value;
        for (const state of states.values()) byId('panel-' + state.company).setAttribute('aria-busy', String(value || state.loading));
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
            // Accetta solo link web o relativi, mai protocolli eseguibili provenienti dall'API.
            let url;
            try { url = new URL(String(value), window.location.href); } catch { cell.textContent = String(value); return; }
            if (['http:', 'https:'].includes(url.protocol)) {
                const link = element('a', '', String(value));
                link.href = url.href;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                cell.appendChild(link);
            } else cell.textContent = String(value);
        } else cell.textContent = String(value);
    }

    function render(state) {
        const panel = byId('panel-' + state.company);
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
        const container = element('div', 'table-responsive border border-secondary vehicles-table-container');
        const table = element('table', 'table table-striped table-hover vehicles-table mb-0');
        table.appendChild(element('caption', 'visually-hidden', 'Mezzi ' + state.company));
        const head = table.createTHead();
        const header = head.insertRow();
        const selectionHeader = element('th', 'selection-cell');
        selectionHeader.scope = 'col';
        const selectAll = element('input', 'form-check-input');
        selectAll.type = 'checkbox';
        selectAll.setAttribute('aria-label', 'Seleziona tutti i mezzi visibili di ' + state.company);
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
        header.appendChild(selectionHeader);
        const columns = [...state.columns];
        if (!columns.some(column => column.name === 'page_link')) columns.push({ name: 'page_link', type: 'derivato' });
        for (const column of columns) {
            const th = element('th');
            th.scope = 'col';
            const key = api.columnKey(column);
            th.setAttribute('aria-sort', state.sort === key ? (state.direction === 1 ? 'ascending' : 'descending') : 'none');
            const sort = button(column.name + (state.sort === key ? (state.direction === 1 ? ' ↑' : ' ↓') : ''), 'border-0 p-0 fw-bold text-body text-nowrap', () => {
                state.direction = state.sort === key ? -state.direction : 1;
                state.sort = key;
                render(state);
            });
            th.append(sort, element('small', 'd-block text-body-secondary fw-normal', column.type));
            header.appendChild(th);
        }
        const actionsHeader = element('th', 'action-cell', 'Azioni');
        actionsHeader.scope = 'col';
        header.appendChild(actionsHeader);
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
            row.dataset.number = number;
            if (edit) row.classList.add('table-warning');
            const selection = row.insertCell();
            selection.className = 'selection-cell';
            const checkbox = element('input', 'form-check-input');
            checkbox.type = 'checkbox';
            checkbox.checked = state.selected.has(number);
            checkbox.disabled = busy || state.stale;
            checkbox.setAttribute('aria-label', 'Seleziona mezzo ' + number);
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
            const actions = row.insertCell();
            actions.className = 'action-cell';
            if (edit) {
                actions.append(
                    button('Salva', 'btn-success btn-sm me-1', () => saveEdits(state, [number])),
                    button('Annulla', 'btn-secondary btn-sm', () => { state.edits.delete(number); render(state); })
                );
            } else {
                actions.append(
                    button('Modifica', 'btn-outline-primary btn-sm me-1', () => {
                        state.edits.set(number, { original: { ...record }, values: new Map() });
                        render(state);
                    }),
                    button('Rimuovi', 'btn-outline-danger btn-sm', () => openDelete(state, [number]))
                );
            }
            for (const control of actions.querySelectorAll('button')) control.disabled = busy || state.stale;
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
            state.columns = data.columns;
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
        const form = byId('add-form');
        form.reset();
        formError('add-error');
        addContext = { state, batch };
        byId('add-title').textContent = (batch ? 'Aggiungi mezzi in batch · ' : 'Aggiungi mezzo · ') + state.company;
        byId('add-description').textContent = batch
            ? 'Gli estremi sono inclusi. Tutti i mezzi avranno gli stessi dati, a eccezione della matricola. Le matricole già presenti non verranno sovrascritte.'
            : 'Compila i dati del nuovo mezzo. I campi vuoti vengono inviati come null; lo stato può essere una stringa vuota.';
        byId('batch-range').classList.toggle('d-none', !batch);
        byId('batch-from').disabled = !batch;
        byId('batch-to').disabled = !batch;
        byId('batch-from').required = batch;
        byId('batch-to').required = batch;
        byId('add-submit').textContent = batch ? 'Aggiungi mezzi' : 'Aggiungi';
        const fields = byId('add-fields');
        fields.replaceChildren();
        const defaults = emptyRecord(state);
        for (const column of state.columns) {
            if (['updated_at', 'page_link'].includes(column.name) || (batch && column.name === 'matricola')) continue;
            const container = element('div', 'col-md-6');
            const id = 'add-' + column.name;
            const label = element('label', 'form-label fw-bold', column.name);
            label.htmlFor = id;
            const control = createControl(column, defaults[api.columnKey(column)], id, true);
            container.append(label, control, element('small', 'text-body-secondary', column.type));
            fields.appendChild(container);
        }
        bootstrap.Modal.getOrCreateInstance(byId('add-modal')).show();
    }

    function newRecords(context) {
        const { state, batch } = context;
        const record = emptyRecord(state);
        for (const column of state.columns) {
            const control = byId('add-' + column.name);
            if (control) applyValue(record, column, readControl(column, control));
        }
        let from = Number(record.number);
        let to = from;
        if (batch) {
            const numberColumn = state.columns.find(column => column.name === 'matricola');
            from = Number(readControl(numberColumn, byId('batch-from')));
            to = Number(readControl(numberColumn, byId('batch-to')));
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
        byId('delete-description').textContent = 'Confermi la rimozione di ' + numbers.length + ' mezzi di ' + state.company + '?';
        byId('delete-numbers').textContent = numbers.join(', ');
        bootstrap.Modal.getOrCreateInstance(byId('delete-modal')).show();
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
            bootstrap.Modal.getOrCreateInstance(byId(modalId)).hide();
            await loadCompany(state);
        }
    }

    byId('add-form').addEventListener('submit', event => {
        event.preventDefault();
        if (busy || !addContext) return;
        try {
            const records = newRecords(addContext);
            submitMutation(event.currentTarget, 'add-modal', 'add-error', addContext.state, 'add', records);
        } catch (error) {
            formError('add-error', error.message);
        }
    });
    byId('delete-form').addEventListener('submit', event => {
        event.preventDefault();
        if (deleteContext) submitMutation(event.currentTarget, 'delete-modal', 'delete-error', deleteContext.state, 'delete', deleteContext.numbers);
    });
    for (const id of ['add-modal', 'delete-modal']) {
        byId(id).addEventListener('hide.bs.modal', event => { if (busy) event.preventDefault(); });
        byId(id).addEventListener('shown.bs.modal', () => byId(id).querySelector('input:not(:disabled), button[type="submit"]').focus());
    }
    for (const company of api.companies) {
        byId('tab-' + company).addEventListener('shown.bs.tab', () => {
            currentCompany = company;
            const state = activeState();
            byId('search-input').value = state.query;
            if (!state.loaded && !state.loading) loadCompany(state);
            else updateToolbar();
        });
    }
    byId('add-button').addEventListener('click', () => openAdd(false));
    byId('batch-button').addEventListener('click', () => openAdd(true));
    byId('delete-button').addEventListener('click', () => openDelete(activeState(), [...activeState().selected]));
    byId('save-button').addEventListener('click', () => saveEdits(activeState(), [...activeState().edits.keys()]));
    byId('reload-button').addEventListener('click', () => loadCompany(activeState()));
    byId('search-input').addEventListener('input', event => {
        const state = activeState();
        state.query = event.target.value;
        state.page = 0;
        render(state);
    });
    byId('previous-button').addEventListener('click', () => { activeState().page--; render(activeState()); });
    byId('next-button').addEventListener('click', () => { activeState().page++; render(activeState()); });
    window.addEventListener('beforeunload', event => {
        if (busy || [...states.values()].some(state => state.edits.size)) {
            event.preventDefault();
            event.returnValue = '';
        }
    });
    loadCompany(activeState());
})();
