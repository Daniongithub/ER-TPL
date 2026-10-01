function getValidToken() {
    const token = sessionStorage.getItem("access_token");
    const expiry = sessionStorage.getItem("token_expiry");

    if (!token || !expiry || Date.now() > Number(expiry)) {
        return null; // assente o scaduto
    }
    return token;
}

redirectToLogin()