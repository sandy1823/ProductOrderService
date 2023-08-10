class Refund {
	constructor(refundRawObject) {
		this.id = refundRawObject.id;
		this.refund_id = refundRawObject.refund_id;
		this.razorpay_order_id = refundRawObject.razorpay_order_id;
		this.order_id = refundRawObject.order_id;
		this.amount = refundRawObject.amount;
		this.speed_requested = refundRawObject.speed_requested;
		this.notes = refundRawObject.notes;
		this.created_at = orderRawObject.created_at;
		this.updated_at = orderRawObject.updated_at;
	}
	toCamelCase() {
		return {
			id: this.id,
			refundId: this.refund_id,
			razorpayOrderId: this.razorpay_order_id,
			orderId: this.order_id,
			amount: this.amount,
			speedRequested: this.speed_requested,
			notes: this.notes,
			createdAt: this.created_at,
			updatedAt: this.updated_at,
		};
	}
}

module.exports = Refund;
