const { commonCall } = require('../utils/common_calls');
const { customLogger } = require('../utils/logger');
const { GET, POST, PUT, DELETE } = require('../utils/constants').HTTP_METHOD;
const {
	PRODUCT_SERVICE_GETPRODUCTLIST,
	PRICE_SERVICE_GETDISCOUNTPRICE_FOR_LISTOFITEMS,
	ALERT_SERVICE_CREATEORDERPLACE_ALERT,
	ALERT_SERVICE_CREATEORDERCANCEL_ALERT,
	ALERT_SERVICE_CREATEORDERUPDATESTATUS_ALERT,
	USER_SERVICE__GETCLIENT_BY_CLIENTID,
	PAYMENT_SERVICE_REFUND_PAYMENT,
	ALERT_SERVICE_DELIVEREDORDER_ALERT,
	PRODUCT_SERVICE_GETCHECKOUT,
	PRODUCT_SERVICE_DELETE_CHECKOUT,
	PRODUCT_SERVICE_CLEAR_CART,
	PRODUCT_SERVICE_GATEWAY,
	PRICE_SERVICE_GATEWAY,
	USER_SERVICE_GATEWAY,
	PAYMENT_SERVICE_GATEWAY,
	ALERT_SERVICE_GATEWAY,
	USER_SERVICE_GETALL_CLIENT_COUNT,
	USER_SERVICE_CHECK_USER,
	PRODUCT_SERVICE_UPDATEPRODUCTQTY,
} = require('../utils/urls');

function getProductsListByProductIds(clientId, productList, status, headers) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getProductsListByProductIds',
		context: 'Before Execution',
		message: 'getting product list by product_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getProductsListByProductIds',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${PRODUCT_SERVICE_GATEWAY}/${PRODUCT_SERVICE_GETPRODUCTLIST}`,
		method: GET,
		params: {
			clientId,
			status,
		},
		data: {
			productIdList: productList,
		},
		headers,
		errorMsg: 'Products not found',
	});
}

function deleteCheckout(clientId, checkoutId, headers) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'deleteCheckout',
		context: 'Before Execution',
		message: 'delete Check out by product_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'deleteCheckout',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${PRODUCT_SERVICE_GATEWAY}/${PRODUCT_SERVICE_DELETE_CHECKOUT}/${checkoutId}`,
		params: { clientId },
		method: DELETE,
		headers,
		errorMsg: 'Unable to delete checkout while updateing payment',
	});
}

function clearCartProductService(clientId, buyerId, cartId, headers) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'clearCartProductService',
		context: 'Before Execution',
		message: 'clear Cart Product Service by product_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'clearCartProductService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${PRODUCT_SERVICE_GATEWAY}/${PRODUCT_SERVICE_CLEAR_CART}`,
		method: DELETE,
		params: {
			clientId,
			buyerId,
			cartId,
		},
		headers,
		errorMsg: 'Unable to clear cart',
	});
}

function getCalculatedDiscountPriceForListOfProducts(
	productList,
	withQty = false
) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getCalculatedDiscountPriceForListOfProducts',
		context: 'Before Execution',
		message:
			'get Calculated Discount Price For List Of Products by price_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getCalculatedDiscountPriceForListOfProducts',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${PRICE_SERVICE_GATEWAY}/${PRICE_SERVICE_GETDISCOUNTPRICE_FOR_LISTOFITEMS}`,
		method: GET,
		params: {
			withQty,
		},
		data: {
			items: productList,
		},
		errorMsg: `Unable calculate discount price`,
	});
}

function getClientByClientId(clientId, headers) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getClientByClientId',
		context: 'Before Execution',
		message: 'getting Client By ClientId user_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getClientByClientId',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${USER_SERVICE_GATEWAY}/${USER_SERVICE__GETCLIENT_BY_CLIENTID}/${clientId}`,
		method: GET,
		headers,
		errorMsg: 'Unable to get client detail',
	});
}

function getAllClientsCount(headers) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getAllClientsCount',
		context: 'Before Execution',
		message: 'getting All Clients Count by user_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getAllClientsCount',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${USER_SERVICE_GATEWAY}/${USER_SERVICE_GETALL_CLIENT_COUNT}`,
		method: GET,
		headers,
		errorMsg: 'Unable to get client count',
	});
}

function updateProductQty(data,{clientId,checkoutId}) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'updateProductQty',
		context: 'Before Execution',
		message: 'update product qty by cancelling order',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'updateProductQty',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${PRODUCT_SERVICE_GATEWAY}/${PRODUCT_SERVICE_UPDATEPRODUCTQTY}`,
		method: PUT,
		params:{
			clientId,
			checkoutId
		},
		data,
		errorMsg: 'Unable to trigger update product qty',
	});
}

function createOrderPlaceAlert(data) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'createOrderPlaceAlert',
		context: 'Before Execution',
		message: 'create order place by alert_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'createOrderPlaceAlert',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${ALERT_SERVICE_GATEWAY}/${ALERT_SERVICE_CREATEORDERPLACE_ALERT}`,
		method: POST,
		data,
		errorMsg: 'Unable to trigger order create alert',
	});
}

function createDeliveredOrderAlert(data) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'createDeliveredOrderAlert',
		context: 'Before Execution',
		message: 'create delivered order by alert_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'createDeliveredOrderAlert',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${ALERT_SERVICE_GATEWAY}/${ALERT_SERVICE_DELIVEREDORDER_ALERT}`,
		method: POST,
		data,
		errorMsg: 'Unable to trigger order delivered alert',
	});
}

function createOrderCancelAlert(data) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'createOrderCancelAlert',
		context: 'Before Execution',
		message: 'create Order Cancel Alert by alert_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'createOrderCancelAlert',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${ALERT_SERVICE_GATEWAY}/${ALERT_SERVICE_CREATEORDERCANCEL_ALERT}`,
		method: POST,
		data,
		errorMsg: 'Unable to trigger order cancel alert',
	});
}

function createOrderUpdateAlert(data) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'createOrderUpdateAlert',
		context: 'Before Execution',
		message: 'create Order Update by alert_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'createOrderUpdateAlert',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${ALERT_SERVICE_GATEWAY}/${ALERT_SERVICE_CREATEORDERUPDATESTATUS_ALERT}`,
		method: POST,
		data,
		errorMsg: 'Unable to trigger order update alert',
	});
}

function getRefundForOrder(data, headers) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getRefundForOrder',
		context: 'Before Execution',
		message: 'get Refund For Order by payment_service',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getRefundForOrder',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${PAYMENT_SERVICE_GATEWAY}/${PAYMENT_SERVICE_REFUND_PAYMENT}`,
		method: POST,
		data,
		headers,
		errorMsg: 'Unable make order refund request',
	});
}

function getCheckoutFromProductService({
	clientId,
	checkoutId,
	buyerId,
	userId,
	headers,
}) {
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getCheckoutFromProductService',
		context: 'Before Execution',
		message: 'get Checkout From Product',
	});
	customLogger.info({
		fileName: '/services/inner_communication_service.js',
		functionName: 'getCheckoutFromProductService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return commonCall({
		url: `${PRODUCT_SERVICE_GATEWAY}/${PRODUCT_SERVICE_GETCHECKOUT}/${checkoutId}`,
		method: GET,
		params: {
			clientId,
			checkoutId,
			buyerId,
			userId,
		},
		headers,
		errorMsg: 'Unable to get Checkout',
	});
}

function checkUser(headers) {
	return commonCall({
		url: `${USER_SERVICE_GATEWAY}/${USER_SERVICE_CHECK_USER}`,
		method: 'GET',
		headers,
		errorMsg: 'Unable to check user',
		resultCB: (response) =>
			response.header.code == 600 && response.error == null,
	});
}

module.exports = {
	getProductsListByProductIds,
	getCalculatedDiscountPriceForListOfProducts,
	getClientByClientId,
	createOrderPlaceAlert,
	createOrderCancelAlert,
	createOrderUpdateAlert,
	createDeliveredOrderAlert,
	getRefundForOrder,
	getCheckoutFromProductService,
	deleteCheckout,
	clearCartProductService,
	getAllClientsCount,
	checkUser,
	updateProductQty
};
