const { z } = require('zod');

const validationRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            res.status(400).json({ error: error.errors });
        }
    };
};

module.exports = validationRequest;