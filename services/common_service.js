var config = require('../config/app_config.json');
var handleCommonResponse = require('../services/response_handle_service');
var CommonResponse = require('../models/CommonResponse');
const { HTTP_METHOD } = require('../utils/constants');

function serviceHandler(serviceCB) {
	return (request, response) =>
		handleCommonResponse(async (resCb) => {
			response.locals.errors = [];
			let resultToSend = await serviceCB(request, response);
			return resCb(
				new CommonResponse()
					.setHeader(
						response.locals?.responseCode ||
							getResponseCode(resultToSend, response)
					)
					.setBody(resultToSend)
					.setError(
						response.locals.errors.length == 0
							? null
							: response.locals.errors
					)
			);
		}, response);
}

function failedResponse(response, errors) {
	return handleCommonResponse(async (resCb) => {
		return resCb(
			new CommonResponse()
				.setHeader(
					response.locals?.responseCode || config.response_code.error
				)
				.setError(errors)
		);
	}, response);
}

function getResponseCode(result, response) {
	switch (response.req.method) {
		case HTTP_METHOD.GET:
			return result === null || result?.length === 0
				? config.response_code.empty_results
				: config.response_code.success;
		case HTTP_METHOD.POST:
			return result == undefined || result == null
				? config.response_code.error
				: config.response_code.success;
		case HTTP_METHOD.PUT:
			return result == undefined || result == null || result?.length == 0
				? config.response_code.error
				: config.response_code.success;
		case HTTP_METHOD.DELETE:
			return result == 0 || result == null
				? config.response_code.error
				: config.response_code.success;
		default:
			return config.response_code.error;
	}
}

module.exports = {
	serviceHandler,
	failedResponse,
};
