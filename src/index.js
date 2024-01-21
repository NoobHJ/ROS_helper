// server.js

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3100;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  const pygameProcess = spawn("python3", [
    join(__dirname, "./pymaping/pathfinding.py"),
  ]);

  pygameProcess.stdout.on("data", (data) => {
    io.emit("pygameOutput", data.toString());
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    pygameProcess.kill();
  });
});

io.on("connection", (socket) => {
  console.log("A user connected");

  const pygameProcess = spawn("python", [
    join(__dirname, "path/to/your/pygame_script.py"),
  ]);

  pygameProcess.stdout.on("data", (data) => {
    io.emit("pygameOutput", data.toString());
  });

  socket.on("controlPygame", (data) => {
    if (data.command === "start") {
      console.log("Received command to start Pygame");
    } else if (data.command === "stop") {
      console.log("Received command to stop Pygame");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    pygameProcess.kill();
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
