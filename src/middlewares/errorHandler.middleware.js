import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const errorHandler = (err, req, res, next) => {
    // Handle custom ApiError (application-specific errors)

    if (err instanceof ApiError) {
        return res.status(429).json(new ApiResponse(err.statusCode, null, err.message || 'An error occurred'));
        // return res.status(err.statusCode).json({
        //     success: err.success || false,
        //     message: err.message || 'An error occurred',
        //     errors: err.errors || [],
        //     data: err.data || null,
        // });
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const apiError = ApiError.fromMongooseError(err);
        return res.status(429).json(new ApiResponse(apiError.statusCode, null, apiError.message || 'Validation Error'));

        // {
        //     success: apiError.success || false,
        //     message: apiError.message || 'Validation Error',
        //     errors: apiError.errors || [],
        //     data: apiError.data || null,
        // }
    }

    // Handle duplicate key error (MongoDB unique constraint violation)
    if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyPattern || {})[0];
        const message = `A record with this ${duplicateField} already exists.`;
        return res.status(429).json(new ApiResponse(409, null, message));
    }

    // Handle cast errors (invalid ObjectId in MongoDB)
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}.`;
        return res.status(429).json(new ApiResponse(400, null, message));
    }

    // Handle SyntaxError (invalid JSON)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(429).json(new ApiResponse(400, null, 'Invalid JSON syntax.'));
    }

    // Handle JWT errors (invalid or expired tokens)
    if (err.name === 'JsonWebTokenError') {
        return res.status(429).json(new ApiResponse(401, null, 'Invalid token.'));
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(429).json(new ApiResponse(401, null, 'Token has expired.'));
    }

    // Handle multer file upload errors
    if (err.name === 'MulterError') {
        const message = `File upload error: ${err.message}`;
        return res.status(429).json(new ApiResponse(400, null, message));
    }

    // Handle rate limit errors
    if (err.name === 'RateLimitError') {
        return res.status(429).json(new ApiResponse(429, null, 'Too many requests. Please try again later.'));
    }


    return res.status(500).json(new ApiResponse(500, {
        success: false,
        message: 'Internal Server Error',
        errors: [err.message || 'An unexpected error occurred'],
        data: null,
    }, 'Internal Server Error'));


    // Handle other errors (default catch-all)
    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        errors: [err.message || 'An unexpected error occurred'],
        data: null,
    });
};

export default errorHandler;
