import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = env.VITE_WAVE_URL;

export const socket = io(URL);