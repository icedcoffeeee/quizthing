import type { Server } from "socket.io";

export function connection(io: Server) {
  io.on("connection", (socket) => {
    console.log("connection");
    socket.on("update-db", () => {
      console.log("sending updated");
      socket.emit("db-updated");
    });
  });
}
