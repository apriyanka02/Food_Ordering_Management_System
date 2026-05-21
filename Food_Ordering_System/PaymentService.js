class PaymentService {
    makePayment(order) {
        return new Promise((resolve, reject) => {
            if (!order) {
                reject("Place an order before making payment.");
                return;
            }

            setTimeout(() => {
                order.isPaid = true;
                resolve(`Payment of Rs.${order.totalPrice} completed successfully.`);
            }, 1600);
        });
    }
}
