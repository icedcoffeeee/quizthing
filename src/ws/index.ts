import type { Server } from "socket.io";

export function connection(io: Server) {
  io.on("connection", (socket) => {
    socket.on("submit-answer", () => socket.emit("db-updated"));
  });
}
