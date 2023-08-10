class ApiException extends Error {
	constructor({ message, responseCode, bodyData, errorData }) {
		super(message);
		Error.captureStackTrace(this, this.constructor);
		this.name = this.constructor.name;
		this.responseCode = responseCode;
		this.bodyData = bodyData;
		this.errorData = errorData;
	}
}

module.exports = ApiException;
