const errorController = {
    handleError: (err, _, res) => {
        const { statusCode, message } = err;
        
        res.status(statusCode).json({
            status: "error",
            statusCode,
            message
        });
    }
}

module.exports = errorController;