var dbConfig = require('../config/app_config.json');
const { Pool } = require('pg');
const { customLogger } = require('../utils/logger');

const pool = new Pool({
	user: process.env.DB_POSTGRES_USER || dbConfig.db_postgres.user,
	host: process.env.DB_POSTGRES_HOST || dbConfig.db_postgres.host,
	database: process.env.DB_POSTGRES_DATABASE || dbConfig.db_postgres.database,
	password: process.env.DB_POSTGRES_PASSWORD || dbConfig.db_postgres.password,
	port: process.env.DB_POSTGRES_PORT || dbConfig.db_postgres.port,
});

pool.once('connect', () => {
	customLogger.info({
		fileName: '/repo/db_connection.js',
		functionName: 'connectEventListenerCB',
		context: 'Listening on connect event',
		message: 'Postgres server connection has been connected',
	});
});

pool.once('acquire', () => {
	customLogger.info({
		fileName: '/repo/db_connection.js',
		functionName: 'acquireEventListenerCB',
		context: 'Listening on acquire event',
		message: 'Postgres server connection has been acquired',
	});
});

pool.connect()
	.then(async (conn) => {
		customLogger.info({
			fileName: '/repo/db_connection.js',
			functionName: 'connectionTestingCB',
			context: 'Testing Connection',
			message:
				'Excuting query against database connection to ensure connection',
		});
		await conn.query(`SELECT 1`);
		conn.release();
		customLogger.info({
			fileName: '/repo/db_connection.js',
			functionName: 'connectionTestingCB',
			context: 'Testing Connection',
			message: 'Postgres server connection passed sucessfully',
		});
	})
	.catch((err) => {
		customLogger.error({
			fileName: '/repo/db_connection.js',
			functionName: 'connectionTestingCB',
			context: 'Error Handling',
			message: err.message,
			code: err.code || err.status,
		});
		process.exit(1);
	});

const query = async (text, params, resultCb) => {
	customLogger.info({
		fileName: '/repo/db_connection.js',
		functionName: 'query',
		context: 'Before Execution',
		message: `Executing query`,
	});
	try {
		const result = await pool.query(text, params);
		customLogger.info({
			fileName: '/repo/db_connection.js',
			functionName: 'query',
			context: 'After Execution',
			message: `query has been executed successfully`,
		});
		return await resultCb(result);
	} catch (error) {
		customLogger.error({
			fileName: '/repo/db_connection.js',
			functionName: 'query',
			context: 'Error Handling',
			message: error.message,
			code: error.code || error.status,
		});
		throw error;
	}
};

async function multipleQuery(callbacks) {
	customLogger.info({
		fileName: '/repo/db_connection.js',
		functionName: 'multipleQuery',
		context: 'Before Execution',
		message: `Connecting to connection pool`,
	});
	const client = await pool.connect();
	try {
		customLogger.info({
			fileName: '/repo/db_connection.js',
			functionName: 'multipleQuery',
			context: 'After Execution',
			message: `Returning client with callback`,
		});
		return await callbacks(client);
	} catch (error) {
		customLogger.error({
			fileName: '/repo/db_connection.js',
			functionName: 'multipleQuery',
			context: 'Error Handling',
			message: error.message,
			code: error.code || error.status,
		});
		throw error;
	} finally {
		customLogger.info({
			fileName: '/repo/db_connection.js',
			functionName: 'multipleQuery',
			context: 'Finally block',
			message: 'Closing connection',
		});
		client.release();
	}
}

async function transaction(transactionCb) {
	customLogger.info({
		fileName: '/repo/db_connection.js',
		functionName: 'transaction',
		context: 'Before Execution',
		message: `Connecting to connection pool and creating a transaction`,
	});
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		var insertion = await transactionCb(client);
		await client.query('COMMIT');
		customLogger.info({
			fileName: '/repo/db_connection.js',
			functionName: 'multipleQuery',
			context: 'After Execution',
			message: `Returning client with transaction callback result and commiting transaction`,
		});
		return insertion;
	} catch (error) {
		await client.query('ROLLBACK');
		customLogger.error({
			fileName: '/repo/db_connection.js',
			functionName: 'transaction',
			context: 'Error Handling',
			message: error.message,
			code: error.code || error.status,
		});
		throw error;
	} finally {
		customLogger.info({
			fileName: '/repo/db_connection.js',
			functionName: 'transaction',
			context: 'Finally block',
			message: 'Closing connection',
		});
		client.release();
	}
}

const sequenceOperation = async (cb) => {
	customLogger.info({
		fileName: '/repo/db_connection.js',
		functionName: 'sequenceOperation',
		context: 'Before Execution',
		message: `Connecting to connection pool`,
	});
	const client = await pool.connect();
	try {
		customLogger.info({
			fileName: '/repo/db_connection.js',
			functionName: 'sequenceOperation',
			context: 'After Execution',
			message: `Returning client with callback result and commiting transaction`,
		});
		return await cb(client);
	} catch (error) {
		customLogger.error({
			fileName: '/repo/db_connection.js',
			functionName: 'sequenceOperation',
			context: 'Error Handling',
			message: error.message,
			code: error.code || error.status,
		});
		throw error;
	} finally {
		customLogger.info({
			fileName: '/repo/db_connection.js',
			functionName: 'sequenceOperation',
			context: 'Finally block',
			message: 'Closing connection',
		});
		client.release();
	}
};

module.exports = {
	query,
	transaction,
	multipleQuery,
	pool,
	sequenceOperation,
};
