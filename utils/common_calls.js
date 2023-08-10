const { default: axios } = require('axios');
const ApiException = require('../models/ApiException');
const config = require('../config/app_config.json');
const { customLogger } = require('./logger');

async function commonCall({
	url,
	method,
	headers,
	params,
	data,
	resultCB,
	errorMsg,
}) {
	const urlInstance = new URL(url);
	customLogger.info({
		fileName: '/utils/commonCall.js',
		functionName: 'commonCall',
		context: 'Before Execution',
		message: `Making internal call to ${urlInstance.href} service`,
	});
	try {
		let response = await axios({
			url: urlInstance.href,
			method,
			params,
			data,
			headers,
		});
		customLogger.info({
			fileName: '/utils/commonCall.js',
			functionName: 'commonCall',
			context: 'After getting response',
			message: `Got Response with status code ${response.status}`,
		});
		if (response.status == 200) {
			customLogger.info({
				fileName: '/utils/commonCall.js',
				functionName: 'commonCall',
				context: `If condition's true block`,
				message: `Going to return response`,
			});
			customLogger.info({
				fileName: '/utils/commonCall.js',
				functionName: 'commonCall',
				context: 'After Execution',
				message: `Executed Without errors`,
			});
			return resultCB
				? resultCB(response.data)
				: commonResponseHandler(response.data);
		} else {
			customLogger.warn({
				fileName: '/utils/commonCall.js',
				functionName: 'commonCall',
				context: `If condition's false block`,
				message: `Going to throw ApiException `,
			});
			throw new ApiException({
				message: errorMsg,
				responseCode: config.response_code.expectation_failed,
				errorData: response.status || response.data?.header?.code,
			});
		}
	} catch (error) {
		if (!error.responseCode) {
			customLogger.error({
				fileName: '/utils/commonCall.js',
				functionName: 'commonCall',
				context: 'Error Handling',
				message: error.message,
				code: error.code || error.status,
			});
			throw new ApiException({
				message: errorMsg,
				responseCode: config.response_code.unable_to_make_internal_call,
			});
		}
		throw error;
	}
}

function commonResponseHandler(response) {
	customLogger.info({
		fileName: '/utils/commonCall.js',
		functionName: 'commonResponseHandler',
		context: 'Before Execution',
		message: `Handling response`,
	});
	if (response.header.code == 600 && response.error == null) {
		customLogger.info({
			fileName: '/utils/commonCall.js',
			functionName: 'commonResponseHandler',
			context: `If condition's true block`,
			message: `Going to return response data`,
		});
		return response.data.value;
	} else {
		customLogger.warn({
			fileName: '/utils/commonCall.js',
			functionName: 'commonResponseHandler',
			context: `If condition's false block`,
			message: `Going to throw ApiException `,
		});
		throw new ApiException({
			message: 'Unable to get proper response',
			responseCode: config.response_code.expectation_failed,
			errorData: response.header.code,
		});
	}
}

module.exports = {
	commonCall,
	commonResponseHandler,
};
