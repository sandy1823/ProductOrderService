const config = require('../config/app_config');
const CommonResponse = require('../models/CommonResponse');
const { customLogger } = require('../utils/logger');

const handleCommonResponse = async (successCb, response) => {
	try {
		return await successCb((data) => {
			response
				.set('Connection', 'close')
				.status(config.http_status.ok)
				.send(data);
			customLogger.info({
				fileName: '/services/response_handle_service.js',
				functionName: 'handleCommonResponseCB',
				context: 'After Execution of all',
				message: `Finalizing and Sending response with code ${data?.header?.code}\n`,
			});
			if (response.locals.responseCb) {
				customLogger.info({
					fileName: '/services/response_handle_service.js',
					functionName: 'handleCommonResponseCB',
					context: 'If condition true block',
					message: `Going to run call postExecution`,
				});
				postExecution(response);
				customLogger.info({
					fileName: '/services/response_handle_service.js',
					functionName: 'handleCommonResponseCB',
					context: 'If condition true block',
					message: `postExecution has been successfully executed`,
				});
			}
		});
	} catch (error) {
		customLogger.error({
			fileName: '/services/response_handle_service.js',
			functionName: 'handleCommonResponse',
			context: 'Error Handling',
			message: error.message,
			code: error.code || error.status,
		});
		customLogger.info({
			fileName: '/services/response_handle_service.js',
			functionName: 'handleCommonResponseCB',
			context: 'After Execution of all in catch block',
			message: `Finalizing and Sending response with code ${
				error.responseCode ||
				config.response_code[
					config.errors[error.code || error.message]
				] ||
				config.response_code.error
			}\n`,
		});
		return response
			.set('Connection', 'close')
			.status(config.http_status.ok)
			.send(
				new CommonResponse()
					.setHeader(
						error.responseCode ||
							config.response_code[
								config.errors[error.code || error.message]
							] ||
							config.response_code.error
					)
					.setBody(error?.bodyData || null)
					.setError(
						error?.errorData || {
							message: error.message,
						}
					)
			);
	}
};

const postExecution = async (response) => {
	try {
		customLogger.info({
			fileName: '/services/response_handle_service.js',
			functionName: 'postExecution',
			context: 'Before Execution',
			message: `Executing task after response has been sent`,
		});
		const postExecutionResult = await response.locals.responseCb();
		customLogger.info({
			fileName: '/services/response_handle_service.js',
			functionName: 'postExecution',
			context: 'After Execution',
			message: `Executed task after response has been sent with result ${postExecutionResult}\n`,
		});
	} catch (error) {
		customLogger.error({
			fileName: '/services/response_handle_service.js',
			functionName: 'postExecution',
			context: 'Error Handling',
			message: error.message,
			code: error.code || error.status,
		});
	}
};

module.exports = handleCommonResponse;
