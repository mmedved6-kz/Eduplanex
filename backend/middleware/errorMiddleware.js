const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    // Default error responses
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wront!';

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = errorMiddleware;