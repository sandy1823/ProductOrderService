class Order {
	constructor(orderRawObject) {
		this.order_id = orderRawObject.order_id;
		this.invoice_id = orderRawObject.invoice_id;
		this.razorpay_order_id = orderRawObject.razorpay_order_id;
		this.buyer_id = orderRawObject.buyer_id;
		this.user_id = orderRawObject.user_id;
		this.client_id = orderRawObject.client_id;
		this.receipt = orderRawObject.receipt;
		this.status = {
			current_status: orderRawObject.status,
			before_status: orderRawObject.before_status,
			after_status: orderRawObject.after_status,
		};
		this.remarks = orderRawObject.remarks;
		this.updated_by = orderRawObject.updated_by;
		this.created_at = orderRawObject.created_at;
		this.updated_at = orderRawObject.updated_at;
		this.cancelled_by = orderRawObject.cancelled_by;
	}
	toCamelCase() {
		return {
			orderId: this.order_id,
			invoiceId: this.invoice_id,
			razorpayOrderId: this.razorpay_order_id,
			buyerId: this.buyer_id,
			userId: this.user_id,
			clientId: this.client_id,
			receipt: this.receipt,
			status: {
				currentStatus: this.status.current_status,
				beforeStatus: this.status.before_status,
				afterStatus: this.status.after_status,
			},
			remarks: this.remarks,
			updatedBy: this.updated_by,
			createdAt: this.created_at,
			updatedAt: this.updated_at,
			cancelledBy: this.cancelled_by,
		};
	}
}

module.exports = Order;
