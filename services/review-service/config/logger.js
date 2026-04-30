const winston = require('winston');
const path    = require('path');
const fs      = require('fs');

const logDir = path.resolve(__dirname, '../../../logs');
fs.mkdirSync(logDir, { recursive: true });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const extras = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
          return `[${timestamp}] ${level}: ${message}${extras}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

module.exports = logger;
