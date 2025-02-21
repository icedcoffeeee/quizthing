import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";
import { Server } from "socket.io";
import { connection } from "./src/ws";

const wsserver: Plugin = {
  name: "wsserver",
  configureServer: (server) => {
    if (!server.httpServer) return;
    const io = new Server(server.httpServer);
    connection(io);
  },
};

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), wsserver],
});
