// Revenue Management

class Revenue {
    constructor() {
        this.orders = store.getOrders();

        this.updateStats();
        this.displayRevenueTrend();
        this.displayTransactions();
    }

    updateStats() {
        const totalRevenue = this.orders.reduce(function(sum, order) {
            return sum + store.parseAmount(order.amount);
        }, 0);
        const totalOrders = this.orders.length;

        let avgOrder = 0;
        if (totalOrders > 0) {
            avgOrder = totalRevenue / totalOrders;
        }

        $('#revenueTotalRevenue').text('$' + totalRevenue.toFixed(2));
        $('#revenueTotalOrders').text(totalOrders);
        $('#revenueAvgOrder').text('$' + avgOrder.toFixed(2));
        $('#revenueCompletedOrders').text(totalOrders);
    }

    displayRevenueTrend() {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue = store.monthlyRevenue(this.orders);

        let html = '';
        for (let i = 0; i < monthNames.length; i++) {
            const revenue = monthlyRevenue[i];
            let boxClass = 'month-box';
            if (revenue > 0) {
                boxClass = 'month-box has-revenue';
            }
            let displayValue = '$' + revenue.toFixed(0);
            if (revenue >= 1000) {
                displayValue = '$' + (revenue / 1000).toFixed(1) + 'k';
            }

            html = html + '<div class="' + boxClass + '"><p>' + monthNames[i] + '</p><h6>' + displayValue + '</h6></div>';
        }
        $('#revenueTrendGrid').html(html);
    }

    displayTransactions() {
        if (this.orders.length === 0) {
            $('#revenueTableBody').html('<tr><td colspan="5" class="empty-text">No transactions yet</td></tr>');
            return;
        }

        // Orders are shown as transactions, the newest first
        let html = '';
        for (let i = this.orders.length - 1; i >= 0; i--) {
            const order = this.orders[i];

            html = html
                + '<tr>'
                + '<td>#TXN-' + store.pad(i + 1, 4) + '</td>'
                + '<td>' + store.escapeHtml(order.date) + '</td>'
                + '<td>' + store.escapeHtml(order.customer) + '</td>'
                + '<td>' + store.escapeHtml(order.amount) + '</td>'
                + '<td><span class="badge badge-green">Completed</span></td>'
                + '</tr>';
        }
        $('#revenueTableBody').html(html);
    }
}

$(document).ready(function() {
    new Revenue();
});
