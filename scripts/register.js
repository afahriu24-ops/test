$('#create-account-button').click(function() {
    const firstname = $('#firstname').val().trim();
    const lastname = $('#lastname').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val();
    const confirmPassword = $('#confirm-password').val();

    if (firstname.length === 0 || lastname.length === 0 || email.length === 0 || password.length === 0) {
        alert('All fields are required.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    try {
        store.addUser(new Customer(email, password, firstname, lastname));
        alert('Account created successfully!');
        window.location.href = 'login.html';
    } catch (error) {
        alert(error.message);
    }
});
