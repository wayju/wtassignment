import { createLogger, transports, format } from 'winston';

const debugLevel = 'debug';
const transport = new transports.Console();

const logger = createLogger({
  transports: [transport],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  level: 'info',
  rejectionHandlers: [transport]
});

function setDebugLogging() {
  logger.level = debugLevel;
}

export { logger, setDebugLogging };
