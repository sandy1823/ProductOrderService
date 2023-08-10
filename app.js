var express = require('express');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var fs = require('fs');
var path = require('path');
var morgan = require('morgan');
var logger = require('morgan');
const token = require('@platform_jewels/bassure-node/service/token');

var orderRouter = require('./routers/orders');
const { ORDERBASEURL, PING } = require('./utils/endpoints');
const {
	unCaughtExceptionHandler,
	getPingHandler,
} = require('./utils/helper_tools');
const { failedResponse } = require('./services/common_service');
const { LOGS_DIR } = require('./utils/constants');
const { customLogger, getExceptionalLogger } = require('./utils/logger');

var app = express();

app.use(
	morgan('combined', {
		stream: fs.createWriteStream(
			path.join(LOGS_DIR, 'order_service_app_history.log'),
			{
				flags: 'a',
			}
		),
	})
);
getExceptionalLogger();
app.use(logger('dev'));
app.use(cors({ exposedHeaders: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get(PING, getPingHandler());

app.get(`${ORDERBASEURL}${PING}`, getPingHandler());

app.use(token.verifyToken);

app.use(ORDERBASEURL, orderRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
// 	next(createError(404));
// });

// error handler
app.use(function (err, _req, res, _next) {
	customLogger.error({
		fileName: '/app.js',
		functionName: null,
		context: 'Error Handling',
		message: err.message,
		code: err.code || err.status,
	});
	failedResponse(res, {
		status: err.status,
		code: err.code,
		message: err.message,
	});
});

process.on('uncaughtException', unCaughtExceptionHandler);
process.on('unhandledRejection', unCaughtExceptionHandler);

app.listen(4100, () => {
	customLogger.info({
		fileName: '/app.js',
		functionName: 'listeningEventHandlerCB',
		context: 'Listening server event',
		message: `Server has been successfully started`,
	});
});

module.exports = app;
