import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (replace with your frontend URL in production)
    methods: ["GET", "POST"],
  },
});

// Room data storage
const userInRoom = {}; // Users in each room
const messages = {}; // Messages for each room
const roomCode = {}; // Code for each room
const roomOutputCode = {}; // Output for each room
const roomHosts = {}; // Host for each room

// Function to get users in a room with host info
const findUserInRoom = (roomId) => {
  if (!userInRoom[roomId]) return [];
  return userInRoom[roomId].map((user) => ({
    ...user,
    isHost: user.id === roomHosts[roomId],
  }));
};

// Debug function to log room state
const logRoomState = (roomId) => {
  console.log(`\n--- Room ${roomId} State ---`);
  console.log(`Host: ${roomHosts[roomId]}`);
  console.log(`Users: ${JSON.stringify(userInRoom[roomId])}`);
  console.log(`------------------------\n`);
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle joining a room
  socket.on("joinroom", ({ name, roomId }) => {
    socket.join(roomId);
    const userId = uuidv4();

    // Store user details in socket
    socket.userId = userId;
    socket.roomId = roomId;
    socket.userName = name;

    // Send user ID to the client
    socket.emit("userId", { userId });

    // Initialize room data if it doesn't exist
    if (!userInRoom[roomId]) {
      console.log(`Creating new room: ${roomId}`);
      userInRoom[roomId] = [];
      messages[roomId] = [];
      roomCode[roomId] = "";
      roomOutputCode[roomId] = "";
      // First user to join becomes host
      roomHosts[roomId] = userId;
      console.log(`User ${userId} (${name}) is now the host of room ${roomId}`);
    }

    // Add user to the room
    userInRoom[roomId].push({ id: userId, name });

    // Determine if this user is the host
    const isHost = roomHosts[roomId] === userId;
    console.log(`User ${userId} (${name}) joined room ${roomId}, isHost: ${isHost}`);

    // Inform the client about their host status
    socket.emit("hostStatus", { isHost });

    // Log room state after joining
    logRoomState(roomId);

    // Broadcast updated user list to all clients in the room
    const updatedUserList = findUserInRoom(roomId);
    io.to(roomId).emit("userList", updatedUserList);

    // Create a system message for joining
    const joinMessage = {
      id: uuidv4(),
      text: `${name} joined the room${isHost ? " as host" : ""}`,
      type: "system",
      timestamp: new Date().toISOString(),
    };

    // Add to messages and broadcast
    messages[roomId].push(joinMessage);
    io.to(roomId).emit("message", joinMessage); // Broadcast to all users in the room
    console.log(`${name} joined room ${roomId}${isHost ? " as host" : ""}`);

    // Send message history and current code to the new user
    socket.emit("messageList", messages[roomId]);
    socket.emit("codeChange", roomCode[roomId]);
    socket.emit("updateOutputCode", roomOutputCode[roomId]);
  });

  // Handle user list request
  socket.on("getUserList", ({ roomId }) => {
    if (roomId && userInRoom[roomId]) {
      const updatedUserList = findUserInRoom(roomId);
      socket.emit("userList", updatedUserList);
    }
  });

  // Handle code changes from the host
  socket.on("codeChange", ({ roomId, code }) => {
    if (roomId && roomHosts[roomId] === socket.userId) {
      roomCode[roomId] = code;
      io.to(roomId).emit("codeChange", code); // Broadcast to all users in the room
      console.log(`Host ${socket.userName} updated code in room ${roomId}`);
    } else if (roomId) {
      console.log(`Non-host user ${socket.userName} attempted to change code in room ${roomId}`);
      // Reject the change and resend the current code to the user
      socket.emit("codeChange", roomCode[roomId]);
      // Re-send host status to ensure client knows they're not the host
      socket.emit("hostStatus", { isHost: roomHosts[roomId] === socket.userId });
    }
  });

  // Handle output code updates
  socket.on("outputCode", ({ roomId, output }) => {
    if (roomId && roomHosts[roomId] === socket.userId) {
      roomOutputCode[roomId] = output;
      io.to(roomId).emit("updateOutputCode", output); // Broadcast to all users in the room
      console.log(`Host ${socket.userName} updated output in room ${roomId}`);
    } else if (roomId) {
      console.log(`Non-host user ${socket.userName} attempted to update output in room ${roomId}`);
      // Re-send host status to ensure client knows they're not the host
      socket.emit("hostStatus", { isHost: roomHosts[roomId] === socket.userId });
    }
  });

  // Handle explicit host check request
  socket.on("checkHostStatus", ({ roomId }) => {
    if (roomId && socket.userId) {
      const isHost = roomHosts[roomId] === socket.userId;
      socket.emit("hostStatus", { isHost });
      console.log(`Host status check for ${socket.userName}: ${isHost}`);
    }
  });

  // Handle user messages
  socket.on("messageUser", ({ roomId, inputMessage }) => {
    if (roomId && inputMessage) {
      const newMessage = {
        id: uuidv4(),
        text: inputMessage,
        senderId: socket.userId,
        senderName: socket.userName,
        type: "user",
        timestamp: new Date().toISOString(),
      };

      // Add the message to the room's message history
      messages[roomId].push(newMessage);

      // Broadcast the message to all users in the room
      io.to(roomId).emit("message", newMessage); // Broadcast to all users in the room
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    const roomId = socket.roomId;
    const userId = socket.userId;
    const userName = socket.userName;

    if (roomId && userId) {
      // Remove user from the room
      userInRoom[roomId] = userInRoom[roomId].filter((user) => user.id !== userId);

      // If the host leaves, assign a new host
      if (roomHosts[roomId] === userId && userInRoom[roomId].length > 0) {
        roomHosts[roomId] = userInRoom[roomId][0].id;
        console.log(`New host assigned in room ${roomId}: ${roomHosts[roomId]}`);
        
        // Notify the new host
        const newHostSocket = [...io.sockets.sockets.values()]
          .find(s => s.userId === roomHosts[roomId]);
          
        if (newHostSocket) {
          newHostSocket.emit("hostStatus", { isHost: true });
          console.log(`Notified new host ${newHostSocket.userName} of their promotion`);
        }
      }

      // Log room state after disconnect
      logRoomState(roomId);

      // Broadcast updated user list
      const updatedUserList = findUserInRoom(roomId);
      io.to(roomId).emit("userList", updatedUserList);

      // Create a system message for leaving
      const leaveMessage = {
        id: uuidv4(),
        text: `${userName} left the room`,
        type: "system",
        timestamp: new Date().toISOString(),
      };

      messages[roomId].push(leaveMessage);
      io.to(roomId).emit("message", leaveMessage); // Broadcast to all users in the room
      console.log(`${userName} left room ${roomId}`);
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});