export class AppError extends Error {
    constructor(statusCode, message, errorCode) {
        super(message);
        Object.defineProperty(this, "statusCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: statusCode
        });
        Object.defineProperty(this, "message", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: message
        });
        Object.defineProperty(this, "errorCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: errorCode
        });
        // Ensuring proper prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
