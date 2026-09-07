require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const conversationRoutes = require('./routes/conversationRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const rentalRequestRoutes = require('./routes/rentalRequestRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();
const server = http.createServer(app); // <-- Express ko http server me wrap kiya (socket.io ke liye zaroori)

const io = new Server(server, {
  cors: { origin: '*' }, // development ke liye sab allow, production me specific URL dalna
});

connectDB();
app.set('io', io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/favorites', favoriteRoutes);

app.use('/api/conversations', conversationRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/rental-requests', rentalRequestRoutes);

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

const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  try {
    const user = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
    socket.userId = String(user.id || user._id || '');
    if (!socket.userId) return next(new Error('Not authorized'));
    next();
  } catch {
    next(new Error('Not authorized'));
  }
});

io.on('connection', (socket) => {
  socket.join('user:' + socket.userId);
  socket.on('sendMessage', async ({ conversationId, text } = {}, acknowledge) => {
    const reply = typeof acknowledge === 'function' ? acknowledge : () => { };
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || ![conversation.buyer, conversation.seller]
        .some((id) => String(id) === socket.userId)) {
        return reply({ error: 'Not authorized' });
      }
      if (typeof text !== 'string' || !text.trim()) {
        return reply({ error: 'Message text is required' });
      }
      const message = await Message.create({
        conversation: conversationId,
        sender: socket.userId,
        text: text.trim(),
      });
      await Conversation.updateOne({
        _id: conversationId,
        $or: [
          { lastMessageAt: { $lte: message.createdAt } },
          { lastMessageAt: null },
        ],
      }, {
        $set: { lastMessage: message.text, lastMessageAt: message.createdAt },
      });
      const populatedMessage = await message.populate('sender', 'name role');
      const details = await Conversation.findById(conversationId)
        .populate('car', 'makeModel image')
        .populate('buyer', 'name')
        .populate('seller', 'name businessName');
      if (!details) {
        await Message.deleteMany({ conversation: conversationId });
        return reply({ error: 'Conversation was deleted' });
      }
      // Room union delivers one event per socket, including unopened conversations.
      const messageData = populatedMessage.toObject();

      const buyerId = String(conversation.buyer);
      const sellerId = String(conversation.seller);
      const senderId = String(socket.userId);

      const receiverId =
        senderId === buyerId ? sellerId : buyerId;

      io.to('user:' + senderId).emit(
        'newMessage',
        { ...messageData, isMine: true },
        details
      );

      io.to('user:' + receiverId).emit(
        'newMessage',
        { ...messageData, isMine: false },
        details
      );
      reply({ success: true });
    } catch (err) {
      console.error('Message send error:', err);
      reply({ error: 'Failed to send message' });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); // <-- app.listen ki jagah server.listen
