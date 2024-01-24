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

app.use(express.static(join(__dirname, "../public")));

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
    // console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    pygameProcess.kill();
  });
});

io.on("connection", (socket) => {
  console.log("new game start");

  let pygameProcess;

  socket.on("controlPygame", (data) => {
    if (data.command === "start") {
      console.log("Received command to start Pygame");
      pygameProcess = spawn("python3", [
        join(__dirname, "./pymaping/pathfinding.py"),
      ]);

      pygameProcess.stdout.on("data", (output) => {
        io.emit("pygameOutput", output.toString());
      });
    } else if (data.command === "stop") {
      console.log("Received command to stop Pygame");
      if (pygameProcess) {
        pygameProcess.kill();
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    if (pygameProcess) {
      pygameProcess.kill();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}\n http://localhost:3100 `);
});

// 파이썬 코드가 웹에서 작동 XXX ??
// 1번 파이썬을 웹에서 작동하겠금 구성
// 2번 알고리즘을 JS환경에서 구성
