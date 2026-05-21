class FoodOrderingApp {
    constructor() {
        this.menuItems = [
            new MenuItem("Veg Burger", 120, "Fast Food"),
            new MenuItem("Chicken Biryani", 220, "Main Course"),
            new MenuItem("Paneer Pizza", 260, "Italian"),
            new MenuItem("Chocolate Brownie", 110, "Dessert"),
            new SpecialItem("Truffle Pasta", 340, "Italian", "Aarav"),
            new SpecialItem("Royal Thali", 390, "Indian", "Meera")
        ];

        this.statuses = [
            "Order Placed",
            "Payment Confirmed",
            "Preparing Food",
            "Out for Delivery",
            "Delivered"
        ];

        this.currentOrder = null;
        this.paymentDone = false;
        this.trackingStarted = false;
        this.paymentService = new PaymentService();
        this.deliveryTracker = new DeliveryTracker(this.statuses);

        this.menuList = document.getElementById("menuList");
        this.placeOrderBtn = document.getElementById("placeOrderBtn");
        this.goToPaymentBtn = document.getElementById("goToPaymentBtn");
        this.payNowBtn = document.getElementById("payNowBtn");
        this.messageBox = document.getElementById("messageBox");
        this.orderDetails = document.getElementById("orderDetails");
        this.paymentSummary = document.getElementById("paymentSummary");
        this.paymentAmount = document.getElementById("paymentAmount");
        this.statusList = document.getElementById("statusList");
        this.customerMessage = document.getElementById("customerMessage");
        this.pageButtons = document.querySelectorAll("[data-page]");

        this.init();
    }

    init() {
        this.showMenu();
        this.renderStatuses();
        this.bindEvents();
    }

    showMenu() {
        this.menuItems.forEach((item, index) => {
            const card = document.createElement("label");
            card.className = "menu-card";
            card.innerHTML = `
                <input type="checkbox" value="${index}" class="food-check">
                <span class="item-category">${item.category}</span>
                <h3 class="item-name">${item.name}</h3>
                <p class="item-description">${item.getDescription()}</p>
                <p class="item-price">Rs.${item.price}</p>
            `;
            this.menuList.appendChild(card);
        });
    }

    bindEvents() {
        this.menuList.addEventListener("change", (event) => {
            if (event.target.classList.contains("food-check")) {
                event.target.closest(".menu-card").classList.toggle("selected", event.target.checked);
            }
        });

        this.pageButtons.forEach((button) => {
            button.addEventListener("click", () => this.showPage(button.dataset.page));
        });

        this.placeOrderBtn.addEventListener("click", () => this.placeOrder());
        this.goToPaymentBtn.addEventListener("click", () => this.showPage("paymentPage"));
        this.payNowBtn.addEventListener("click", () => this.payNow());
    }

    showPage(pageId) {
        document.querySelectorAll(".app-page").forEach((page) => {
            page.classList.toggle("active", page.id === pageId);
        });

        document.querySelectorAll(".step-tab").forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.page === pageId);
        });
    }

    getSelectedItems() {
        const checkedItems = document.querySelectorAll(".food-check:checked");
        return Array.from(checkedItems).map((checkbox) => this.menuItems[checkbox.value]);
    }

    placeOrder() {
        const selectedItems = this.getSelectedItems();

        if (selectedItems.length === 0) {
            this.showMessage("Please select at least one food item before placing an order.", "error");
            return;
        }

        this.currentOrder = new Order(selectedItems);
        this.paymentDone = false;
        this.trackingStarted = false;
        this.goToPaymentBtn.disabled = false;
        this.payNowBtn.disabled = false;
        this.renderStatuses(0);
        this.displayOrderDetails();
        this.displayPaymentSummary();
        this.customerMessage.textContent = "Payment pending. Your delicious order is almost on its way.";
        this.showMessage("Order placed successfully. Review it and continue to payment.", "success");
        this.showPage("orderPage");
    }

    displayOrderDetails() {
        const itemRows = this.currentOrder.items.map((item) => `
            <div class="order-item">
                <span>${item.name}</span>
                <strong>Rs.${item.price}</strong>
            </div>
        `).join("");

        this.orderDetails.innerHTML = `
            <strong>Order ID:</strong> ${this.currentOrder.orderId}<br>
            <strong>Items:</strong> ${this.currentOrder.items.length}<br>
            ${itemRows}
            <div class="order-total">Total: Rs.${this.currentOrder.totalPrice}</div>
            <strong>Payment:</strong> ${this.currentOrder.isPaid ? "Paid" : "Pending"}
        `;
    }

    displayPaymentSummary() {
        this.paymentAmount.textContent = `Rs.${this.currentOrder.totalPrice}`;
        this.paymentSummary.innerHTML = `
            <strong>Order ID:</strong> ${this.currentOrder.orderId}<br>
            <strong>Customer Cart:</strong> ${this.currentOrder.items.map((item) => item.name).join(", ")}<br>
            <div class="order-total">Amount to Pay: Rs.${this.currentOrder.totalPrice}</div>
        `;
    }

    async payNow() {
        if (!this.currentOrder) {
            this.showMessage("Payment is allowed only after placing an order.", "error");
            return;
        }

        if (this.paymentDone) {
            this.showMessage("Payment has already been completed for this order.", "error");
            return;
        }

        this.payNowBtn.disabled = true;
        this.placeOrderBtn.disabled = true;
        this.goToPaymentBtn.disabled = true;
        this.showMessage("Processing your secure payment. Please wait...", "info");

        try {
            const paymentMessage = await this.paymentService.makePayment(this.currentOrder);
            this.paymentDone = true;
            this.displayOrderDetails();
            this.displayPaymentSummary();
            this.customerMessage.textContent = "Payment confirmed. Thank you for ordering with us. Your food is being prepared with extra care!";
            this.showMessage(`${paymentMessage} Thank you! Your meal journey has started.`, "success");
            this.showPage("trackingPage");
            await this.startDeliveryTracking();
        } catch (error) {
            this.payNowBtn.disabled = false;
            this.placeOrderBtn.disabled = false;
            this.goToPaymentBtn.disabled = false;
            this.showMessage(error, "error");
        }
    }

    async startDeliveryTracking() {
        if (this.trackingStarted) {
            return;
        }

        this.trackingStarted = true;
        await this.deliveryTracker.track((statusIndex) => {
            this.renderStatuses(statusIndex);
            this.showMessage(`Current status: ${this.statuses[statusIndex]}`, "info");
        }, 1);

        this.renderStatuses(this.statuses.length);
        this.placeOrderBtn.disabled = false;
        this.customerMessage.textContent = "Delivered! We hope this meal makes your day brighter. Thank you for choosing us!";
        this.showMessage("Your order has been delivered. Enjoy your meal!", "success");
    }

    renderStatuses(activeIndex = -1) {
        this.statusList.innerHTML = "";

        this.statuses.forEach((status, index) => {
            const statusItem = document.createElement("li");
            statusItem.className = "status-item";

            if (activeIndex >= 0 && index < activeIndex) {
                statusItem.classList.add("done");
            }

            if (index === activeIndex) {
                statusItem.classList.add("active");
            }

            statusItem.innerHTML = `
                <span class="status-dot"></span>
                <span>${status}</span>
            `;
            this.statusList.appendChild(statusItem);
        });
    }

    showMessage(message, type) {
        this.messageBox.textContent = message;
        this.messageBox.className = `message-box ${type}`;
    }
}
