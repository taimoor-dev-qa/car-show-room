require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const conversationRoutes = require('./routes/conversationRoutes');
const rentalRoutes = require('./routes/rentalRoutes'); const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();
const server = http.createServer(app); // <-- Express ko http server me wrap kiya (socket.io ke liye zaroori)

const io = new Server(server, {
  cors: { origin: '*' }, // development ke liye sab allow, production me specific URL dalna
});

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/favorites', favoriteRoutes);

app.use('/api/conversations', conversationRoutes);
app.use('/api/rentals', rentalRoutes);

app.get('/', (req, res) => {
  res.send('CarZone API is running...');
});

const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/inquiries', inquiryRoutes);

// ==== SOCKET.IO LOGIC ====
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User apne conversation room me join karega
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Naya message bhejna
  socket.on('sendMessage', async ({ conversationId, senderId, text }) => {
    try {
      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        text,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text,
        lastMessageAt: new Date(),
      });

      const populatedMessage = await message.populate('sender', 'name role');

      // Isi conversation room me sabko naya message bhej do
      io.to(conversationId).emit('newMessage', populatedMessage);
    } catch (err) {
      console.error('Message send error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); // <-- app.listen ki jagah server.listen
