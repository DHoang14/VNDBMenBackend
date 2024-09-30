const allowedOrigins = require('../config/allowedOrigins');

const creds = (req, res, next) => {
    const origin = req.headers.orgin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
    }
    next();
}

module.exports = creds;