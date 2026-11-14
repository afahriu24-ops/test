$('#sign-in-button').click(function() {
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();

    if (email.length === 0 || password.length === 0) {
        alert('Please enter both email and password.');
        return;
    }

    const user = store.login(email, password);
    if (!user) {
        alert('Invalid email or password.');
        return;
    }

    store.setCurrentUser(user);
    alert('Login successful!');
    if (user.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'shop.html';
    }
});
