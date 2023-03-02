const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const app = express();


// allow cross origin requests
const allowedOrigins = ["http://localhost:3000", "http://localhost:8000", "http://localhost:8001", "https://video-calling-nine.vercel.app"];

const io = new Server({
  // allow cross origin requests
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }

});

const corss = require('cors');
app.use(corss({
  origin: allowedOrigins,
  credentials: true

}))

const HTTTP_PORT = 8000;
const SOCKET_PORT = 8001;
app.use(bodyParser.json());


app.get("/", (req, res) => {
  res.json({
    message: "Video Calling backend is running...",
  })
});

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  console.log("New Connection");

  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log(`User ${emailId} joined room ${roomId}`);
    emailToSocketMapping.set(emailId, socket.id);
    socketToEmailMapping.set(socket.id, emailId);
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-connected", { emailId });
  });

  socket.on("call-user", (data) => {
    const { emailId, offer } = data;
    const fromEmail = socketToEmailMapping.get(socket.id);
    const socketId = emailToSocketMapping.get(emailId);
    socket.to(socketId).emit("incoming-call", {
      from: fromEmail,
      offer,
    });
  });

  socket.on("call-accepted", (data) => {
    const { emailId, ans } = data;
    const socketId = emailToSocketMapping.get(emailId);
    socket.to(socketId).emit("call-accepted", { ans });
  });
});

app.listen(HTTTP_PORT, () => {
  console.log(
    `HTTP Server is listening on port http://localhost:${HTTTP_PORT}`
  );
});

io.listen(SOCKET_PORT, () => {
  console.log(
    `Socket Server is listening on port http://localhost:${SOCKET_PORT}`
  );
});
