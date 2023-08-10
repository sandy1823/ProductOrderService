module.exports = {
	// APIGATEWAY: process.env.APISERVICE,

	PRODUCT_SERVICE_GATEWAY:
		process.env.PRODUCTSERVICE || 'http://localhost:4000',

	PRODUCT_SERVICE_GETPRODUCTLIST: 'products/getProductListByProductIdsList',
	PRODUCT_SERVICE_GETCHECKOUT: 'checkout/getCheckoutById',
	PRODUCT_SERVICE_CLEAR_CART: 'cart/removeAllCartProduct',
	PRODUCT_SERVICE_UPDATEPRODUCTQTY:'publicRoute/updateProductQtyOnFailedCheckout',
	PRODUCT_SERVICE_DELETE_CHECKOUT: 'checkout/deleteCheckoutById',

	PRICE_SERVICE_GATEWAY: process.env.PRICESERVICE || `http://localhost:4300`,

	PRICE_SERVICE_GETDISCOUNTPRICE_FOR_LISTOFITEMS:
		'price/getDiscountPriceForListOfItems',

	USER_SERVICE_GATEWAY: process.env.USERSERVICE || `http://localhost:3500`,

	USER_SERVICE__GETCLIENT_BY_CLIENTID: 'buyers/getClientByClientId',
	USER_SERVICE_GETALL_CLIENT_COUNT: 'buyers/getAllActiveClientCount',
	USER_SERVICE_CHECK_USER: 'buyers/checkUser',

	ALERT_SERVICE_GATEWAY: process.env.ALERTSERVICE || `http://localhost:4400`,

	ALERT_SERVICE_CREATEORDERPLACE_ALERT: 'alerts/createAlertForOrderPlaced',
	ALERT_SERVICE_CREATEORDERCANCEL_ALERT:
		'alerts/createAlertForOrderCancelled',
	ALERT_SERVICE_CREATEORDERUPDATESTATUS_ALERT:
		'alerts/createAlertForOrderStatus',
	ALERT_SERVICE_DELIVEREDORDER_ALERT: 'alerts/createAlertForOrderDelivery',

	PAYMENT_SERVICE_GATEWAY:
		process.env.PAYMENTSERVICE || 'http://localhost:4500',
	PAYMENT_SERVICE_REFUND_PAYMENT: 'refund/createRefund',
};
