const addFormContainer = document.getElementById('add-form-div');
const removeFormContainer = document.getElementById('remove-form-div');
const changeFormContainer = document.getElementById('change-form-div');

const vehicleTableInput = document.getElementById('vehicle-table-input');
const vehicleInput = document.getElementById('vehicle-input');
const removeVehicleTableInput = document.getElementById('remove-vehicle-table-input');

const changeVehicleFromInput = document.getElementById('change-vehiclefrom-input');
const changeVehicleToInput = document.getElementById('change-vehicleto-input');
const changeTableContainer = document.getElementById('change-table-container');
const changeTableSelect = document.getElementById('change-table-select');

const busyForms = new Set();
let preferredChangeTable = '';

function showFieldMessage(input, message, invalid) {
    const container = document.getElementById(input.getAttribute('aria-describedby'));
    container.replaceChildren();
    input.classList.toggle('is-invalid', invalid);
    input.setAttribute('aria-invalid', String(invalid));
    if (message) {
        const paragraph = document.createElement('p');
        paragraph.className = 'my-2 text-warning';
        const icon = document.createElement('i');
        icon.className = 'bi bi-exclamation-triangle-fill me-2';
        icon.setAttribute('aria-hidden', 'true');
        paragraph.appendChild(icon);
        paragraph.appendChild(document.createTextNode(message));
        container.appendChild(paragraph);
    }
}

function clearFormError(form) {
    form.querySelector('[id$="error-message-div"]').replaceChildren();
}

function showFormError(form, error) {
    const container = form.querySelector('[id$="error-message-div"]');
    const message = document.createElement('p');
    message.className = 'my-2 text-danger';
    message.setAttribute('role', 'alert');
    message.textContent = error.message;
    container.replaceChildren(message);
}

function isPositiveInteger(value) {
    return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
}

function matchingAssignments(field, value) {
    const term = value.trim();
    return currentAssignments.filter(function (assignment) {
        const assignedValue = String(assignment[field]);
        if (field === 'vehicle' && isPositiveInteger(term) && isPositiveInteger(assignedValue)) {
            return Number(assignedValue) === Number(term);
        }
        return assignedValue === term;
    });
}

function validateNumber(input) {
    if (!isPositiveInteger(input.value.trim())) {
        showFieldMessage(input, 'Inserisci un numero maggiore di 0.', true);
        return false;
    }
    return true;
}

function validateTable(input) {
    const value = input.value.trim();
    // I codici già restituiti dall'API possono essere anche non numerici.
    if (value && matchingAssignments('vehicle_table', value).length > 0) {
        return true;
    }
    return validateNumber(input);
}

function updateAddWarnings() {
    const assignments = matchingAssignments('vehicle_table', vehicleTableInput.value);
    let tableMessage = '';
    if (assignments.length > 0) {
        tableMessage = 'Questa tabella è già occupata da ' + assignments[0].vehicle + '. L’assegnazione verrà aggiornata.';
    }
    showFieldMessage(vehicleTableInput, tableMessage, false);
    const tables = matchingAssignments('vehicle', vehicleInput.value).map(function (assignment) {
        return assignment.vehicle_table;
    });
    let vehicleMessage = '';
    if (tables.length > 0) {
        vehicleMessage = 'Questo veicolo è già sulla tabella: ' + tables.join(', ') + '. Puoi comunque inserirlo.';
    } else if (tables.length > 1) {
        vehicleMessage = 'Questo veicolo è già sulle tabelle: ' + tables.join(', ') + '. Puoi comunque inserirlo.';
    }
    showFieldMessage(vehicleInput, vehicleMessage, false);
}

function updateChangeTables() {
    const assignments = matchingAssignments('vehicle', changeVehicleFromInput.value);
    let selected = changeTableSelect.value;
    if (preferredChangeTable) {
        selected = preferredChangeTable;
    }
    changeTableSelect.replaceChildren();
    if (assignments.length > 1) {
        changeTableSelect.add(new Option('Seleziona una tabella...', ''));
    }
    for (const assignment of assignments) {
        const value = String(assignment.vehicle_table);
        changeTableSelect.add(new Option(value, value));
    }
    if (assignments.length > 1) {
        changeTableSelect.value = selected;
    }
    changeTableContainer.classList.toggle('d-none', assignments.length <= 1);
    showFieldMessage(changeTableSelect, '', false);
}

function updateChangeWarnings() {
    const tables = matchingAssignments('vehicle', changeVehicleToInput.value).map(function (assignment) {
        return assignment.vehicle_table;
    });
    let message = '';
    if (tables.length > 0) {
        message = 'Questo veicolo è già sulla tabella: ' + tables.join(', ') + '. Puoi comunque assegnarlo.';
    } else if (tables.length > 1) {
        message = 'Questo veicolo è già sulle tabelle: ' + tables.join(', ') + '. Puoi comunque assegnarlo.';
    }
    if (isPositiveInteger(changeVehicleToInput.value.trim()) && Number(changeVehicleFromInput.value) === Number(changeVehicleToInput.value)) {
        message = 'Il mezzo coincide con quello da sostituire: l’assegnazione resterà identica. Puoi comunque confermare.';
    }
    showFieldMessage(changeVehicleToInput, message, false);
}

for (const input of [vehicleTableInput, vehicleInput]) {
    input.addEventListener('input', function () {
        clearFormError(document.getElementById('add-form'));
        updateAddWarnings();
    });
}
removeVehicleTableInput.addEventListener('input', function () {
    clearFormError(document.getElementById('remove-form'));
    showFieldMessage(removeVehicleTableInput, '', false);
});
changeVehicleFromInput.addEventListener('input', function () {
    preferredChangeTable = '';
    clearFormError(document.getElementById('change-form'));
    showFieldMessage(changeVehicleFromInput, '', false);
    updateChangeTables();
    updateChangeWarnings();
});
changeVehicleToInput.addEventListener('input', function () {
    clearFormError(document.getElementById('change-form'));
    updateChangeWarnings();
});
changeTableSelect.addEventListener('change', function () {
    preferredChangeTable = changeTableSelect.value;
    showFieldMessage(changeTableSelect, '', false);
});

for (const container of [addFormContainer, removeFormContainer, changeFormContainer]) {
    const form = container.querySelector('form');
    container.addEventListener('show.bs.modal', async function () {
        clearFormError(form);
        try {
            await loadAssignments();
            if (!container.classList.contains('show') || busyForms.has(form)) {
                return;
            }
            if (container === addFormContainer) {
                updateAddWarnings();
            } else if (container === changeFormContainer) {
                updateChangeTables();
                updateChangeWarnings();
            }
        } catch (error) {
            if (container.classList.contains('show')) {
                showFormError(form, new Error('Impossibile aggiornare le assegnazioni. Riprova l’operazione.'));
            }
        }
    });
    container.addEventListener('shown.bs.modal', function () {
        form.querySelector('input').focus();
    });
    container.addEventListener('hide.bs.modal', function (event) {
        if (busyForms.has(form)) {
            event.preventDefault();
        }
    });
    container.addEventListener('hidden.bs.modal', function () {
        form.reset();
        clearFormError(form);
        for (const input of form.querySelectorAll('input, select')) {
            showFieldMessage(input, '', false);
        }
        if (container === changeFormContainer) {
            preferredChangeTable = '';
            changeTableSelect.replaceChildren();
            changeTableContainer.classList.add('d-none');
        }
    });
}

async function sendAssignmentRequest(path, method, body) {
    const token = getValidToken();
    if (!token) {
        redirectToLogin();
        throw new Error('Sessione scaduta, reindirizzamento al login...');
    }
    const url = await getApiUrl();
    const response = await fetch(url + path, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
    });
    if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expiry');
        redirectToLogin();
        throw new Error('Sessione scaduta, reindirizzamento al login...');
    }
    if (!response.ok) {
        throw new Error('Errore nella richiesta, stato HTTP: ' + response.status);
    }
    const text = await response.text();
    if (text) {
        const result = JSON.parse(text);
        if (result && typeof result === 'object' && !Array.isArray(result)) {
            if (result.error) {
                throw new Error(String(result.error));
            }
            // Il backend può restituire un errore SQL con stato HTTP 200.
            throw new Error('Il server non ha completato l’operazione. Riprova.');
        }
    }
}

async function submitAssignmentForm(container, path, method, validate) {
    const form = container.querySelector('form');
    if (busyForms.has(form)) {
        return;
    }
    busyForms.add(form);
    const controls = Array.from(form.querySelectorAll('button, input, select'));
    const previousDisabled = controls.map(function (control) {
        return control.disabled;
    });
    for (const control of controls) {
        control.disabled = true;
    }
    form.setAttribute('aria-busy', 'true');
    clearFormError(form);
    let completed = false;
    try {
        if (!assignmentsLoaded || assignmentsPromise) {
            await loadAssignments();
        }
        const body = validate();
        if (!body) {
            return;
        }
        await sendAssignmentRequest(path, method, body);
        completed = true;
    } catch (error) {
        showFormError(form, error);
    } finally {
        busyForms.delete(form);
        controls.forEach(function (control, index) {
            control.disabled = previousDisabled[index];
        });
        form.removeAttribute('aria-busy');
    }
    if (completed) {
        bootstrap.Modal.getOrCreateInstance(container).hide();
        // Aggiorna anche la cache usata dai form quando si opera dalla ricerca.
        assignmentsLoaded = false;
        if (currentTab === 'list') {
            await initList();
        } else {
            try {
                await loadAssignments();
            } catch (error) {
                assignmentsLoaded = false;
            }
            if (currentTab === 'arrivals' && activeArrival) {
                await renderArrivals(activeArrival.code, activeArrival.name);
            }
        }
    }
}

function submitAddForm() {
    return submitAssignmentForm(addFormContainer, '/assignments/add', 'POST', function () {
        updateAddWarnings();
        const tableValid = validateTable(vehicleTableInput);
        const vehicleValid = validateNumber(vehicleInput);
        if (!tableValid || !vehicleValid) {
            return null;
        }
        return {
            vehicle_table: vehicleTableInput.value.trim(),
            vehicle: Number(vehicleInput.value.trim())
        };
    });
}

function submitRemoveForm() {
    return submitAssignmentForm(removeFormContainer, '/assignments/remove', 'DELETE', function () {
        showFieldMessage(removeVehicleTableInput, '', false);
        if (!validateTable(removeVehicleTableInput)) {
            return null;
        }
        if (matchingAssignments('vehicle_table', removeVehicleTableInput.value).length === 0) {
            showFieldMessage(removeVehicleTableInput, 'Questa tabella non è registrata.', true);
            return null;
        }
        return {
            vehicle_table: removeVehicleTableInput.value.trim()
        };
    });
}

function submitChangeForm() {
    return submitAssignmentForm(changeFormContainer, '/assignments/changevehicle', 'PUT', function () {
        showFieldMessage(changeVehicleFromInput, '', false);
        updateChangeWarnings();
        const fromValid = validateNumber(changeVehicleFromInput);
        const toValid = validateNumber(changeVehicleToInput);
        if (!fromValid || !toValid) {
            return null;
        }
        const assignments = matchingAssignments('vehicle', changeVehicleFromInput.value);
        if (assignments.length === 0) {
            showFieldMessage(changeVehicleFromInput, 'Il bus non è registrato su nessuna tabella.', true);
            return null;
        }
        updateChangeTables();
        const selected = assignments.find(function (assignment) {
            return String(assignment.vehicle_table) === changeTableSelect.value;
        });
        if (!selected) {
            showFieldMessage(changeTableSelect, 'Seleziona la tabella da modificare.', true);
            return null;
        }
        return {
            vehicle_table: String(selected.vehicle_table),
            vehicle: Number(changeVehicleToInput.value.trim())
        };
    });
}

function openAddFormPrecTable(vehicleTable) {
    vehicleTableInput.value = vehicleTable;
    updateAddWarnings();
    bootstrap.Modal.getOrCreateInstance(addFormContainer).show();
}

function openChangeFormPrecTable(vehicle, vehicleTable) {
    changeVehicleFromInput.value = vehicle;
    preferredChangeTable = String(vehicleTable);
    updateChangeTables();
    bootstrap.Modal.getOrCreateInstance(changeFormContainer).show();
}

function openRemoveFormPrecTable(vehicleTable) {
    removeVehicleTableInput.value = vehicleTable;
    bootstrap.Modal.getOrCreateInstance(removeFormContainer).show();
}

for (const entry of [
    { id: 'add-form', submit: submitAddForm },
    { id: 'remove-form', submit: submitRemoveForm },
    { id: 'change-form', submit: submitChangeForm }
]) {
    document.getElementById(entry.id).addEventListener('submit', function (event) {
        event.preventDefault();
        entry.submit();
    });
}
