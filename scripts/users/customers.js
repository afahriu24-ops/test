// Customers Management

class Customers {
    constructor() {
        this.customers = [];
        this.attachEventListeners();
        this.loadCustomers();
    }

    attachEventListeners() {
        const self = this;

        // The rows are created later, so the clicks are caught on the table body
        $('#customersTableBody').on('click', '.btn-view', function() {
            self.viewCustomer($(this).data('index'));
        });
        $('#customersTableBody').on('click', '.btn-edit', function() {
            self.editCustomer($(this).data('index'));
        });
        $('#customersTableBody').on('click', '.btn-delete', function() {
            self.deleteCustomer($(this).data('index'));
        });
    }

    loadCustomers() {
        const allCustomers = store.getCustomers();
        const allOrders = store.getOrders();

        this.customers = allCustomers.map(function(customer, index) {
            const customerName = (customer.name + ' ' + customer.surname).trim();
            const customerOrders = allOrders.filter(function(order) {
                return order.customer === customerName;
            });
            const totalSpent = customerOrders.reduce(function(sum, order) {
                return sum + store.parseAmount(order.amount);
            }, 0);

            return {
                id: '#CUST-' + store.pad(index + 1, 3),
                name: customerName,
                email: customer.email,
                orders: customerOrders.length,
                spent: '$' + totalSpent.toFixed(2),
                joinDate: customer.joinDate,
                status: customer.status
            };
        });

        this.displayCustomers();
        this.updateStats();
    }

    updateStats() {
        const activeCustomers = this.customers.filter(function(c) {
            return c.status === 'Active';
        }).length;

        $('#totalCustomersCount').text(this.customers.length);
        $('#activeCustomersCount').text(activeCustomers);
    }

    displayCustomers() {
        const colors = ['#28a745', '#0d6efd', '#fd7e14', '#28a745', '#dc3545'];

        let html = '';
        for (let i = 0; i < this.customers.length; i++) {
            const customer = this.customers[i];
            const initials = customer.name.split(' ').map(function(part) {
                return part[0];
            }).join('').toUpperCase();

            let statusBadge = 'badge-yellow';
            if (customer.status === 'Active') {
                statusBadge = 'badge-green';
            }

            html = html
                + '<tr>'
                + '<td>' + customer.id + '</td>'
                + '<td><span class="avatar" style="background-color: ' + colors[i % colors.length] + ';">'
                + store.escapeHtml(initials) + '</span>' + store.escapeHtml(customer.name) + '</td>'
                + '<td>' + store.escapeHtml(customer.email) + '</td>'
                + '<td>' + customer.orders + '</td>'
                + '<td>' + customer.spent + '</td>'
                + '<td>' + store.escapeHtml(customer.joinDate) + '</td>'
                + '<td><span class="badge ' + statusBadge + '">' + store.escapeHtml(customer.status) + '</span></td>'
                + '<td>'
                + '<button class="btn btn-view" data-index="' + i + '">View</button>'
                + '<button class="btn btn-edit" data-index="' + i + '">Edit</button>'
                + '<button class="btn btn-delete" data-index="' + i + '">Delete</button>'
                + '</td>'
                + '</tr>';
        }
        $('#customersTableBody').html(html);
    }

    viewCustomer(index) {
        const customer = this.customers[index];
        alert('Customer Details:\n\nID: ' + customer.id
            + '\nName: ' + customer.name
            + '\nEmail: ' + customer.email
            + '\nTotal Orders: ' + customer.orders
            + '\nTotal Spent: ' + customer.spent
            + '\nJoin Date: ' + customer.joinDate
            + '\nStatus: ' + customer.status);
    }

    editCustomer(index) {
        const customer = this.customers[index];
        const newStatus = prompt('Edit Status for ' + customer.name + ':\n\nCurrent: ' + customer.status + '\n\nEnter new status (Active/Inactive):', customer.status);

        if (newStatus === null) {
            return;
        }
        if (newStatus !== 'Active' && newStatus !== 'Inactive') {
            alert('Invalid status. Please enter "Active" or "Inactive"');
            return;
        }

        try {
            store.updateUser(customer.email, { status: newStatus });
            this.loadCustomers();
            alert('Customer updated successfully!');
        } catch (error) {
            alert(error.message);
        }
    }

    deleteCustomer(index) {
        const customer = this.customers[index];
        if (confirm('Are you sure you want to delete "' + customer.name + '"?')) {
            store.deleteUser(customer.email);
            this.loadCustomers();
            alert('Customer deleted successfully!');
        }
    }
}

$(document).ready(function() {
    new Customers();
});
