var {
	getCalculatedDiscountPriceForListOfProducts,
	createDeliveredOrderAlert,
	createOrderCancelAlert,
	createOrderPlaceAlert,
	createOrderUpdateAlert,
	getClientByClientId,
} = require('./inner_communication_service');
const { getRandomInt } = require('../utils/helper_tools');
const { ORDERSTATUS } = require('../utils/constants');
const { customLogger } = require('../utils/logger');

// var clientResultMap = new Map();

function getClient(clientId, token) {
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'getClient',
		context: 'Before Execution',
		message: 'get client',
	});

	// if (clientResultMap.has(clientId)) {
	// 	customLogger.info({
	// 		fileName: '/service/helper_service.js',
	// 		functionName: 'getClient',
	// 		context: 'if block true condition',
	// 		message: 'clientResult have the clientid',
	// 	});
	// 	return clientResultMap.get(clientId);
	// }
	// let clientResult = await getClientByClientId(clientId, token);
	// clientResultMap.set(clientResult.clientId, clientResult);
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'getClient',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	// return clientResult;
	return getClientByClientId(clientId, token);
}

function calculateTotalAmountAndAverageFromListOfOrders(orderList) {
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'calculateTotalAmountAndAverageFromListOfOrders',
		context: 'Before Execution',
		message: 'calculate total amount',
	});
	let totalAmount = Math.ceil(
		orderList.reduce((acc, curr) => {
			return (
				acc + parseFloat(curr.receipt.price.totalAmountToPayAfterTax)
			);
		}, 0)
	);
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'calculateTotalAmountAndAverageFromListOfOrders',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return {
		totalAmount: totalAmount.toFixed(2),
		averageOrderValue: Math.ceil(totalAmount / orderList.length).toFixed(2),
	};
}

function getLastOrderDurationForOrders(orderList) {
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'getLastOrderDurationForOrders',
		context: 'Before Execution',
		message: 'get Last Order Duration',
	});
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'getLastOrderDurationForOrders',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return {
		lastOrder: Math.ceil(
			Math.abs(
				new Date() -
					new Date(
						orderList.sort(
							(a, b) =>
								new Date(b.createdAt) - new Date(a.createdAt)
						)[orderList.length - 1].createdAt
					)
			) /
				(1000 * 60 * 60 * 24)
		),
	};
}

function getTotalProductsFromOrder(order) {
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'getTotalProductsFromOrder',
		context: 'Before Execution',
		message: 'get total products',
	});
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'getTotalProductsFromOrder',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return {
		totalProducts: order.receipt.productList.length,
	};
}

function getDiscountDataForPriceService(product) {
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'getDiscountDataForPriceService',
		context: 'Before Execution',
		message: 'get Discount Data For PriceService',
	});
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'getDiscountDataForPriceService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return {
		id: product.productId,
		price: product.price,
		discount:
			product.deal == null
				? null
				: {
						type: product.deal.dealType.valueType,
						value: product.deal.dealType.value,
				  },
		qty: product.qty ? product.qty : null,
	};
}

async function getProductListWithCalculatedDealPrice(productList) {
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'getProductListWithCalculatedDealPrice',
		context: 'Before Execution',
		message: 'get Product List With Calculated DealPrice',
	});
	let priceResult = await getCalculatedDiscountPriceForListOfProducts(
		productList.map(getDiscountDataForPriceService),
		productList[0].qty ? true : false
	);
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'getProductListWithCalculatedDealPrice',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return productList[0].qty
		? {
				productList: productList.map((product) => {
					let res = priceResult.items.find(
						(productWithPrice) =>
							productWithPrice.id === product.productId
					);
					return {
						...product,
						price: res.price,
						totalAmount: res.totalAmount,
					};
				}),
				totalAmountToPay: priceResult.totalAmountToPay,
		  }
		: productList.map((product) => ({
				...product,
				...getProductStockDetail(product),
				price: priceResult.items.find(
					(productWithPrice) =>
						productWithPrice.id === product.productId
				).price,
		  }));
}

function sendAlertForOrderStatus(status, orderId, mobileNo) {
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'sendAlertForOrderStatus',
		context: 'Before Execution',
		message: 'send Alert For Order Status',
	});

	switch (status) {
		case ORDERSTATUS.NEW:
			customLogger.info({
				fileName: '/service/helper_service.js',
				functionName: 'sendAlertForOrderStatus',
				context: 'case statement After Execution',
				message: 'create order place',
			});
			return createOrderPlaceAlert({
				content: {
					orderId,
				},
				mobileNo,
			});
		case ORDERSTATUS.CANCEL:
			customLogger.info({
				fileName: '/service/helper_service.js',
				functionName: 'sendAlertForOrderStatus',
				context: 'case statement After Execution',
				message: 'order status cancel',
			});
			return createOrderCancelAlert({
				content: {
					orderId,
				},
				mobileNo,
			});
		case ORDERSTATUS.DELIVERED:
			customLogger.info({
				fileName: '/service/helper_service.js',
				functionName: 'sendAlertForOrderStatus',
				context: 'case statement After Execution',
				message: 'order status delivered',
			});
			return createDeliveredOrderAlert({
				content: {
					orderId,
				},
				mobileNo,
			});

		default:
			customLogger.info({
				fileName: '/service/helper_service.js',
				functionName: 'sendAlertForOrderStatus',
				context: 'case statement default After Execution',
				message: 'create Order Update Alert',
			});
			return createOrderUpdateAlert({
				content: {
					orderId,
					status,
				},
				mobileNo,
			});
	}
}

function generateOrderId() {
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'generateOrderId',
		context: 'Before Execution',
		message: 'generate OrderId',
	});
	customLogger.info({
		fileName: '/service/helper_service.js',
		functionName: 'generateOrderId',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return `${Date.now().toString()}-${getRandomInt()}`;
}

module.exports = {
	calculateTotalAmountAndAverageFromListOfOrders,
	getLastOrderDurationForOrders,
	getTotalProductsFromOrder,
	getProductListWithCalculatedDealPrice,
	getDiscountDataForPriceService,
	sendAlertForOrderStatus,
	generateOrderId,
	getClient,
};
