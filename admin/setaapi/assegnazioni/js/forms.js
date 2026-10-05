const vehicleTableInput = document.getElementById('vehicle-table-input');
const vehicleInput = document.getElementById('vehicle-input');
const removeVehicleTableInput = document.getElementById('remove-vehicle-table-input');

const addFormContainer = document.getElementById('add-form-div');
const addFormTableMessage = document.getElementById('add-table-message-div');
const addFormVehicleMessage = document.getElementById('add-vehicle-message-div');

const removeFormContainer = document.getElementById('remove-form-div');
const removeFormTableMessage = document.getElementById('remove-table-message-div');

const changeFormContainer = document.getElementById('change-form-div');
const changeVehicleFromInput = document.getElementById('change-vehiclefrom-input');
const changeVehicleToInput = document.getElementById('change-vehicleto-input');
const changeVehicleFromMessage = document.getElementById('change-vehiclefrom-message-div');
const changeVehicleToMessage = document.getElementById('change-vehicleto-message-div');

const errorMessage = document.getElementById('error-message-div');
const removeErrorMessage = document.getElementById('remove-error-message-div');
const changeErrorMessage = document.getElementById('change-error-message-div');

getApiUrl().then(url => {
    fetch(url + "/assignments")
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
            return response.json();
        })
        .then(data => {
            currentAssignments = data;
        })
        .catch(err => {
            console.error('Errore nel caricamento dati:', err);
        })
});

function resetForms() {
    vehicleTableInput.value = '';
    vehicleInput.value = '';
    removeVehicleTableInput.value = '';
    changeVehicleFromInput.value = '';
    changeVehicleToInput.value = '';
    removeFormTableMessage.innerHTML = '';
    changeVehicleFromMessage.innerHTML = '';
    changeVehicleToMessage.innerHTML = '';
    addFormTableMessage.innerHTML = '';
    addFormVehicleMessage.innerHTML = '';
}

async function submitAddForm() {
    const vehicleTable = vehicleTableInput.value;
    const vehicle = vehicleInput.value;
    if (vehicleTable == "" || vehicleTable == "0" || !isInteger(vehicleTable)) {
        addFormTableMessage.innerHTML = `
            <p class="my-2 text-warning"><i class="bi bi-exclamation-triangle-fill m-2"></i>Valore non valido.</p>
        `;
        return;
    }
    if (vehicle == "" || vehicle == "0" || !isInteger(vehicle)) {
        addFormVehicleMessage.innerHTML = `
            <p class="my-2 text-warning"><i class="bi bi-exclamation-triangle-fill m-2"></i>Valore non valido.</p>
        `;
        return;
    }
    //Submit to backend
    getApiUrl().then(url => {
        const token = getValidToken();
        if (!token) {
            redirectToLogin();
            return;
        }
        fetch(url + "/assignments/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ vehicle_table: vehicleTable, vehicle: Number(vehicle) }),
        })
            .then(response => {
                if (response.status === 401) {
                    sessionStorage.removeItem("access_token");
                    sessionStorage.removeItem("token_expiry");
                    redirectToLogin();
                    throw new Error("Sessione scaduta, reindirizzamento al login...");
                }
                if (!response.ok) throw new Error("Errore nella richiesta, stato HTTP: " + response.status);
                return response.json();
            })
            .then(data => {
                //Closes modal if completed correctly
                resetForms();
                const modalInstance = bootstrap.Modal.getInstance(addFormContainer);
                if (modalInstance) {
                    modalInstance.hide();
                }
                //Reload table
                switchView("list", document.getElementById('list-button'))
            })
            .catch(err => {
                console.error('Errore nel caricamento dati:', err);
                errorMessage.innerHTML = `
                    <p class="my-2 text-danger"><i class="bi bi-exclamation-triangle-fill m-2"></i>${err}</p>
                `;
            });
    });
}

vehicleTableInput.addEventListener('input', function (event) {
    const vehicleTable = vehicleTableInput.value;
    if (vehicle = searchVehicle(currentAssignments, vehicleTable)) {
        addFormTableMessage.innerHTML = `
            <p class="my-2 text-warning"><i class="bi bi-exclamation-triangle-fill m-2"></i>Questa tabella è già occupata da ${vehicle}</p>
        `;
    } else {
        addFormTableMessage.innerHTML = ``;
    }
});

vehicleInput.addEventListener('input', function (event) {
    const vehicle = vehicleInput.value;
    if (table = searchTable(currentAssignments, vehicle)) {
        addFormVehicleMessage.innerHTML = `
            <p class="my-2 text-warning"><i class="bi bi-exclamation-triangle-fill m-2"></i>Questo veicolo è già sulla tabella ${table}</p>
        `;
    } else {
        addFormVehicleMessage.innerHTML = ``;
    }
});

function submitRemoveForm() {
    const vehicleTable = removeVehicleTableInput.value;
    if (vehicleTable == "" || vehicleTable == "0" || !isInteger(vehicleTable)) {
        removeFormTableMessage.innerHTML = `
            <p class="my-2 text-warning"><i class="bi bi-exclamation-triangle-fill m-2"></i>Valore non valido.</p>
        `;
        return;
    }
    if(!searchVehicle(currentAssignments, vehicleTable)) {
        removeFormTableMessage.innerHTML = `
            <p class="my-2 text-warning"><i class="bi bi-exclamation-triangle-fill m-2"></i>Questa tabella non è registrata.</p>
        `;
        return;
    }
    //Submit to backend
    getApiUrl().then(url => {
        const token = getValidToken();
        if (!token) {
            redirectToLogin();
            return;
        }
        fetch(url + "/assignments/remove", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ vehicle_table: vehicleTable }),
        })
            .then(response => {
                if (response.status === 401) {
                    sessionStorage.removeItem("access_token");
                    sessionStorage.removeItem("token_expiry");
                    redirectToLogin();
                    throw new Error("Sessione scaduta, reindirizzamento al login...");
                }
                if (!response.ok) throw new Error("Errore nella richiesta, stato HTTP: " + response.status);
                return response.json();
            })
            .then(data => {
                //Closes modal if completed correctly
                resetForms();
                const modalInstance = bootstrap.Modal.getInstance(removeFormContainer);
                if (modalInstance) {
                    modalInstance.hide();
                }
                //Reload table
                switchView("list", document.getElementById('list-button'))
            })
            .catch(err => {
                console.error('Errore nel caricamento dati:', err);
                removeErrorMessage.innerHTML = `
                    <p class="my-2 text-danger"><i class="bi bi-exclamation-triangle-fill m-2"></i>${err}</p>
                `;
            });
    });
}

function submitChangeForm() {
    const vehicleFrom = changeVehicleFromInput.value;
    const vehicleTo = changeVehicleToInput.value;
    if (vehicleFrom == "" || vehicleFrom == "0" || !isInteger(vehicleFrom)) {
        changeVehicleFromMessage.innerHTML = `
            <p class="my-2 text-warning"><i class="bi bi-exclamation-triangle-fill m-2"></i>Valore non valido.</p>
        `;
        return;
    }
    if (vehicleTo == "" || vehicleTo == "0" || !isInteger(vehicleTo)) {
        changeVehicleToMessage.innerHTML = `
            <p class="my-2 text-warning"><i class="bi bi-exclamation-triangle-fill m-2"></i>Valore non valido.</p>
        `;
        return;
    }
    //Take corresponding table
    var vehicleTable
    if(table = searchTable(currentAssignments, vehicleFrom)) {
        vehicleTable = table;
    } else {
        changeVehicleFromMessage.innerHTML = `
            <p class="my-2 text-warning"><i class="bi bi-exclamation-triangle-fill m-2"></i>Il bus non è registrato su nessuna tabella.</p>
        `;
        return;
    }
    //Submit to backend
    getApiUrl().then(url => {
        const token = getValidToken();
        if (!token) {
            redirectToLogin();
            return;
        }
        fetch(url + "/assignments/changevehicle", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ vehicle_table: vehicleTable, vehicle: Number(vehicleTo) }),
        })
            .then(response => {
                if (response.status === 401) {
                    sessionStorage.removeItem("access_token");
                    sessionStorage.removeItem("token_expiry");
                    redirectToLogin();
                    throw new Error("Sessione scaduta, reindirizzamento al login...");
                }
                if (!response.ok) throw new Error("Errore nella richiesta, stato HTTP: " + response.status);
                return response.json();
            })
            .then(data => {
                //Closes modal if completed correctly
                resetForms();
                const modalInstance = bootstrap.Modal.getInstance(changeFormContainer);
                if (modalInstance) {
                    modalInstance.hide();
                }
                //Reload table
                switchView("list", document.getElementById('list-button'))
            })
            .catch(err => {
                console.error('Errore nel caricamento dati:', err);
                changeErrorMessage.innerHTML = `
                    <p class="my-2 text-danger"><i class="bi bi-exclamation-triangle-fill m-2"></i>${err}</p>
                `;
            });
    });
}

function searchVehicle(assignments, term) {
    const found = assignments.find(element => element.vehicle_table == term);
    return found ? found.vehicle : false;
}

function searchTable(assignments, term) {
    const found = assignments.find(element => element.vehicle == term);
    return found ? found.vehicle_table : false;
}

function isInteger(value) {
    return /^\d+$/.test(value);
}