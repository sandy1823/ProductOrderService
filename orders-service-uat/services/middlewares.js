const { getAuthTokenFromRequest } = require('../utils/helper_tools');
const { failedResponse } = require('./common_service');
const { checkUser } = require('./inner_communication_service');
const config = require('../config/app_config.json');
const { customLogger } = require('../utils/logger');

async function checkUserMiddleware(request, response, next) {
	try {
		if (await checkUser(getAuthTokenFromRequest(request))) {
			next();
		} else {
			response.locals.responseCode = config.response_code.user_not_exists;
			failedResponse(response, { message: 'User not found' });
		}
	} catch (error) {
		customLogger.error({
			fileName: '/services/middlewares.js',
			functionName: 'checkUserMiddleware',
			context: 'Error Handling',
			message: error.message,
			code: error.code || error.status,
		});
		response.locals.responseCode = config.response_code.user_not_exists;
		failedResponse(response, { message: 'User not found' });
	}
}

module.exports = { checkUserMiddleware };
