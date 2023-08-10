const { customLogger } = require('../utils/logger');
const { transaction, query } = require('./db_connection');
const {
	ADDREFUND,
	GETREFUNDDATA,
	UPDATEREFUNDSTATUS,
} = require('./db_queries');

function addRefundRepo(record) {
	customLogger.info({
		fileName: '/repo/refund_repo.js',
		functionName: 'addRefundRepo',
		context: 'Before Execution',
		message: 'add Refund ',
	});
	customLogger.info({
		fileName: '/repo/refund_repo.js',
		functionName: 'addRefundRepo',
		context: 'After Execution',
		message: 'Going to return without errors',
	});
	return transaction(async (client) => {
		customLogger.info({
			fileName: '/repo/refund_repo.js',
			functionName: 'addRefundRepoCB',
			context: 'Before Execution',
			message: 'add Refund ',
		});
		let ordeRefundResult = await client.query(
			ADDREFUND,
			Object.values(record)
		);
		if (ordeRefundResult.rowCount > 0) {
			customLogger.info({
				fileName: '/repo/refund_repo.js',
				functionName: 'addRefundRepoCB',
				context: 'if block true condition',
				message: 'Refund from database has found',
			});
			customLogger.info({
				fileName: '/repo/refund_repo.js',
				functionName: 'addRefundRepoCB',
				context: 'After Execution',
				message: 'Going to return without errors',
			});
			return ordeRefundResult.rows[0];
		} else {
			customLogger.warn({
				fileName: '/repo/refund_repo.js',
				functionName: 'addRefundRepoCB',
				context: 'else block false condition',
				message: 'throwing exception with unable to store refund data',
			});
			throw new ApiException({ message: 'Unable to store refund data' });
		}
	});
}

function getRefundRepo(orderId) {
	customLogger.info({
		fileName: '/repo/refund_repo.js',
		functionName: 'getRefundRepo',
		context: 'Before Execution',
		message: 'get Refund ',
	});
	customLogger.info({
		fileName: '/repo/refund_repo.js',
		functionName: 'getRefundRepo',
		context: 'get Execution',
		message: 'add Refund ',
	});
	return query(GETREFUNDDATA, [orderId], (results) =>
		results.rowCount > 0 ? results.rows[0] : null
	);
}

function updateRefundStatusRepo(orderId, refundId, status) {
	customLogger.info({
		fileName: '/repo/refund_repo.js',
		functionName: 'updateRefundStatusRepo',
		context: 'Before Execution',
		message: 'update Refund ',
	});
	customLogger.info({
		fileName: '/repo/refund_repo.js',
		functionName: 'updateRefundStatusRepo',
		context: 'get Execution',
		message: 'update Refund ',
	});
	return query(UPDATEREFUNDSTATUS, [orderId, refundId, status], (results) =>
		results.rowCount > 0 ? results.rows[0] : null
	);
}

module.exports = {
	addRefundRepo,
	getRefundRepo,
	updateRefundStatusRepo,
};
