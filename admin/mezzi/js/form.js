let addContext = null;
let deleteContext = null;

function formError(id, text = '') {
    document.getElementById(id).textContent = text;
    document.getElementById(id).classList.toggle('d-none', !text);
}

function enumValues(type) {
    return Array.from(type.matchAll(/'((?:[^'\\]|\\.|'')*)'/g), match => match[1].replace(/''/g, "'").replace(/\\'/g, "'"));
}

function dateInputValue(value, withTime) {
    if (!value) return '';
    const text = String(value);
    const italian = /^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(text);
    const iso = italian ? italian[3] + '-' + italian[2] + '-' + italian[1] + 'T' + (italian[4] || '00') + ':' + (italian[5] || '00') + ':' + (italian[6] || '00') : text.replace(' ', 'T');
    return iso.slice(0, withTime ? 16 : 10);
}

function createControl(column, value, id, adding = false) {
    const type = column.type.toLowerCase();
    const nullable = column.nullable === true;
    let control;
    if (type.startsWith('enum(') || /^tinyint\(1\)/.test(type)) {
        control = element('select', 'form-select form-select-sm');
        const options = type.startsWith('enum(')
            ? enumValues(column.type).map(item => [item, item || '(vuoto)'])
            : [['true', 'Sì'], ['false', 'No']];
        if (nullable) options.unshift(['__null__', '[NULL]']);
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
            control.value = dateInputValue(value, withTime);
            const dateType = control.type;
            if (!control.value) control.type = 'text';
            control.addEventListener('focus', () => { control.type = dateType; });
            control.addEventListener('blur', () => { if (!control.value && !control.validity.badInput) control.type = 'text'; });
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
    // La stringa vuota è un valore valido se dichiarato nell'enum, anche con NOT NULL.
    control.required = !nullable && !(type.startsWith('enum(') && enumValues(column.type).includes(''));
    if (column.name === 'matricola') {
        control.required = true;
        control.min = '0';
        control.max = '2147483647';
    } else if (nullable) control.placeholder = '[NULL]';
    if (adding) control.classList.remove('form-control-sm', 'form-select-sm');
    return control;
}

function readControl(column, control) {
    if (!control.reportValidity()) throw new Error('Controlla il campo ' + column.name + '.');
    const raw = control.value;
    const type = column.type.toLowerCase();
    if (control.tagName === 'SELECT') {
        if (raw === '__null__') {
            if (column.nullable !== true) throw new Error('Il campo ' + column.name + ' non può essere null.');
            return null;
        }
        return /^tinyint\(1\)/.test(type) ? raw === 'true' : raw;
    }
    if (column.name === 'matricola') {
        if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) > 2147483647) {
            throw new Error('La matricola deve essere un intero tra 0 e 2147483647.');
        }
        return String(Number(raw));
    }
    if (raw === '') return column.nullable === true ? null : '';
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

function editedRecord(state, number) {
    const edit = state.edits.get(number);
    // Il PUT sostituisce l'intero veicolo: conserva anche i campi non esposti da listcols.
    const record = { ...edit.original };
    for (const column of state.columns) {
        if (!editable(column) || !edit.values.has(column.name)) continue;
        applyValue(record, column, edit.values.get(column.name));
    }
    return record;
}

async function saveEdits(state) {
    if (busy || state.stale || !finishCellEdit()) return;
    const numbers = [...state.edits.keys()];
    if (!numbers.length) return;
    const records = numbers.map(number => editedRecord(state, number));
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
    if (busy || !state.loaded || state.stale || !finishCellEdit()) return;
    const form = document.getElementById('add-form');
    form.reset();
    formError('add-error');
    addContext = { state, batch };
    document.getElementById('add-title').textContent = (batch ? 'Aggiungi mezzi in batch · ' : 'Aggiungi mezzo · ') + state.company;
    document.getElementById('add-description').textContent = batch
        ? 'Gli estremi sono inclusi. Tutti i mezzi avranno gli stessi dati, a eccezione della matricola. Le matricole già presenti non verranno sovrascritte.'
        : 'Compila i dati del nuovo mezzo.';
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
    if (busy || state.stale || !numbers.length || !finishCellEdit()) return;
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

document.getElementById('add-button').addEventListener('click', () => openAdd(false));
document.getElementById('batch-button').addEventListener('click', () => openAdd(true));
document.getElementById('delete-button').addEventListener('click', () => openDelete(activeState(), [...activeState().selected]));
document.getElementById('save-button').addEventListener('click', () => saveEdits(activeState()));
