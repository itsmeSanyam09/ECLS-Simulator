import express, { urlencoded } from "express";
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
import { Socket } from "dgram";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity; adjust as needed
        methods: ["GET", "POST"],
        credentials: true
    },
});

dotenv.config();
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173" ,"https://ecmo-frontend.vercel.app" , "https://ecmo-backend.onrender.com"],
    methods: ['GET','POST'],
    credentials: true,
  })
);

const sessions = new Map< string,string >();

app.use('/api/health', HealthRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/waves', WaveRouter);

io.on('connection',(socket)=>{
    console.log("a new user connected :",socket.id);
    socket.on('session-create',({roomId,roomName})=>{
      console.log("session created with data",roomName)
      const sessionId = roomId;
      console.log("session creation",sessionId)
      sessions.set(sessionId,roomName);
      // io.emit('sessions-list',(Array.from(sessions.entries()).map(([SessionId, SessionName]) => ({ SessionId, SessionName }))),()=>{
      //   console.log("sessions",sessions)
      
      // })

        
    })
    socket.on('update-values',({roomId,heartRate,pixelsPerMv})=>{
      console.log('values updated')
      io.to(roomId).emit('recieve-values',{heartRate,pixelsPerMv},()=>{
        console.log("values emmited for recieve values",roomId)
      })

    })
    socket.on('join-session',(roomId)=>{
      console.log('session joined',roomId)
        socket.join(roomId);
    })
    socket.on('delete-session',(roomId)=>{
      sessions.delete(roomId)
      console.log("session deleted",roomId)
    })


    socket.on('disconnect',(id)=>{
         console.log("a user disconnected",id)
    })
})

app.get("/api/sessions", (req, res) => {
  res.json(Array.from(sessions.entries()).map(([SessionId, SessionName]) => ({ SessionId, SessionName })));
});

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