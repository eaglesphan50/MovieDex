import * as winston from 'winston';

export const logger = winston.createLogger({
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});