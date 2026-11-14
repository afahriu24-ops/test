$(document).ready(function() {
    const currentUser = store.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Load user info
    $('#name').val(currentUser.name);
    $('#surname').val(currentUser.surname);
    $('#email').val(currentUser.email);
    $('#password').val(currentUser.password);

    let originalData = currentUser;

    function showReadOnly() {
        $('#name, #surname, #email, #password').prop('readonly', true);
        $('#edit-btn').show();
        $('#save-btn, #cancel-btn').hide();
    }

    // Edit button
    $('#edit-btn').click(function() {
        $('#name, #surname, #email, #password').prop('readonly', false);
        $('#edit-btn').hide();
        $('#save-btn, #cancel-btn').show();
    });

    // Cancel button
    $('#cancel-btn').click(function() {
        $('#name').val(originalData.name);
        $('#surname').val(originalData.surname);
        $('#email').val(originalData.email);
        $('#password').val(originalData.password);
        showReadOnly();
    });

    // Save button
    $('#save-btn').click(function() {
        const newName = $('#name').val().trim();
        const newSurname = $('#surname').val().trim();
        const newEmail = $('#email').val().trim();
        const newPassword = $('#password').val().trim();

        if (newName.length === 0 || newSurname.length === 0 || newEmail.length === 0 || newPassword.length === 0) {
            alert('All fields are required.');
            return;
        }

        try {
            const updatedUser = store.updateUser(originalData.email, {
                email: newEmail,
                name: newName,
                surname: newSurname,
                password: newPassword
            });

            store.setCurrentUser(updatedUser);
            originalData = updatedUser;
            showReadOnly();
            alert('Account updated successfully!');
        } catch (error) {
            alert(error.message);
        }
    });

    const logoutDialog = document.getElementById('logout-dialog');

    $('#logout-btn').click(function() {
        logoutDialog.showModal();
    });

    $('#cancel-logout').click(function() {
        logoutDialog.close();
    });

    $('#confirm-logout').click(function() {
        store.removeCurrentUser();
        window.location.href = 'login.html';
    });
});
