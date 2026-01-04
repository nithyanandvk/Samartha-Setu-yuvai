const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000" }
});

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// DB Connection with Retry
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samartha-setu', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      tls: true
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// Socket Handling
io.on('connection', (socket) => {
  socket.on('join-room', (r) => socket.join(r));
});
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/matching', require('./routes/matching'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/fridges', require('./routes/fridges'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/disasters', require('./routes/disasters'));

app.get('/api/health', (req, res) => res.json({ status: "OK" }));

// Start expiry job
const { startExpiryJob } = require('./utils/expiryJob');
mongoose.connection.once('open', () => {
  startExpiryJob(io);
});

server.listen(process.env.PORT || 5000, () => console.log("🚀 Server Started"));

module.exports = { app, io };
