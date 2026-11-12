const messageInput = document.getElementById('message-input');
const expiryDateInput = document.getElementById('expiry-date-input');
const expiryTimeInput = document.getElementById('expiry-time-input');
const errorP = document.getElementById('error-p');

async function submitMessage() {
    var newMessage = messageInput.value;
    var expiryDate = expiryDateInput.value;
    var expiryTime = expiryTimeInput.value;
    //Checks correct fields
    if (!newMessage || !expiryDate || expiryDate == 0 || !expiryTime || expiryTime == 0) {
        errorP.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i> Dati incompleti.';
        return
    }

    const token = getValidToken();
    const url = await getApiUrl();
    console.log(expiryDate, expiryTime)
    const response = await fetch(url + "/announcements/update", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            message: newMessage,
            expiry: expiryDate+"T"+expiryTime+":00Z"
        })
    }).then(response => {
        displayMessage();
        errorP.innerHTML = '';
        return response;
    }).catch(err => {
        errorP.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i> Impossibile cambiare il messaggio. Errore di rete.';
        throw new Error("Unable to change message: ", err)
    });
    
    if (!response.ok) {
        errorP.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i> Impossibile cambiare il messaggio. HTTP ' + response.status + " body: "+ await response.text();
    }
}

async function emptyMessage() {
    const token = getValidToken();
    const url = await getApiUrl();
    const response = await fetch(url + "/announcements/empty", {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: null
    }).then(response => {
        displayMessage();
        errorP.innerHTML = '';
        return response;
    }).catch(err => {
        errorP.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i> Impossibile svuotare il messaggio. Errore di rete.';
        throw new Error("Unable to empty message: ", err)
    });
    
    if (!response.ok) {
        errorP.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i> Impossibile svuotare il messaggio. HTTP ' + response.status + " body: "+ await response.text();
    }
}