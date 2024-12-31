import http from 'http';
import app from './app.js';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Project from './models/project.model.js';

dotenv.config();

const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize a new instance of Socket.IO and bind it to the server
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(' ')[1];
    const projectId = socket.handshake.query.projectId;
    if (!projectId) {
      return next(new Error('Project id not found while connecting to socket'));
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error('socket connection failed, invalid projectId'));
    }

    socket.project = await Project.findById(projectId);

    if (!token) {
      return next(new Error('Unauthorized User, no token found'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error('Authentication failed'));
    }
    socket.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
});

io.on('connection', (socket) => {
  socket.roomId = socket.project._id.toString();
  console.log('A user connected');
  console.log(socket.roomId);
  socket.join(socket.roomId);

  socket.on('project-message', (data) => {
    console.log(data);
    socket.broadcast.to(socket.roomId).emit('project-message', data);
  });

  // Listen for the 'disconnect' event when a user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server is running
});
