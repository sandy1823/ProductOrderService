module.exports = {
	PING: '/ping',

	ORDERBASEURL: '/order',
	ADDORDER: '/addOrder',
	ADDORDERWITHOUTPAYMENT: '/addOrderWithoutPayment',
	ADDPENDINGORDER: '/addPendingOrder',
	GETORDERBYID: '/getOrderById/:orderId',
	GETRECENTORDERBYBUYERID: '/getRecentOrdersByBuyerId/:buyerId',
	GETALLORDERS: '/getAllOrders',
	GETALLORDERSBYBUYERID: '/getAllOrdersByBuyerId/:buyerId',
	GETALLORDERSBYBUYERIDFILTERBYSTATUSES:
		'/getAllOrdersByBuyerIdFilterByStatuses/:buyerId',
	GETALLORDERSBYCLIENTID: '/getAllOrdersByClientId/:clientId',
	UPDATEORDERSTATUS: '/updateOrderStatus',
	GETRECENTORDEREDPRODUCTSLISTBYBUYERID:
		'/getRecentOrderedProductsListByBuyerId/:buyerId',
	GETORDEREDPRODUCTSLISTBYORDERID:
		'/getOrderedProductsListByOrderId/:orderId',
	GETORDERSTATUSES: '/getOrderStatuses',
	GETTOTALORDERSPENDAMOUNTANDPENDINGORDERSBYBUYERID:
		'/getTotalOrderSpendAmountAndPendingOrdersBybuyerId/:buyerId',
	CANCELORDER: '/cancelOrder',
	GETINVOICE: '/getInvoice/:orderId',
	GETTOTALORDERSCOUNTANDTOTALAMOUNTBYBUYERID:
		'/getTotalOrdersCountAndTotalAmountByBuyerId/:buyerId',
};
