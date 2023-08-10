const ApiException = require('../models/ApiException');
const {
	ORDERSTATUS,
	DEFAULT_ORDER_STATUSID,
	DEFAULT_ORDER_CANCEL_STATUSID,
} = require('../utils/constants');
const { transaction, query, sequenceOperation } = require('./db_connection');
const {
	CREATEORDER,
	GETORDERBYID,
	GETALLORDERS,
	GETRECENTORDERSBYBUYERID,
	UPDATEORDERSTATUS,
	GETALLORDERSBYBUYERID,
	GETLASTORDERANDAVERAGEORDERVALUE,
	GETRECENTORDEREDPRODUCTLIST,
	GETORDERSTATUSES,
	GETORDEREDPRODUCTLIST,
	CANCELORDER,
	GETTOTALORDERSPENDAMOUNTANDPENDINGORDERSBYBUYERID,
	GETSTATUSBYSTATUSNAME,
	CHECKORDERCANCEL,
	GETALLORDERSBYCLIENTID,
	GETTOTALORDERSCOUNTANDTOTALAMOUNTBYBUYERID,
	GETALLORDERSBYBUYERIDFILTERBYSTATUSES,
	GETRECENTORDERBYCLIENTLIST,
} = require('./db_queries');
const Order = require('./schemas/Order');
const config = require('../config/app_config.json');
const { customLogger } = require('../utils/logger');

function getStatusByStatusName(statusName) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getStatusByStatusName',
		context: 'Before Execution',
		message: 'get status by status name',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getStatusByStatusName',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(GETSTATUSBYSTATUSNAME, [statusName], (results) =>
		results.rowCount > 0 ? results.rows[0].id : null
	);
}

function addOrderRepo(record, status) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'addOrderRepo',
		context: 'Before Execution',
		message: 'get status by status name',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'addOrderRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return transaction(async (client) => {
		customLogger.info({
			fileName: '/repo/order_repo.js',
			functionName: 'addOrderRepoCB',
			context: 'Before Execution',
			message: 'get status by status name',
		});
		let statusId = await getStatusByStatusName(status);
		let orderResult = await client.query(
			CREATEORDER,
			Object.values(record).concat([
				statusId !== null ? statusId : DEFAULT_ORDER_STATUSID,
			])
		);
		if (orderResult.rowCount > 0) {
			customLogger.info({
				fileName: '/repo/order_repo.js',
				functionName: 'addOrderRepoCB',
				context: 'if condition true block',
				message: 'order status',
			});
			customLogger.info({
				fileName: '/repo/order_repo.js',
				functionName: 'addOrderRepoCB',
				context: 'after execution',
				message: 'Going to return without errors',
			});
			return orderResult.rows[0];
		} else {
			customLogger.warn({
				fileName: '/repo/order_repo.js',
				functionName: 'addOrderRepo',
				context: 'else block',
				message: 'Throwing exception with unable to create order',
			});
			throw new ApiException({
				message: 'Unable to create order',
				responseCode: config.response_code.expectation_failed,
			});
		}
	});
}

function getOrderByIdRepo(orderId, buyerId) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getOrderByIdRepo',
		context: 'Before Execution',
		message: 'get order',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getOrderByIdRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(GETORDERBYID, [orderId, buyerId], (results) =>
		results.rowCount > 0 ? new Order(results.rows[0]).toCamelCase() : null
	);
}

function getAllOrdersByBuyerIdRepo(buyerId) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getAllOrdersByBuyerIdRepo',
		context: 'Before Execution',
		message: 'get All Order by buyer',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getAllOrdersByBuyerIdRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(GETALLORDERSBYBUYERID, [buyerId], (results) =>
		results.rowCount > 0 ? results.rows : null
	);
}

function getAllOrdersByClientIdRepo(clientId, limit) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getAllOrdersByClientIdRepo',
		context: 'Before Execution',
		message: 'get All Order by client',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getAllOrdersByClientIdRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(GETALLORDERSBYCLIENTID, [clientId], (results) =>
		results.rowCount > 0 ? results.rows : null
	);
}

function getAllOrdersRepo() {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getAllOrdersRepo',
		context: 'Before Execution',
		message: 'get All Order',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getAllOrdersRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(GETALLORDERS, [], (results) =>
		results.rowCount > 0
			? results.rows.map((order) => new Order(order).toCamelCase())
			: null
	);
}

function getRecentOrdersByBuyerIdRepo(buyerId, limit,clientId) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getRecentOrdersByBuyerIdRepo',
		context: 'Before Execution',
		message: 'get recent orders by buyer',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getRecentOrdersByBuyerIdRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return sequenceOperation(async (client) => {
		customLogger.info({
			fileName: '/repo/order_repo.js',
			functionName: 'getRecentOrdersByBuyerIdRepoCB',
			context: 'Before Execution',
			message: 'get recent orders by buyer',
		});
		let recentOrderResults = await client.query(GETRECENTORDERSBYBUYERID, [
			buyerId,
			limit != undefined ? limit : 10,
			clientId
		]);
		let orderAggregateResults = await client.query(
			GETLASTORDERANDAVERAGEORDERVALUE,
			[buyerId]
		);
		customLogger.info({
			fileName: '/repo/order_repo.js',
			functionName: 'getRecentOrdersByBuyerIdRepoCB',
			context: 'After Execution',
			message: 'Going to return without errors',
		});
		return recentOrderResults.rowCount > 0 &&
			orderAggregateResults.rowCount > 0
			? {
					orders: recentOrderResults.rows.map((order) =>
						new Order(order).toCamelCase()
					),
					lastOrder: orderAggregateResults.rows[0].last_created_at,
					averageOrderValue: parseFloat(
						orderAggregateResults.rows[0].average_order_value
					).toFixed(2),
					totalOrdersCount:
						orderAggregateResults.rows[0].total_orders_count,
			  }
			: null;
	});
}

function updateOrderStatusRepo(clientId, buyerId, userId, orderId, status) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'updateOrderStatusRepo',
		context: 'Before Execution',
		message: 'update Order status',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'updateOrderStatusRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return transaction(async (client) => {
		customLogger.info({
			fileName: '/repo/order_repo.js',
			functionName: 'updateOrderStatusRepoCB',
			context: 'Before Execution',
			message: 'update Order status',
		});
		let statusId = await getStatusByStatusName(status.toUpperCase());
		let statusResult = await client.query(UPDATEORDERSTATUS, [
			buyerId,
			orderId,
			statusId,
			userId,
			clientId,
		]);
		customLogger.info({
			fileName: '/repo/order_repo.js',
			functionName: 'updateOrderStatusRepoCB',
			context: 'After Execution',
			message: 'Going to return without errors',
		});
		return statusResult.rows.length > 0
			? { ...statusResult.rows[0], status }
			: null;
	});
}

function getRecentOrderedProductsListRepo(buyerId) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getRecentOrderedProductsListRepo',
		context: 'Before Execution',
		message: 'get recent ordered product list',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getRecentOrderedProductsListRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(GETRECENTORDEREDPRODUCTLIST, [buyerId], (results) =>
		results.rowCount > 0 ? results.rows : null
	);
}

function getRecentOrderByclientListRepo(buyerId, clientLimit) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getRecentOrderByclientListRepo',
		context: 'Before Execution',
		message: 'get recent ordere by client list',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getRecentOrderByclientListRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(
		GETRECENTORDERBYCLIENTLIST,
		[buyerId, clientLimit ? clientLimit : 4],
		(results) => (results.rowCount > 0 ? results.rows : null)
	);
}

function getOrderedProductsListRepo(buyerId, orderId) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getOrderedProductsListRepo',
		context: 'Before Execution',
		message: 'get  ordered product list',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getOrderedProductsListRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(GETORDEREDPRODUCTLIST, [buyerId, orderId], (results) =>
		results.rowCount > 0 ? results.rows : null
	);
}

function getOrderStatusesRepo() {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getOrderStatusesRepo',
		context: 'Before Execution',
		message: 'get  ordere status',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getOrderStatusesRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(GETORDERSTATUSES, null, (result) =>
		result.rowCount > 0 ? result.rows : null
	);
}

function cancelOrderRepo(buyerId, orderId, user, remarks) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'cancelOrderRepo',
		context: 'Before Execution',
		message: 'cancel order',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'cancelOrderRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return transaction(async (client) => {
		customLogger.info({
			fileName: '/repo/order_repo.js',
			functionName: 'cancelOrderRepoCB',
			context: 'Before Execution',
			message: 'cancel order',
		});
		let statusId = await getStatusByStatusName(ORDERSTATUS.CANCEL);
		let updateResult = await client.query(CANCELORDER, [
			buyerId,
			orderId,
			user,
			remarks,
			statusId !== null ? statusId : DEFAULT_ORDER_CANCEL_STATUSID,
		]);
		customLogger.info({
			fileName: '/repo/order_repo.js',
			functionName: 'cancelOrderRepoCB',
			context: 'After Execution',
			message: 'Going to return without errors',
		});
		return updateResult.rowCount > 0 ? updateResult.rows[0] : null;
	});
}

function getTotalOrdersAndPendingOrdersBybuyerIdRepo(buyerId) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getTotalOrdersAndPendingOrdersBybuyerIdRepo',
		context: 'Before Execution',
		message: 'get TotalOrders And Pending Orders By buyer',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getTotalOrdersAndPendingOrdersBybuyerIdRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(
		GETTOTALORDERSPENDAMOUNTANDPENDINGORDERSBYBUYERID,
		[buyerId],
		(results) =>
			results.rowCount > 0
				? {
						totalSpendAmount: results.rows[0].total_spend_amount,
						pendingOrdersCount: results.rows[0].pending_orders,
				  }
				: null
	);
}

function checkForOrderCancellableRepo(orderId, buyerId) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'checkForOrderCancellableRepo',
		context: 'Before Execution',
		message: 'check For Order Cancel',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'checkForOrderCancellableRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(CHECKORDERCANCEL, [orderId, buyerId], (results) =>
		results.rowCount > 0 ? results.rows[0].exists : false
	);
}

function getTotalOrdersCountAndTotalAmountByBuyerIdRepo(buyerId) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getTotalOrdersCountAndTotalAmountByBuyerIdRepo',
		context: 'Before Execution',
		message: 'get total orders count and total amount',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getTotalOrdersCountAndTotalAmountByBuyerIdRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(
		GETTOTALORDERSCOUNTANDTOTALAMOUNTBYBUYERID,
		[buyerId],
		(result) =>
			result.rowCount > 0
				? {
						totalSpendAmount: parseInt(
							result.rows[0].total_spend_amount
						),
						totalOrdersCount: parseInt(
							result.rows[0].total_orders_count
						),
				  }
				: null
	);
}

function getAllOrdersByBuyerIdFilterByStatusesRepo(
	buyerId,
	statusesToFilter,
	limit
) {
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getAllOrdersByBuyerIdFilterByStatusesRepo',
		context: 'Before Execution',
		message: 'get All Orders By Buyer Id Filter By Statuses',
	});
	customLogger.info({
		fileName: '/repo/order_repo.js',
		functionName: 'getAllOrdersByBuyerIdFilterByStatusesRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return query(
		GETALLORDERSBYBUYERIDFILTERBYSTATUSES,
		[
			buyerId,
			statusesToFilter?.length == 0 || statusesToFilter == undefined
				? ['']
				: statusesToFilter,
			limit ? limit : 10,
		],
		(results) => (results.rowCount > 0 ? results.rows : null)
	);
}

module.exports = {
	addOrderRepo,
	getOrderByIdRepo,
	getRecentOrdersByBuyerIdRepo,
	getAllOrdersRepo,
	getAllOrdersByBuyerIdRepo,
	updateOrderStatusRepo,
	getRecentOrderedProductsListRepo,
	getOrderStatusesRepo,
	cancelOrderRepo,
	getOrderedProductsListRepo,
	getTotalOrdersAndPendingOrdersBybuyerIdRepo,
	getStatusByStatusName,
	checkForOrderCancellableRepo,
	getAllOrdersByClientIdRepo,
	getTotalOrdersCountAndTotalAmountByBuyerIdRepo,
	getAllOrdersByBuyerIdFilterByStatusesRepo,
	getRecentOrderByclientListRepo,
};
