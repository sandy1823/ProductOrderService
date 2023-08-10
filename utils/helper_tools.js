const { default: axios } = require('axios');
const { customLogger } = require('./logger');

function getRandomInt() {
	return Math.round(Math.random() * 9000000000) + 10000000;
}

async function fetchFile(src) {
	return axios.get(src, { responseType: 'arraybuffer' }).then((res) => {
		customLogger.info({
			fileName: '/utils/helper_tools.js',
			functionName: 'fetchFileCB',
			context: 'After getting response',
			message: `Got Response with status code ${res.status}`,
		});
		if (res.status == 200 && res.config.responseType == 'arraybuffer') {
			customLogger.info({
				fileName: '/utils/helper_tools.js',
				functionName: 'fetchFileCB',
				context: `If condition's true block`,
				message: `Going to return response`,
			});
			return res.data;
		}
		customLogger.warn({
			fileName: '/utils/helper_tools.js',
			functionName: 'fetchFileCB',
			context: `Condition check failed`,
			message: `Going to throw ApiException `,
		});
		throw new Error('Unable to fetch file');
	});
}

function unCaughtExceptionHandler(error) {
	customLogger.error({
		fileName: `/utils/helper_tools.js`,
		functionName: unCaughtExceptionHandler,
		context: 'Error Handling',
		message: error.message,
		code: error.code || error.status,
	});
	process.exit(1);
}

function getPingHandler() {
	return (req, res, _next) => {
		customLogger.info({
			fileName: `/utils/helper_tools.js`,
			functionName: 'getPingHandlerCB',
			context: 'ping handler',
			message: `Inside '${req.originalUrl}' of Order service`,
		});
		res.end(`Inside '${req.originalUrl}' of Order service`);
	};
}

function getAuthTokenFromRequest(req) {
	return {
		authorization: req.headers.authorization,
	};
}

function chunkArray(array, chunkSize, topChunkSize) {
	let result = [];
	if (topChunkSize) result.push(array.splice(0, topChunkSize));
	for (let i = 0; i < array.length; i += chunkSize) {
		result.push(array.slice(i, i + chunkSize));
	}
	return result;
}

function nFormatter(num, digits) {
	const lookup = [
		{ value: 1, symbol: '' },
		{ value: 1e3, symbol: 'k' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e9, symbol: 'G' },
		{ value: 1e12, symbol: 'T' },
		{ value: 1e15, symbol: 'P' },
		{ value: 1e18, symbol: 'E' },
	];
	const rx = '/.0+$|(.d*[1-9])0+$/';
	let item = lookup
		.slice()
		.reverse()
		.find((res) => num >= res.value);
	return item
		? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
		: '0';
}

module.exports = {
	getRandomInt,
	fetchFile,
	unCaughtExceptionHandler,
	getAuthTokenFromRequest,
	getPingHandler,
	chunkArray,
	nFormatter,
};
