class MenuItem {
    constructor(name, price, category) {
        this.name = name;
        this.price = price;
        this.category = category;
    }

    getDescription() {
        return `${this.name} is a ${this.category} item priced at Rs.${this.price}.`;
    }
}
