class SpecialItem extends MenuItem {
    constructor(name, price, category, chefName) {
        super(name, price, category);
        this.chefName = chefName;
    }

    getDescription() {
        return `Chef's Special: ${this.name} by Chef ${this.chefName}, ${this.category}, priced at Rs.${this.price}.`;
    }
}
