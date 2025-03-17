import type { Server } from "socket.io";

export function connection(io: Server) {
  io.on("connection", (socket) => {
    socket.broadcast.emit("db-updated");
    socket.on("update-db", () => {
      socket.broadcast.emit("db-updated");
    });
  });
}
