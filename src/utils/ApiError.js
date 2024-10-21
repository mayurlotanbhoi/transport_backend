class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something is Wrong",
        errors = [],
        stack = ''
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    static fromMongooseError(err) {
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => ({
                field: error.path,
                message: error.message,
            }));
            return new ApiError(400, 'Validation failed', errors);
        }
        return new ApiError(500, 'Internal Server Error', []);
    }
}

export { ApiError };
