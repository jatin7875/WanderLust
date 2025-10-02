class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message);   // pass message to parent Error
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;
