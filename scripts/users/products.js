// Products Management

class Products {
    constructor() {
        this.products = store.getProducts();
        this.categories = store.getCategories();

        this.attachEventListeners();
        this.populateCategoryDropdown();
        this.updateCategoriesList();
        this.updateStats();
        this.displayProducts();
    }

    attachEventListeners() {
        const self = this;

        $('#manageCategoriesBtn').click(function() {
            self.showCategoriesModal();
        });
        $('#addCategoryBtn').click(function() {
            self.addCategory();
        });
        $('#addProductBtn').click(function() {
            self.showAddProductModal();
        });
        $('#saveProductBtn').click(function() {
            self.saveNewProduct();
        });
        $('.modal-close').click(function() {
            $(this).closest('.modal').removeClass('open');
        });

        // The rows are created later, so the clicks are caught on the table body
        $('#productsTableBody').on('click', '.btn-view', function() {
            self.viewProduct($(this).data('index'));
        });
        $('#productsTableBody').on('click', '.btn-edit', function() {
            self.editProduct($(this).data('index'));
        });
        $('#productsTableBody').on('click', '.btn-delete', function() {
            self.deleteProduct($(this).data('index'));
        });
        $('#categoriesList').on('click', '.btn-delete', function() {
            self.deleteCategory($(this).data('index'));
        });
    }

    populateCategoryDropdown() {
        const select = $('#productCategory');
        const currentValue = select.val();

        let html = '<option value="">Select a category</option>';
        for (let i = 0; i < this.categories.length; i++) {
            const category = store.escapeHtml(this.categories[i]);
            html = html + '<option value="' + category + '">' + category + '</option>';
        }
        select.html(html);

        if (currentValue && this.categories.includes(currentValue)) {
            select.val(currentValue);
        }
    }

    updateCategoriesList() {
        if (this.categories.length === 0) {
            $('#categoriesList').html('<p class="empty-text">No categories added yet.</p>');
            return;
        }

        let html = '';
        for (let i = 0; i < this.categories.length; i++) {
            html = html
                + '<div class="category-row">'
                + '<span>' + store.escapeHtml(this.categories[i]) + '</span>'
                + '<button class="btn btn-delete" data-index="' + i + '">Delete</button>'
                + '</div>';
        }
        $('#categoriesList').html(html);
    }

    updateStats() {
        const totalProducts = this.products.length;
        const inStockProducts = this.products.filter(function(p) {
            return p.stock > 0;
        }).length;
        const lowStockProducts = this.products.filter(function(p) {
            return p.stock > 0 && p.stock < 50;
        }).length;
        const outOfStockProducts = this.products.filter(function(p) {
            return p.stock === 0;
        }).length;

        $('#totalProductsCount').text(totalProducts);
        $('#inStockCount').text(inStockProducts);
        $('#lowStockCount').text(lowStockProducts);
        $('#outOfStockCount').text(outOfStockProducts);

        $('#totalProductsChange').text(totalProducts + ' total products');
        $('#inStockChange').text(inStockProducts > 0 ? 'Good availability' : 'No products in stock');
        $('#lowStockChange').text(lowStockProducts > 0 ? 'Needs attention' : 'All stocked well');
        $('#outOfStockChange').text(outOfStockProducts + ' out of stock');
    }

    displayProducts() {
        let html = '';
        for (let i = 0; i < this.products.length; i++) {
            const product = this.products[i];

            let stockBadge = 'badge-green';
            if (product.status === 'Out of Stock') {
                stockBadge = 'badge-red';
            } else if (product.status === 'Low Stock') {
                stockBadge = 'badge-yellow';
            }

            html = html
                + '<tr>'
                + '<td>' + store.escapeHtml(product.id) + '</td>'
                + '<td><span class="product-icon">📦</span>' + store.escapeHtml(product.name) + '</td>'
                + '<td>' + store.escapeHtml(product.category) + '</td>'
                + '<td>' + store.escapeHtml(product.price) + '</td>'
                + '<td><span class="badge ' + stockBadge + '">' + product.stock + ' units</span></td>'
                + '<td>' + product.sales + '</td>'
                + '<td><span class="badge badge-green">' + product.status + '</span></td>'
                + '<td>'
                + '<button class="btn btn-view" data-index="' + i + '">View</button>'
                + '<button class="btn btn-edit" data-index="' + i + '">Edit</button>'
                + '<button class="btn btn-delete" data-index="' + i + '">Delete</button>'
                + '</td>'
                + '</tr>';
        }
        $('#productsTableBody').html(html);
    }

    viewProduct(index) {
        const product = this.products[index];
        alert('Product Details:\n\nID: ' + product.id
            + '\nName: ' + product.name
            + '\nCategory: ' + product.category
            + '\nPrice: ' + product.price
            + '\nStock: ' + product.stock + ' units'
            + '\nTotal Sales: ' + product.sales
            + '\nStatus: ' + product.status);
    }

    editProduct(index) {
        const product = this.products[index];
        const newStock = prompt('Edit Stock for ' + product.name + ':\n\nCurrent Stock: ' + product.stock + '\n\nEnter new stock quantity:', product.stock);

        if (newStock === null) {
            return;
        }
        if (newStock.trim().length === 0 || isNaN(newStock) || parseInt(newStock, 10) < 0) {
            alert('Please enter a valid stock quantity (cannot be negative)');
            return;
        }

        product.stock = parseInt(newStock, 10);
        product.status = store.stockStatus(product.stock);
        store.saveProducts(this.products);
        this.displayProducts();
        this.updateStats();
        alert('Product updated successfully!');
    }

    deleteProduct(index) {
        const product = this.products[index];
        if (confirm('Are you sure you want to delete "' + product.name + '"?')) {
            this.products.splice(index, 1);
            store.saveProducts(this.products);
            this.displayProducts();
            this.updateStats();
            alert('Product deleted successfully!');
        }
    }

    showAddProductModal() {
        $('#productName').val('');
        $('#productCategory').val('');
        $('#productPrice').val('');
        $('#productStock').val('');
        $('#addProductModal').addClass('open');
    }

    saveNewProduct() {
        const name = $('#productName').val().trim();
        const category = $('#productCategory').val();
        const price = $('#productPrice').val().trim();
        const stockValue = $('#productStock').val().trim();

        if (name.length === 0) {
            alert('Please enter a product name');
            return;
        }

        const existingProduct = this.products.find(function(p) {
            return p.name.toLowerCase() === name.toLowerCase();
        });
        if (existingProduct) {
            alert('Product "' + name + '" is currently in stock. Please use a different product name.');
            return;
        }

        if (!category) {
            alert('Please select a category');
            return;
        }

        if (price.length === 0) {
            alert('Please enter a price');
            return;
        }

        if (stockValue.length === 0 || isNaN(stockValue) || parseInt(stockValue, 10) < 0) {
            alert('Please enter a valid stock quantity (cannot be negative)');
            return;
        }

        const stock = parseInt(stockValue, 10);

        this.products.push({
            id: store.nextProductId(),
            name: name,
            category: category,
            price: price,
            stock: stock,
            sales: 0,
            status: store.stockStatus(stock)
        });
        store.saveProducts(this.products);
        this.displayProducts();
        this.updateStats();

        $('#addProductModal').removeClass('open');
        alert('Product added successfully!');
    }

    showCategoriesModal() {
        this.updateCategoriesList();
        $('#newCategory').val('');
        $('#manageCategoriesModal').addClass('open');
    }

    addCategory() {
        const categoryName = $('#newCategory').val().trim();

        if (categoryName.length === 0) {
            alert('Please enter a category name');
            return;
        }

        if (this.categories.includes(categoryName)) {
            alert('This category already exists');
            return;
        }

        this.categories.push(categoryName);
        store.saveCategories(this.categories);
        this.populateCategoryDropdown();
        this.updateCategoriesList();
        $('#newCategory').val('');
    }

    deleteCategory(index) {
        const category = this.categories[index];
        const productsInCategory = this.products.filter(function(p) {
            return p.category === category;
        }).length;

        let confirmMessage = 'Are you sure you want to delete "' + category + '"?';
        if (productsInCategory > 0) {
            confirmMessage = confirmMessage + ' This will also delete ' + productsInCategory + ' product(s) in this category.';
        }

        if (confirm(confirmMessage)) {
            this.products = this.products.filter(function(p) {
                return p.category !== category;
            });
            store.saveProducts(this.products);

            this.categories.splice(index, 1);
            store.saveCategories(this.categories);

            this.populateCategoryDropdown();
            this.updateCategoriesList();
            this.displayProducts();
            this.updateStats();

            alert('Category "' + category + '" and ' + productsInCategory + ' product(s) deleted successfully!');
        }
    }
}

$(document).ready(function() {
    new Products();
});
