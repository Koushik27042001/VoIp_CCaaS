const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voip-command-center';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Basic Socket.io events
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });

  // Handle call events
  socket.on('start_call', (data) => {
    console.log('📞 Starting call:', data);
    // Emit call_ringing to all clients (including sender)
    io.emit('call_ringing', { ...data, status: 'ringing' });

    // Simulate call connection after 2 seconds
    setTimeout(() => {
      io.emit('call_connected', { ...data, status: 'connected' });
    }, 2000);
  });

  socket.on('end_call', () => {
    console.log('❌ Ending call');
    io.emit('call_ended', { status: 'ended' });
  });
});

// API Routes
app.get('/api/customers', (req, res) => {
  // Mock customers data
  const mockCustomers = [
    {
      id: "ld-1001",
      name: "Aarav Sharma",
      company: "Nimbus Labs",
      phone: "+91 98765 43210",
      email: "aarav@nimbuslabs.io",
      status: "Interested",
      priority: "Hot",
    },
    {
      id: "ld-1002",
      name: "Meera Iyer",
      company: "Orbit Retail",
      phone: "+91 99887 76655",
      email: "meera@orbitretail.in",
      status: "Contacted",
      priority: "Warm",
    },
    {
      id: "ld-1003",
      name: "Rohan Verma",
      company: "BluePeak Finance",
      phone: "+91 90123 45678",
      email: "rohan@bluepeak.finance",
      status: "New",
      priority: "Warm",
    },
    {
      id: "ld-1004",
      name: "Priya Nair",
      company: "ZenCargo",
      phone: "+91 91234 56789",
      email: "priya@zencargo.co",
      status: "Closed",
      priority: "Cold",
    },
  ];

  res.json(mockCustomers);
});

app.get('/api/analytics', (req, res) => {
  // Mock analytics data
  const mockAnalytics = {
    callsHandled: 47,
    missedCalls: 6,
    csat: 4.6,
    conversionRate: 28,
    avgHandleTime: "04:18",
  };

  res.json(mockAnalytics);
});

// Root Route
app.get('/', (req, res) => {
  res.send('VoIP Command Center API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
