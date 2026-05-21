class Order {
    static generateOrderId() {
        return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    constructor(items) {
        this.orderId = Order.generateOrderId();
        this.items = items;
        this.totalPrice = this.calculateTotalPrice();
        this.isPaid = false;
    }

    calculateTotalPrice() {
        return this.items.reduce((total, item) => total + item.price, 0);
    }
}
