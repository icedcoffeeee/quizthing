import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import { handler } from "./build/handler.js";
const { connection } = await import("./src/ws/index.ts");

const app = express();
const server = createServer(app);

const io = new Server(server);
connection(io);

app.use(handler); // sveltekit
server.listen(4173);
