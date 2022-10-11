import { createContext } from "react";
import { io } from "socket.io-client";
const PYTHON_API_URL = `${process.env.REACT_APP_PYTHON_BACKEND}`;

export const socket = io(PYTHON_API_URL, {
  transports: ["websocket"],
  upgrade: false,
});

export const SocketContext = createContext();
