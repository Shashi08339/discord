const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const historyFile = path.join(__dirname, "chat-history.json");
let chatHistory = fs.existsSync(historyFile)
  ? JSON.parse(fs.readFileSync(historyFile, "utf8"))
  : {};

const roomPasswords = {}; // { roomName: password }

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("✅ New user connected");

  socket.on("join-room", ({ room, password, username }) => {
    if (!roomPasswords[room]) {
      roomPasswords[room] = password;
      console.log(`🔐 Room '${room}' created`);
    }

    if (roomPasswords[room] !== password) {
      socket.emit("join-failed", "Wrong password.");
      return;
    }

    socket.join(room);
    socket.currentRoom = room;
    socket.username = username;

    socket.emit("join-success", { room });

    io.to(room).emit("message", {
      username: "⚡",
      text: `${username} joined the chat`,
    });
  });

  socket.on("leave-room", (room) => {
    socket.leave(room);
  });

  socket.on("message", (msg) => {
    io.to(msg.room).emit("message", msg);
  });

  socket.on("typing", (username) => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit("typing", username);
    }
  });

  socket.on("disconnect", () => {
    if (socket.username && socket.currentRoom) {
      io.to(socket.currentRoom).emit("message", {
        username: "⚡",
        text: `${socket.username} left the chat`,
      });
    }
  });
});

http.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
app.use(express.static("public"));
http.listen(3000, () => {
  console.log("🚀 Server running");
});
