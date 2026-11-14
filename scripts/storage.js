// There is no server in this project, so all the data is kept in the browser.
//   localStorage   -> users, products, categories, orders (stay after the browser is closed)
//   sessionStorage -> the user that is logged in right now

const store = {

    // ---------- basic helpers ----------

    read: function(key, defaultValue) {
        try {
            const text = localStorage.getItem(key);
            if (text === null) {
                return defaultValue;
            }
            return JSON.parse(text);
        } catch (error) {
            return defaultValue;
        }
    },

    write: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    today: function() {
        return new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    },

    // "$12.50" -> 12.5
    parseAmount: function(text) {
        let value = String(text).trim();
        if (value.startsWith("$")) {
            value = value.substring(1);
        }
        return parseFloat(value) || 0;
    },

    // 7 -> "007"
    pad: function(number, size) {
        let text = String(number);
        while (text.length < size) {
            text = "0" + text;
        }
        return text;
    },

    // Shows text on the page as text (so "<b>" is not read as HTML)
    escapeHtml: function(text) {
        return $("<div>").text(text).html();
    },

    stockStatus: function(stock) {
        if (stock === 0) {
            return "Out of Stock";
        }
        if (stock < 50) {
            return "Low Stock";
        }
        return "Active";
    },

    // ---------- logged in user (sessionStorage) ----------

    getCurrentUser: function() {
        return JSON.parse(sessionStorage.getItem("currentUser"));
    },

    setCurrentUser: function(user) {
        sessionStorage.setItem("currentUser", JSON.stringify(user));
    },

    removeCurrentUser: function() {
        sessionStorage.removeItem("currentUser");
    },

    // ---------- users ----------

    getUsers: function() {
        return this.read("users", []);
    },

    saveUsers: function(users) {
        this.write("users", users);
    },

    findUser: function(email) {
        return this.getUsers().find(function(user) {
            return user.email === email;
        });
    },

    login: function(email, password) {
        return this.getUsers().find(function(user) {
            return user.email === email && user.password === password;
        });
    },

    addUser: function(user) {
        if (this.findUser(user.email)) {
            throw new Error("A user with this email already exists.");
        }
        const users = this.getUsers();
        users.push(user);
        this.saveUsers(users);
    },

    // changes = only the fields that must be changed, for example { status: "Inactive" }
    updateUser: function(oldEmail, changes) {
        const users = this.getUsers();
        const user = users.find(function(u) {
            return u.email === oldEmail;
        });
        if (!user) {
            throw new Error("User not found.");
        }
        if (changes.email && changes.email !== oldEmail && this.findUser(changes.email)) {
            throw new Error("Email already in use.");
        }
        for (const key in changes) {
            user[key] = changes[key];
        }
        this.saveUsers(users);
        return user;
    },

    deleteUser: function(email) {
        const users = this.getUsers().filter(function(user) {
            return user.email !== email;
        });
        this.saveUsers(users);
    },

    getCustomers: function() {
        return this.getUsers().filter(function(user) {
            return user.role === "customer";
        });
    },

    saveCart: function(email, cart) {
        this.updateUser(email, { shoppingCart: cart });
    },

    // ---------- products and categories ----------

    getProducts: function() {
        return this.read("products", []);
    },

    saveProducts: function(products) {
        this.write("products", products);
    },

    getCategories: function() {
        return this.read("productCategories", []);
    },

    saveCategories: function(categories) {
        this.write("productCategories", categories);
    },

    // #PRD-001, #PRD-002 ... (one more than the biggest number used)
    nextProductId: function() {
        const products = this.getProducts();
        let biggest = 0;
        for (let i = 0; i < products.length; i++) {
            const number = parseInt(products[i].id.substring(5), 10);
            if (number > biggest) {
                biggest = number;
            }
        }
        return "#PRD-" + this.pad(biggest + 1, 3);
    },

    // ---------- orders ----------

    getOrders: function() {
        return this.read("orders", []);
    },

    saveOrders: function(orders) {
        this.write("orders", orders);
    },

    // Turns the cart of a customer into an order, lowers the stock and empties the cart
    checkout: function(user, cart) {
        if (cart.length === 0) {
            throw new Error("Your bag is empty.");
        }

        const products = this.getProducts();
        let total = 0;
        let summary = "";
        const items = [];

        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            total = total + this.parseAmount(item.price) * item.quantity;

            if (i > 0) {
                summary = summary + ", ";
            }
            summary = summary + item.name + " × " + item.quantity;
            items.push({ name: item.name, quantity: item.quantity });

            const product = products.find(function(p) {
                return p.name === item.name;
            });
            if (product) {
                product.stock = Math.max(0, product.stock - item.quantity);
                product.status = this.stockStatus(product.stock);
            }
        }

        const order = {
            id: "#ORD-" + Date.now(),
            customer: (user.name + " " + user.surname).trim(),
            product: summary,
            items: items,
            date: this.today(),
            amount: "$" + total.toFixed(2),
            status: "Delivered"
        };

        const orders = this.getOrders();
        orders.push(order);
        this.saveOrders(orders);
        this.saveProducts(products);
        this.saveCart(user.email, []);
        return order;
    },

    // Revenue of every month of this year: [Jan, Feb, ... Dec]
    monthlyRevenue: function(orders) {
        const months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < orders.length; i++) {
            const orderDate = new Date(orders[i].date);
            if (orderDate.getFullYear() === currentYear) {
                months[orderDate.getMonth()] = months[orderDate.getMonth()] + this.parseAmount(orders[i].amount);
            }
        }
        return months;
    },

    // ---------- first start ----------

    // The store always needs an admin and some categories
    seed: function() {
        if (this.getUsers().length === 0) {
            this.saveUsers([new Admin("admin@gmail.com", "admin123", "admin", "admin")]);
        }
        if (this.getCategories().length === 0) {
            this.saveCategories(["Footwear", "Accessories", "Headwear", "Clothing", "Electronics"]);
        }
    }
};

store.seed();
