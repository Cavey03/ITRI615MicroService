const logger = require('../config/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('Request', {
      method:  req.method,
      path:    req.originalUrl,
      status:  res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip:      req.ip,
    });
  });
  next();
}

module.exports = { requestLogger };
