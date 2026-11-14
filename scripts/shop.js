const currentCustomer = store.getCurrentUser();
const accountButton = $('#account_button');
const accountLabel = $('#account_label');
const cartButton = $('#cart_button');
const cartPanel = $('#cart_panel');
const cartItemsContainer = $('#cart_items');
const cartClose = $('#cart_close');
const checkoutButton = $('#checkout_button');
const productGrid = $('.product-grid');
const resultsCount = $('.results-count');
const categoryList = $('.category-list');
const productSearch = $('.nav-search input');

let allProducts = [];
let categoryItems = ['All Products'];
let activeCategory = 'All Products';
let searchTerm = '';

function isLoggedIn() {
    return currentCustomer && currentCustomer.name;
}

function getCart() {
    if (currentCustomer && currentCustomer.shoppingCart) {
        return currentCustomer.shoppingCart;
    }
    return [];
}

// Saves the cart in the users list and in the session
function saveCurrentCustomer() {
    store.saveCart(currentCustomer.email, currentCustomer.shoppingCart);
    store.setCurrentUser(currentCustomer);
}

function calculateCartTotal(cart) {
    return cart.reduce(function(total, item) {
        return total + store.parseAmount(item.price) * item.quantity;
    }, 0);
}

function normalizePrice(price) {
    if (typeof price === 'number') {
        return '$' + price.toFixed(2);
    }

    if (typeof price !== 'string') {
        return '$0.00';
    }

    const trimmedPrice = price.trim();
    if (trimmedPrice.startsWith('$')) {
        return trimmedPrice;
    }
    return '$' + trimmedPrice;
}

function loadProducts() {
    allProducts = store.getProducts().map(function(product) {
        return {
            id: product.id,
            name: product.name,
            category: product.category,
            price: normalizePrice(product.price),
            stock: product.stock
        };
    });
}

function getFilteredProducts() {
    return allProducts.filter(function(product) {
        const matchesCategory = activeCategory === 'All Products' || product.category === activeCategory;
        const matchesSearch = searchTerm.length === 0
            || product.name.toLowerCase().includes(searchTerm)
            || product.category.toLowerCase().includes(searchTerm)
            || product.id.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });
}

function renderCategories() {
    const counts = allProducts.reduce(function(categoryCounts, product) {
        categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        return categoryCounts;
    }, {});

    categoryItems = ['All Products'].concat(Object.keys(counts).sort());

    let html = '';
    for (let i = 0; i < categoryItems.length; i++) {
        const category = categoryItems[i];
        let count = counts[category];
        if (category === 'All Products') {
            count = allProducts.length;
        }
        let activeClass = '';
        if (category === activeCategory) {
            activeClass = 'active';
        }

        html = html + '<li><a href="#" class="' + activeClass + '" data-index="' + i + '">'
            + store.escapeHtml(category) + ' <span class="count">' + count + '</span></a></li>';
    }
    categoryList.html(html);
}

function renderProducts() {
    const filteredProducts = getFilteredProducts();
    let countText = filteredProducts.length + ' product';
    if (filteredProducts.length !== 1) {
        countText = countText + 's';
    }
    resultsCount.text(countText);

    if (filteredProducts.length === 0) {
        productGrid.html(
            '<div class="product-card empty-message">'
            + '<p class="product-category">No products found</p>'
            + '<h3 class="product-name">Try another search or category.</h3>'
            + '</div>'
        );
        return;
    }

    let html = '';
    for (let i = 0; i < filteredProducts.length; i++) {
        const product = filteredProducts[i];
        const inStock = product.stock > 0;
        let stockLabel = 'Out of stock';
        let stockBadgeClass = 'badge-sale';
        let buttonDisabled = 'disabled';
        let buttonLabel = 'Unavailable';
        if (inStock) {
            stockLabel = product.stock + ' in stock';
            stockBadgeClass = 'badge-new';
            buttonDisabled = '';
            buttonLabel = 'Add to bag';
        }

        html = html
            + '<article class="product-card" data-id="' + store.escapeHtml(product.id) + '">'
            + '<div class="product-img">'
            + '<span class="product-badge ' + stockBadgeClass + '">' + stockLabel + '</span>'
            + '</div>'
            + '<div class="product-info">'
            + '<p class="product-category">' + store.escapeHtml(product.category) + '</p>'
            + '<h3 class="product-name">' + store.escapeHtml(product.name) + '</h3>'
            + '<div class="product-footer">'
            + '<span class="price-current">' + store.escapeHtml(product.price) + '</span>'
            + '<button class="add-to-cart" ' + buttonDisabled + '>' + buttonLabel + '</button>'
            + '</div>'
            + '</div>'
            + '</article>';
    }
    productGrid.html(html);
}

function refreshShopProducts() {
    loadProducts();
    renderCategories();
    renderProducts();
}

function updateCartTotal(cart) {
    const total = calculateCartTotal(cart);
    $('#cart_total strong').text('$' + total.toFixed(2));
}

function renderCartItems() {
    const cart = getCart();
    if (cart.length === 0) {
        cartItemsContainer.html('<div class="cart-empty">Your bag is empty.</div>');
        checkoutButton.prop('disabled', true);
        updateCartTotal([]);
        return;
    }

    let html = '';
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        html = html
            + '<div class="cart-item">'
            + '<div class="cart-item-content">'
            + '<div class="cart-item-name">' + store.escapeHtml(item.name) + '</div>'
            + '<div class="cart-item-meta">' + store.escapeHtml(item.category) + ' • Qty ' + item.quantity + '</div>'
            + '</div>'
            + '<div class="cart-item-price">' + store.escapeHtml(item.price) + '</div>'
            + '<button class="cart-item-delete" data-index="' + i + '">×</button>'
            + '</div>';
    }

    cartItemsContainer.html(html);
    checkoutButton.prop('disabled', false);
    updateCartTotal(cart);
}

function closeCart() {
    cartPanel.addClass('hidden');
}

if (isLoggedIn()) {
    accountLabel.text(currentCustomer.name);
    accountButton.attr('title', 'Account');
} else {
    accountLabel.text('Login');
    accountButton.attr('title', 'Login');
}

accountButton.click(function() {
    if (isLoggedIn()) {
        window.location.href = 'account.html';
    } else {
        window.location.href = 'login.html';
    }
});

cartButton.click(function(event) {
    event.stopPropagation();
    if (!isLoggedIn()) {
        alert('Please log in to view your shopping bag.');
        return;
    }

    renderCartItems();
    cartPanel.toggleClass('hidden');
});

cartClose.click(closeCart);

checkoutButton.click(function() {
    if (!isLoggedIn()) {
        return;
    }
    const cart = getCart();
    if (cart.length === 0) {
        return;
    }

    try {
        store.checkout(currentCustomer, cart);
        currentCustomer.shoppingCart = [];
        store.setCurrentUser(currentCustomer);
        refreshShopProducts();
        renderCartItems();
        closeCart();
        alert('Your order has been placed.');
    } catch (error) {
        alert(error.message);
    }
});

// A click anywhere else closes the cart
$(document).click(function(event) {
    if (!cartPanel.hasClass('hidden') && $(event.target).closest('#cart_panel, #cart_button').length === 0) {
        closeCart();
    }
});

$(document).on('click', '.cart-item-delete', function() {
    const index = $(this).data('index');
    const cart = getCart();
    cart.splice(index, 1);
    currentCustomer.shoppingCart = cart;
    saveCurrentCustomer();
    renderCartItems();
});

$(document).on('click', '.category-list a', function(event) {
    event.preventDefault();
    activeCategory = categoryItems[$(this).data('index')];
    renderCategories();
    renderProducts();
});

productSearch.on('input', function() {
    searchTerm = $(this).val().trim().toLowerCase();
    renderProducts();
});

$(document).on('click', '.add-to-cart', function() {
    if (!isLoggedIn()) {
        alert('Please log in to add items to your bag.');
        return;
    }

    const productId = $(this).closest('.product-card').data('id');
    const product = allProducts.find(function(p) {
        return p.id === productId;
    });
    if (!product || product.stock <= 0) {
        return;
    }

    const cart = getCart();
    const existingItem = cart.find(function(item) {
        return item.name === product.name;
    });

    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            alert('Sorry, only ' + product.stock + ' unit(s) of "' + product.name + '" available.');
            return;
        }
        existingItem.quantity = existingItem.quantity + 1;
    } else {
        cart.push({ name: product.name, category: product.category, price: product.price, quantity: 1 });
    }

    currentCustomer.shoppingCart = cart;
    saveCurrentCustomer();

    alert('Added "' + product.name + '" to your bag.');
    if (!cartPanel.hasClass('hidden')) {
        renderCartItems();
    }
});

// Initialize shop on page load
$(document).ready(function() {
    refreshShopProducts();
});
