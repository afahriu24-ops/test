// User classes: every user has the same data, only the role is different.

class User {
    constructor(email, password, name, surname, role) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.surname = surname;
        this.role = role;
        this.joinDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        this.status = "Active";
        this.shoppingCart = [];
    }
}

class Customer extends User {
    constructor(email, password, name, surname) {
        super(email, password, name, surname, "customer");
    }
}

class Admin extends User {
    constructor(email, password, name, surname) {
        super(email, password, name, surname, "admin");
    }
}
