import { Request, Response, NextFunction } from "express";
import winston from "winston";

// Setup logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      request_id: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    };

    if (res.statusCode >= 400) {
      logger.warn(`API Request`, logData);
    } else if (duration > 1000) {
      logger.info(`Slow API Request`, logData);
    }
  });

  next();
};

export { logger };
