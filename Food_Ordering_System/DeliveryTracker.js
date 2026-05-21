class DeliveryTracker {
    constructor(statuses) {
        this.statuses = statuses;
    }

    wait(milliseconds) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    async track(updateStatus, startIndex = 0) {
        for (let index = startIndex; index < this.statuses.length; index++) {
            updateStatus(index);
            await this.wait(1400);
        }
    }
}
