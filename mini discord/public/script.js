const socket = io();

// Ask for username
let username = prompt("Enter your username:");
if (!username) username = "Anonymous";

let currentRoom = "";

// Handle joining a room
function joinRoom() {
  const room = document.getElementById("roomNameInput").value.trim();
  const password = document.getElementById("roomPasswordInput").value.trim();

  if (!room || !password) {
    alert("Please enter both room name and password.");
    return;
  }

  if (currentRoom) {
    socket.emit("leave-room", currentRoom);
  }

  socket.emit("join-room", { room, password, username });
}

// Success/fail handlers
socket.on("join-success", ({ room }) => {
  currentRoom = room;
  document.getElementById("chat-box").innerHTML = "";
  console.log("✅ Joined room:", room);
});

socket.on("join-failed", (reason) => {
  alert("❌ Failed to join: " + reason);
});

// Send message
function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();

  if (message && currentRoom) {
    socket.emit("message", {
      username,
      text: message,
      room: currentRoom,
    });
    input.value = "";
  }
}

// Receive message
socket.on("message", (msg) => {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ✅ Typing indicator — visible while typing
document.getElementById("messageInput").addEventListener("input", () => {
  socket.emit("typing", username);
});

// Show typing info
socket.on("typing", (user) => {
  const typingBox = document.getElementById("typingBox");
  typingBox.textContent = `${user} is typing...`;
  setTimeout(() => {
    typingBox.textContent = "";
  }, 1500);
});

// ✅ Emoji picker
const picker = new EmojiButton();
const emojiBtn = document.createElement("button");
emojiBtn.id = "emojiBtn";
emojiBtn.textContent = "😊";
emojiBtn.style.marginLeft = "10px";
document.querySelector(".input-area").appendChild(emojiBtn);

picker.on("emoji", (emoji) => {
  const input = document.getElementById("messageInput");
  input.value += emoji;
});

emojiBtn.addEventListener("click", () => {
  picker.togglePicker(emojiBtn);
});
