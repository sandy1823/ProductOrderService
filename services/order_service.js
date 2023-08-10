const orderRepo = require('../repo/order_repo');
const {
	getProductsListByProductIds,
	getRefundForOrder,
	getCheckoutFromProductService,
	deleteCheckout,
	clearCartProductService,
	getAllClientsCount,
	updateProductQty,
} = require('./inner_communication_service');
const {
	getTotalProductsFromOrder,
	calculateTotalAmountAndAverageFromListOfOrders,
	// getLastOrderDurationForOrders,
	getProductListWithCalculatedDealPrice,
	sendAlertForOrderStatus,
	generateOrderId,
	getClient,
} = require('./helper_service');
const Order = require('../repo/schemas/Order');
const config = require('../config/app_config.json');
const {
	STATUSES,
	ORDERSTATUS,
	REFUND_SPEED,
	REFUND_STATUS,
} = require('../utils/constants');
const {
	getAuthTokenFromRequest,
	nFormatter,
} = require('../utils/helper_tools');
const {
	addRefundRepo,
	getRefundRepo,
	updateRefundStatusRepo,
} = require('../repo/refund_repo');
const ApiException = require('../models/ApiException');
const { failedResponse } = require('./common_service');
const { generateInvoiceDoc } = require('./invoice_generation_service');
const { customLogger } = require('../utils/logger');

async function addOrderService(req, res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'addOrderService',
		context: 'Before Execution',
		message: 'Going to create an order',
	});
	let createOrderResult = await orderRepo.addOrderRepo(
		{
			order_id: generateOrderId(),
			razorpay_order_id: req.body?.orderId ? req.body.orderId : null,
			buyer_id: req.body.buyerId,
			client_id: req.query.clientId,
			receipt: req.body.receipt,
			user_id: req.body.userId,
			invoice_id: req.body.invoiceId,
		},
		ORDERSTATUS.NEW
	);
	if (createOrderResult.hasOwnProperty('order_id')) {
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'addOrderService',
			context: 'If condition true block',
			message: 'Order data has been successfully created',
		});
		res.locals.responseCode = config.response_code.success;
		res.locals.responseCb = async () => {
			customLogger.info({
				fileName: '/services/order_service.js',
				functionName: 'addOrderServiceCB',
				context: 'Before Execution',
				message: 'Going to create alert for order creation',
			});
			let alertResult = await sendAlertForOrderStatus(
				ORDERSTATUS.NEW,
				createOrderResult.order_id,
				createOrderResult.receipt.shippingTo.mobileNo
			);
			customLogger.info({
				fileName: '/services/order_service.js',
				functionName: 'addOrderServiceCB',
				context: 'After Execution',
				message: 'Going to return without errors',
			});
			return alertResult;
		};
	}
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'addOrderService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return createOrderResult;
}

async function addOrderWithoutPaymentService(req, res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'addOrderWithoutPaymentService',
		context: 'Before Execution',
		message: 'Going to create an order without payment',
	});
	let receipt = await getCheckoutFromProductService({
		clientId: req.query.clientId,
		checkoutId: req.body.checkoutId,
		buyerId: req.body.buyerId,
		userId: req.body.userId,
		headers: getAuthTokenFromRequest(req),
	});
	const orderResult = {
		order_id: generateOrderId(),
		razorpay_order_id: null,
		buyer_id: req.body.buyerId,
		client_id: req.query.clientId,
		receipt,
		user_id: req.body.userId,
		invoice_id: req.body.invoiceId,
	};
	let createOrderResult = await orderRepo.addOrderRepo(
		orderResult,
		ORDERSTATUS.NEW
	);
	if (createOrderResult.hasOwnProperty('order_id')) {
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'addOrderService',
			context: 'If condition true block',
			message: 'Order data has been successfully created',
		});
		res.locals.responseCode = config.response_code.success;
		try {
			customLogger.info({
				fileName: '/services/order_service.js',
				functionName: 'addOrderService',
				context: 'Try block',
				message: 'Going to delete checkout',
			});
			let deleteCheckoutResult = await deleteCheckout(
				req.query.clientId,
				orderResult.receipt.checkoutId,
				getAuthTokenFromRequest(req)
			);
			if (deleteCheckoutResult == null) {
				customLogger.warn({
					fileName: '/services/order_service.js',
					functionName: 'addOrderService',
					context: 'If condition true block',
					message: 'Unable to delete checkout retrying for 3 times',
				});
				let isCheckoutDeleted = false;
				for (let retryCount = 0; retryCount <= 3; retryCount++) {
					deleteCheckoutResult = await deleteCheckout(
						req.query.clientId,
						orderResult.receipt.checkoutId,
						getAuthTokenFromRequest(req)
					);
					if (deleteCheckoutResult != null) {
						isCheckoutDeleted = true;
						break;
					}
				}
				if (isCheckoutDeleted) {
					customLogger.info({
						fileName: '/services/order_service.js',
						functionName: 'addOrderService',
						context: 'If condition true block',
						message: 'Successfully deleted checkout',
					});
				} else {
					customLogger.warn({
						fileName: '/services/order_service.js',
						functionName: 'addOrderService',
						context: 'If condition false block',
						message: `Unable to delete checkout for checkout ID ${orderResult?.receipt?.checkoutId}`,
					});
					res.locals.responseCode =
						config.response_code.partialSuccess;
					res.locals.errors.push({
						checkoutId: orderResult.receipt.checkoutId,
						message:
							'Unable to delete checkout and destroy scheduler',
					});
				}
			}
		} catch (error) {
			customLogger.error({
				fileName: '/services/order_service.js',
				functionName: 'addOrderService',
				context: 'Error Handling',
				message: error.message,
				code: error.code || error.status,
			});
			res.locals.responseCode = config.response_code.success;
			res.locals.errors.push({
				checkoutId: orderResult.receipt.checkoutId,
				message: 'Unable to delete checkout and destroy scheduler',
			});
		}
		if (req.query.cartId) {
			customLogger.info({
				fileName: '/services/order_service.js',
				functionName: 'addOrderService',
				context: 'If condition true block',
				message: 'Going to clear cart',
			});
			try {
				let clearCartResult = await clearCartProductService(
					req.query.clientId,
					req.body.buyerId,
					req.query.cartId,
					getAuthTokenFromRequest(req)
				);
				if (clearCartResult == 0) {
					customLogger.warn({
						fileName: '/services/order_service.js',
						functionName: 'addOrderService',
						context: 'If condition true block',
						message: `Unable to clear cart`,
					});
					res.locals.responseCode =
						config.response_code.partialSuccess;
					res.locals.errors.push({
						cartId: req.query.cartId,
						message: 'Unable to clear cart',
					});
				}
			} catch (error) {
				customLogger.error({
					fileName: '/services/order_service.js',
					functionName: 'addOrderService',
					context: 'Error Handling',
					message: error.message,
					code: error.code || error.status,
				});
				res.locals.responseCode = config.response_code.partialSuccess;
				res.locals.errors.push({
					cartId: req.query.cartId,
					message: 'Unable to clear cart',
				});
			}
		}
		res.locals.responseCb = async () => {
			customLogger.info({
				fileName: '/services/order_service.js',
				functionName: 'addOrderWithoutPaymentServiceCB',
				context: 'Before Execution',
				message: 'Going to create alert for order creation',
			});
			let alertResult = await sendAlertForOrderStatus(
				ORDERSTATUS.NEW,
				createOrderResult.order_id,
				createOrderResult.receipt.shippingTo.mobileNo
			);
			customLogger.info({
				fileName: '/services/order_service.js',
				functionName: 'addOrderWithoutPaymentServiceCB',
				context: 'After Execution',
				message: 'Going to return without errors',
			});
			return alertResult;
		};
	}
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'addOrderWithoutPaymentService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return createOrderResult;
}

function addPendingOrderService(req, _res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'addPendingOrderService',
		context: 'Before Execution',
		message: 'Going to create a pending order',
	});
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'addPendingOrderService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return orderRepo.addOrderRepo(
		{
			order_id: generateOrderId(),
			payment_id: req.body.payment_id,
			buyer_id: req.body.buyer_id,
			client_id: req.query.clientId,
			receipt: req.body.receipt,
			user_id: req.body.user_id,
			invoice_id: req.body.invoice_id,
		},
		ORDERSTATUS.PENDING
	);
}

async function getAllOrdersByBuyerIdService(req, _res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getAllOrdersByBuyerIdService',
		context: 'Before Execution',
		message: 'Get all orders by buyer id',
	});
	let ordersResult = await orderRepo.getAllOrdersByBuyerIdRepo(
		req.params.buyerId
	);
	if (ordersResult != null) {
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getAllOrdersByBuyerIdService',
			context: 'If condition true block',
			message: 'Got orders result',
		});
		ordersResult = await getOrdersListWithClientDetail(
			ordersResult,
			getAuthTokenFromRequest(req)
		);
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getAllOrdersByBuyerIdService',
			context: 'After Execution',
			message: 'Going to return without errors',
		});
		return {
			orders: ordersResult,
			...calculateTotalAmountAndAverageFromListOfOrders(ordersResult),
			// ...getLastOrderDurationForOrders(ordersResult),
		};
	}
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getAllOrdersByBuyerIdService',
		context: 'After Execution',
		message: 'Going to return null',
	});
	return null;
}

async function getAllOrdersByClientIdService(req, res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getAllOrdersByClientIdService',
		context: 'Before Execution',
		message: 'Get all orders by client id',
	});
	let ordersResult = await orderRepo.getAllOrdersByClientIdRepo(
		req.params.clientId,
		req.query.limit
	);
	const clientDetails = await getClient(
		req.params.clientId,
		getAuthTokenFromRequest(req)
	);
	if (ordersResult != null) {
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getAllOrdersByClientIdService',
			context: 'If condition true block',
			message: 'Got orders result',
		});
		ordersResult = ordersResult?.map((order) => ({
			...new Order(order).toCamelCase(),
			...getTotalProductsFromOrder(order),
		}));
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getAllOrdersByClientIdService',
			context: 'After Execution',
			message: 'Going to return without errors',
		});
		return {
			orders: ordersResult,
			clientDetails,
		};
	}
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getAllOrdersByClientIdService',
		context: 'After Execution',
		message: 'Going to return null',
	});
	res.locals.responseCode = config.response_code.empty_results;
	return {
		orders: null,
		clientDetails,
	};
}

function getAllOrdersService(_req, _res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getAllOrdersService',
		context: 'Before Execution',
		message: 'Get all orders',
	});
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getAllOrdersService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return orderRepo.getAllOrdersRepo();
}

async function getRecentOrdersByBuyerIdService(req, _res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getRecentOrdersByBuyerIdService',
		context: 'Before Execution',
		message: 'Get all recent orders by buyer id',
	});
	let orderResult = await orderRepo.getRecentOrdersByBuyerIdRepo(
		req.params.buyerId,
		req.query.limit,
		req.query.clientId
	);
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getRecentOrdersByBuyerIdService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	if (orderResult != null) {
		return {
			...orderResult,
			orders: await Promise.all(
				orderResult.orders.map(async (order) => ({
					...order,
					...(await getClient(
						order.clientId,
						getAuthTokenFromRequest(req)
					)),
				}))
			),
		};
	}
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getRecentOrdersByBuyerIdService',
		context: 'After Execution',
		message: 'Going to return null',
	});
	return null;
}

async function getOrderByIdService(req, _res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getOrderByIdService',
		context: 'Before Execution',
		message: 'getting order by id',
	});
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getOrderByIdService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return orderRepo
		.getOrderByIdRepo(req.params.orderId, req.query.buyerId)
		.then(async (orderResult) => ({
			...orderResult,
			...(await getClient(
				orderResult.clientId,
				getAuthTokenFromRequest(req)
			)),
		}));
}

async function updateOrderStatusService(req, res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'updateOrderStatusService',
		context: 'Before Execution',
		message: 'update Order Status',
	});
	let updateOrderResult = await orderRepo.updateOrderStatusRepo(
		req.query.clientId,
		req.body.buyerId,
		req.body.userId,
		req.body.orderId,
		req.body.status
	);
	if (updateOrderResult.hasOwnProperty('order_id')) {
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'updateOrderStatusService',
			context: 'if condition true block',
			message: 'Successfully updated Order Status',
		});
		res.locals.responseCode = config.response_code.success;
		res.locals.responseCb = async () => {
			customLogger.info({
				fileName: '/services/order_service.js',
				functionName: 'updateOrderStatusServiceCB',
				context: 'Before Execution',
				message: 'Going to create alert for order status updation',
			});
			let alertResult = await sendAlertForOrderStatus(
				ORDERSTATUS[updateOrderResult.status.toUpperCase()],
				updateOrderResult.order_id,
				updateOrderResult.receipt.shippingTo.mobileNo
			);
			customLogger.info({
				fileName: '/services/order_service.js',
				functionName: 'updateOrderStatusServiceCB',
				context: 'After Execution',
				message: 'Going to return without errors',
			});
			return alertResult;
		};
	}
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'updateOrderStatusService',
		context: 'After Execution',
		message: 'Unable to update order status',
	});
	return updateOrderResult;
}

async function getRecentOrderedProductsListService(req, res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getRecentOrderedProductsListService',
		context: 'Before Execution',
		message: 'getting recend Ordered product list',
	});
	let orderResult = await orderRepo.getRecentOrderedProductsListRepo(
		req.params.buyerId
	);
	let recentClients = await orderRepo.getRecentOrderByclientListRepo(
		req.params.buyerId,
		req.query.clientLimit
	);
	if (orderResult != null) {
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getRecentOrderedProductsListService',
			context: 'if condition true block',
			message: 'Got order result',
		});
		res.locals.responseCode = config.response_code.success;
		let productListResult = await getProductsListByProductIds(
			orderResult.client_id,
			orderResult.map((result) => result.product_id),
			STATUSES.ACTIVE,
			getAuthTokenFromRequest(req)
		);
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getRecentOrderedProductsListService',
			context: 'After Execution',
			message: 'Going to return without errors',
		});
		return {
			...(await getProductListWithCalculatedDealPrice(
				getProductOrderedQtyFromOrderResults(
					productListResult,
					orderResult
				)
			)),
			recentClientDetails:
				recentClients == null
					? null
					: await Promise.all(
							recentClients.map((clientId) =>
								getClient(
									clientId,
									getAuthTokenFromRequest(req)
								)
							)
					  ),
		};
	} else {
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getRecentOrderedProductsListService',
			context: 'else condition false block',
			message: 'Going to return null',
		});
		res.locals.responseCode = config.response_code.empty_results;
		return null;
	}
}

function getOrderStatusesService(_req, _res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getOrderStatusesService',
		context: 'Before Execution',
		message: 'getting order status',
	});
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getOrderStatusesService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return orderRepo.getOrderStatusesRepo();
}

async function cancelOrderService(req, res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'cancelOrderService',
		context: 'Before Execution',
		message: 'cancel order',
	});
	if (
		await orderRepo.checkForOrderCancellableRepo(
			req.body.orderId,
			req.body.buyerId
		)
	) {
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'cancelOrderService',
			context: 'if block true condition',
			message: 'check For Order Cancellable',
		});
		let cancelOrderResultToSend = await orderRepo.cancelOrderRepo(
			req.body.buyerId,
			req.body.orderId,
			{
				userId: req.body.userId,
				userName: req.body.userName,
			},
			req.body.remarks
		);
		// console.log(cancelOrderResultToSend,"cancelOrderResultToSend");
		// console.log(cancelOrderResultToSend.receipt.productList[0],"cancelOrderResultToSend prod");
		if (cancelOrderResultToSend?.razorpay_order_id) {
			customLogger.info({
				fileName: '/services/order_service.js',
				functionName: 'cancelOrderService',
				context: 'if block true condition',
				message: 'cancel Order Result To Send',
			});
			try {
				await addRefundRepo({
					order_id: cancelOrderResultToSend.order_id,
					razorpay_order_id:
						cancelOrderResultToSend.razorpay_order_id,
					amount: cancelOrderResultToSend.receipt.price
						.totalAmountToPayAfterTax,
					speed_requested: REFUND_SPEED.NORMAL,
					notes: req.body?.notes ? req.body?.notes : null,
					status: REFUND_STATUS.INITIATED,
				});
				if (
					cancelOrderResultToSend !== null &&
					cancelOrderResultToSend.hasOwnProperty('order_id')
				) {
					customLogger.info({
						fileName: '/services/order_service.js',
						functionName: 'cancelOrderService',
						context: 'if block another true condition',
						message: 'cancel Order Result To Send',
					});
					res.locals.responseCb = async () => {
						let refundResult = await refundPaymentForOrder(
							cancelOrderResultToSend.order_id,
							cancelOrderResultToSend.razorpay_order_id,
							getAuthTokenFromRequest(req)
						);
						console.log(
							'===> ~ file: order_service.js ~ line 220 ~ res.locals.responseCb= ~ refundResult',
							refundResult
						);
						let alertResult = await sendAlertForOrderStatus(
							ORDERSTATUS.CANCEL,
							cancelOrderResultToSend.order_id,
							cancelOrderResultToSend.receipt.shippingTo.mobileNo
						);
						console.log(
							'===> ~ file: order_service.js ~ line 202 ~ res.locals.responseCb= ~ createAlertResult',
							alertResult
						);
						customLogger.info({
							fileName: '/services/order_service.js',
							functionName: 'cancelOrderService',
							context: 'if block another true condition',
							message: 'function with out error',
						});
						return { refundResult, alertResult };
					};
				}
			} catch (error) {
				customLogger.error({
					fileName: '/services/order_service.js',
					functionName: 'cancelOrderService',
					context: 'Error Handling',
					message: error.message,
					code: error.code || error.status,
				});
				res.locals.responseCode = config.response_code.partialSuccess;
			}
		}
		res.locals.responseCode = config.response_code.success;
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'cancelOrderService',
			context: 'After Execution',
			message: 'Going to return without errors',
		});
		let qtyIncrease = await updateProductQty(
			{
				productList: cancelOrderResultToSend.receipt.productList,
				checkoutId: null,
			},
			{
				clientId: cancelOrderResultToSend.receipt.clientId,
				checkoutId: cancelOrderResultToSend.receipt.checkoutId,
			}
		);
		console.log(qtyIncrease, 'qtyIncrese');
		return { orderId: cancelOrderResultToSend.order_id };
	}
	customLogger.warn({
		fileName: '/services/order_service.js',
		functionName: 'cancelOrderService',
		context: 'After Execution',
		message:
			'Going to throw exception with the given orderId is not cancellable or not exists',
	});
	throw new ApiException({
		message: `The given orderId is not cancellable or not exists`,
		responseCode: config.response_code.empty_results,
		errorData: {
			orderId: req.body.orderId,
			message: `The given orderId is not cancellable or not exists`,
		},
	});
}

async function refundPaymentForOrder(orderId, razorpayOrderId, headers) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'refundPaymentForOrder',
		context: 'Before Execution',
		message: 'refund payment',
	});
	try {
		let refundData = await getRefundRepo(orderId);
		if (refundData == null) {
			customLogger.warn({
				fileName: '/services/order_service.js',
				functionName: 'refundPaymentForOrder',
				context: 'if condition true block',
				message: 'No refund data found for the given order',
			});
			throw new Error('No refund data found for the given order');
		}
		let refundRequestResult = await getRefundForOrder(
			{
				order_id: razorpayOrderId,
			},
			headers
		);
		if (
			refundRequestResult &&
			refundRequestResult == null &&
			refundRequestResult.hasOwnProperty('id')
		) {
			customLogger.warn({
				fileName: '/services/order_service.js',
				functionName: 'refundPaymentForOrder',
				context: 'if condition true block',
				message: 'Refund request failed',
			});
			throw new Error('Refund request failed');
		}
		let updateStatusResult = await updateRefundStatusRepo(
			orderId,
			refundRequestResult.id,
			REFUND_STATUS.REQUESTED
		);
		if (!updateStatusResult && updateStatusResult == null) {
			customLogger.warn({
				fileName: '/services/order_service.js',
				functionName: 'refundPaymentForOrder',
				context: 'if condition true block',
				message: 'Failed to update refund status',
			});
			throw new Error('Failed to update refund status');
		}
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'refundPaymentForOrder',
			context: 'After Execution',
			message: 'Going to return without errors',
		});
		return updateStatusResult;
	} catch (error) {
		customLogger.error({
			fileName: '/services/order_service.js',
			functionName: 'refundPaymentForOrder',
			context: 'Error Handling',
			message: error.message,
			code: error.code || error.status,
		});
	}
}

async function getOrderedProductsByOrderIdService(req, res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getOrderedProductsByOrderIdService',
		context: 'Before Execution',
		message: 'get ordered product',
	});
	let orderResult = await orderRepo.getOrderedProductsListRepo(
		req.query.buyerId,
		req.params.orderId
	);
	if (orderResult != null) {
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getOrderedProductsByOrderIdService',
			context: 'if condition true block',
			message: 'orderResult data',
		});
		res.locals.responseCode = config.response_code.success;
		let productListResult = await getProductsListByProductIds(
			orderResult.client_id,
			orderResult.map((result) => result.product_id),
			STATUSES.ACTIVE,
			getAuthTokenFromRequest(req)
		);
		productListResult = getProductOrderedQtyFromOrderResults(
			productListResult,
			orderResult
		);
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getOrderedProductsByOrderIdService',
			context: 'After Execution',
			message: 'Going to return without errors',
		});
		return getProductListWithCalculatedDealPrice(productListResult);
	} else {
		res.locals.responseCode = config.response_code.empty_results;
		customLogger.warn({
			fileName: '/services/order_service.js',
			functionName: 'getOrderedProductsByOrderIdService',
			context: 'thorw error',
			message: 'not get ordered product',
		});
		return null;
	}
}

async function getInvoiceService(req, res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getInvoiceService',
		context: 'Before Execution',
		message: 'getting Invoice',
	});
	try {
		const orderData = await orderRepo.getOrderByIdRepo(
			req.params.orderId,
			req.query.buyerId
		);
		const clientData = await getClient(
			orderData.clientId,
			getAuthTokenFromRequest(req)
		);
		const fileName = `INVOICE-${
			req.params.orderId
		}-${new Date().toISOString()}.pdf`;
		res.set({
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename=${fileName}`,
			'File-Name': `${fileName}`,
		});

		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getInvoiceService',
			context: 'After Execution',
			message: 'getting Invoice',
		});
		res.end(
			await generateInvoiceDoc({
				orderId: orderData.orderId,
				invoiceId: orderData.invoiceId,
				receipt: orderData.receipt,
				clientData,
			})
		);
	} catch (error) {
		customLogger.error({
			fileName: '/services/order_service.js',
			functionName: 'getInvoiceService',
			context: 'Error Handling',
			message: error.message,
			code: error.code || error.status,
		});
		failedResponse(res, {
			message: error.message,
		});
	}
}

function getTotalOrdersAndPendingOrdersBybuyerIdService(req, _res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getTotalOrdersAndPendingOrdersBybuyerIdService',
		context: 'Before Execution',
		message: 'getting total orders and pending order',
	});
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getTotalOrdersAndPendingOrdersBybuyerIdService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return orderRepo.getTotalOrdersAndPendingOrdersBybuyerIdRepo(
		req.params.buyerId
	);
}

async function getTotalOrdersCountAndTotalAmountByBuyerIdService(req, _res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getTotalOrdersCountAndTotalAmountByBuyerIdService',
		context: 'Before Execution',
		message: 'getting total orders count and total amount',
	});
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getTotalOrdersCountAndTotalAmountByBuyerIdService',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return orderRepo
		.getTotalOrdersCountAndTotalAmountByBuyerIdRepo(req.params.buyerId)
		.then(async (orderResult) => ({
			...orderResult,
			totalSpendAmount: nFormatter(orderResult.totalSpendAmount, 1),
			...(await getAllClientsCount(getAuthTokenFromRequest(req))),
		}));
}

async function getAllOrdersByBuyerIdFilterByStatusesService(req, _res) {
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getAllOrdersByBuyerIdFilterByStatusesService',
		context: 'Before Execution',
		message: 'getting all order fillter by status',
	});

	let ordersResult =
		await orderRepo.getAllOrdersByBuyerIdFilterByStatusesRepo(
			req.params.buyerId,
			req.body?.statusesToFilter
				?.map((status) => ORDERSTATUS[status?.toUpperCase()])
				?.filter((status) => status != undefined),
			req.query.limit
		);
	if (ordersResult != null) {
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getAllOrdersByBuyerIdFilterByStatusesService',
			context: 'If condition true block',
			message: 'Going to return without errors',
		});
		ordersResult = await getOrdersListWithClientDetail(
			ordersResult,
			getAuthTokenFromRequest(req)
		);
		customLogger.info({
			fileName: '/services/order_service.js',
			functionName: 'getAllOrdersByBuyerIdFilterByStatusesService',
			context: 'After Execution',
			message: 'Going to return without errors',
		});
		return {
			orders: ordersResult,
			...calculateTotalAmountAndAverageFromListOfOrders(ordersResult),
			// ...getLastOrderDurationForOrders(ordersResult),
		};
	}
	customLogger.info({
		fileName: '/services/order_service.js',
		functionName: 'getAllOrdersByBuyerIdFilterByStatusesService',
		context: 'After Execution',
		message: 'Going to return null',
	});
	return null;
}

const getProductOrderedQtyFromOrderResults = (productList, orderResults) =>
	productList.map((product) => ({
		...product,
		qty: orderResults.find(
			(result) => result.product_id == product.productId
		).qty,
	}));

const getOrdersListWithClientDetail = (orderList, token) =>
	Promise.all(
		orderList?.map(async (order) => ({
			...new Order(order).toCamelCase(),
			...getTotalProductsFromOrder(order),
			...(await getClient(order.client_id, token)),
		}))
	);

module.exports = {
	getOrderedProductsByOrderIdService,
	cancelOrderService,
	addOrderWithoutPaymentService,
	addPendingOrderService,
	addOrderService,
	getOrderByIdService,
	getAllOrdersService,
	getAllOrdersByClientIdService,
	getRecentOrdersByBuyerIdService,
	getAllOrdersByBuyerIdService,
	updateOrderStatusService,
	getRecentOrderedProductsListService,
	getOrderStatusesService,
	getInvoiceService,
	getTotalOrdersAndPendingOrdersBybuyerIdService,
	getTotalOrdersCountAndTotalAmountByBuyerIdService,
	getAllOrdersByBuyerIdFilterByStatusesService,
};
