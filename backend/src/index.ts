import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import "express-async-errors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

// Import routes
import searchRoutes from "./routes/search";
import packageRoutes from "./routes/packages";
import operatorRoutes from "./routes/operators";
import healthRoutes from "./routes/health";
import adminRoutes from "./routes/admin";
import ingestionRoutes from "./routes/ingestion";

// Middleware
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Trust proxy
app.set("trust proxy", 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Compression
app.use(compression());

// Attach request ID
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = req.headers["x-request-id"] as string || uuidv4();
  res.setHeader("X-Request-ID", req.id);
  next();
});

// Request logging
app.use(requestLogger);

// API Routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/packages", packageRoutes);
app.use("/api/v1/operators", operatorRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/ingestion", ingestionRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Endpoint ${req.method} ${req.path} not found`,
      statusCode: 404,
    },
    timestamp: new Date().toISOString(),
    request_id: req.id,
  });
});

// Error handling
app.use(errorHandler);

// Start server (only in non-serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const HOST = '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(
      `\n🚀 OnTrip Backend API running on http://localhost:${PORT}\n`
    );
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`\n📱 Access from other devices: http://<YOUR_IP>:${PORT}\n`);
  });
}

// Export for Vercel serverless
export default app;
