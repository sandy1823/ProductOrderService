module.exports = class CommonResponse {
	constructor() {
		this.header = null;
		this.data = null;
		this.error = null;
	}
	setHeader(code) {
		this.header = {
			code: code,
		};
		return this;
	}
	setBody(value) {
		this.data = {
			value: value ? value : null,
		};
		return this;
	}
	setError(errors) {
		this.error = errors ? errors : null;
		return this;
	}
};
