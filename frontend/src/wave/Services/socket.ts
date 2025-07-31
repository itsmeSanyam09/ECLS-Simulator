import { io } from "socket.io-client";

const env = import.meta.env;
export const SOCKET_URL = env.VITE_BASE_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
