import express from "express";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import { HealthRouter } from "./routes/health.route";
import { ValidateUserMiddleware } from "./middlewares/auth.middleware";
import { AuthRouter } from "./routes/auth.route";
import { createServer } from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import axios from "axios";


import { WaveRouter } from "./routes/wave.route";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity; adjust as needed
        methods: ["GET", "POST"],
    },
});

dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173" ,"https://ecmo-frontend.vercel.app" , "https://ecmo-backend.onrender.com"],
    credentials: true,
  })
);

app.use('/api/health', HealthRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/waves', WaveRouter);

// app.use(ValidateUserMiddleware);
//TODO : add all other routes here

const PORT = process.env.PORT || 3000;  
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Start health check cron job only after server is running
cron.schedule("*/15 * * * *", async () => {
  try {
    console.log(`Attempting health check`);

    const _ = await axios.get(`https://ecmo-backend.onrender.com/api/health`);

    console.log("Health check passed");
  } catch (error: any) {
    console.log(`Health check failed: ${error.message}`);
  }
});