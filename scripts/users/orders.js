// Orders Management

class Orders {
    constructor() {
        this.orders = store.getOrders();

        this.attachEventListeners();
        this.displayOrders();
        this.updateStats();
    }

    attachEventListeners() {
        const self = this;

        // The rows are created later, so the clicks are caught on the table body
        $('#ordersTableBody').on('click', '.btn-view', function() {
            self.viewOrder($(this).data('index'));
        });
        $('#ordersTableBody').on('click', '.btn-edit', function() {
            self.editOrder($(this).data('index'));
        });
        $('#ordersTableBody').on('click', '.btn-delete', function() {
            self.deleteOrder($(this).data('index'));
        });
    }

    updateStats() {
        $('#totalOrdersCount').text(this.orders.length);
    }

    displayOrders() {
        if (this.orders.length === 0) {
            $('#ordersTableBody').html('<tr><td colspan="7" class="empty-text">No orders yet</td></tr>');
            return;
        }

        let html = '';
        for (let i = 0; i < this.orders.length; i++) {
            const order = this.orders[i];
            const initials = order.customer.substring(0, 2).toUpperCase();

            let badgeClass = 'badge-pending';
            if (order.status === 'Delivered') {
                badgeClass = 'badge-delivered';
            }

            html = html
                + '<tr>'
                + '<td>' + store.escapeHtml(order.id) + '</td>'
                + '<td><span class="initials">' + store.escapeHtml(initials) + '</span>'
                + '<span class="customer-name">' + store.escapeHtml(order.customer) + '</span></td>'
                + '<td>' + store.escapeHtml(order.product) + '</td>'
                + '<td>' + store.escapeHtml(order.date) + '</td>'
                + '<td>' + store.escapeHtml(order.amount) + '</td>'
                + '<td><span class="badge ' + badgeClass + '">' + store.escapeHtml(order.status) + '</span></td>'
                + '<td>'
                + '<button class="btn btn-view" data-index="' + i + '">View</button>'
                + '<button class="btn btn-edit" data-index="' + i + '">Edit</button>'
                + '<button class="btn btn-delete" data-index="' + i + '">Delete</button>'
                + '</td>'
                + '</tr>';
        }
        $('#ordersTableBody').html(html);
    }

    viewOrder(index) {
        const order = this.orders[index];
        alert('Order Details:\n\nID: ' + order.id
            + '\nCustomer: ' + order.customer
            + '\nProduct: ' + order.product
            + '\nDate: ' + order.date
            + '\nAmount: ' + order.amount
            + '\nStatus: ' + order.status);
    }

    editOrder(index) {
        const order = this.orders[index];
        const newStatus = prompt('Edit Status for Order ' + order.id + ':\n\nCurrent: ' + order.status + '\n\nEnter new status (Pending/Delivered):', order.status);

        if (newStatus === null) {
            return;
        }
        if (newStatus !== 'Pending' && newStatus !== 'Delivered') {
            alert('Invalid status. Please enter "Pending" or "Delivered"');
            return;
        }

        order.status = newStatus;
        store.saveOrders(this.orders);
        this.displayOrders();
        this.updateStats();
        alert('Order updated successfully!');
    }

    deleteOrder(index) {
        const order = this.orders[index];
        if (confirm('Are you sure you want to delete order "' + order.id + '"?')) {
            this.orders.splice(index, 1);
            store.saveOrders(this.orders);
            this.displayOrders();
            this.updateStats();
            alert('Order deleted successfully!');
        }
    }
}

$(document).ready(function() {
    new Orders();
});
