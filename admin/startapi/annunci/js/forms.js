const messageInput = document.getElementById('message-input');
const errorP = document.getElementById('error-p');

async function submitMessage() {
    var newMessage = messageInput.value;

    const token = getValidToken();
    const url = await getApiUrl();
    const response = await fetch(url + "/announcements/update", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            message: newMessage
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