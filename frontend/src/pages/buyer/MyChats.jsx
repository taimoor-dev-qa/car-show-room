import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';
import '../../styles/01-base-header.css';
import '../../styles/08-chat.css';

export default function MyChats() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchConversations();
  }, []);

  useEffect(() => {
    socket.on('newMessage', (message) => {
      setMessages((prev) => {
        if (activeConvo && message.conversation === activeConvo._id) {
          return [...prev, message];
        }
        return prev;
      });
    });
    return () => socket.off('newMessage');
  }, [activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  const openConversation = async (convo) => {
    setActiveConvo(convo);
    socket.emit('joinConversation', convo._id);
    try {
      const res = await API.get(`/conversations/${convo._id}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConvo) return;
    socket.emit('sendMessage', {
      conversationId: activeConvo._id,
      senderId: user.id,
      text: text.trim(),
    });
    setText('');
  };

  const sellerLabel = (convo) => convo.seller?.businessName || convo.seller?.name || 'Seller';

  return (
    <div className="chat-page-wrapper">
      {/* Conversations List */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>My Messages</h2>
        </div>

        {conversations.length === 0 && (
          <p className="chat-empty-note">No conversations yet.<br />Message a seller from a car's detail page.</p>
        )}

        {conversations.map((convo) => (
          <div
            key={convo._id}
            onClick={() => openConversation(convo)}
            className={`chat-convo-item ${activeConvo?._id === convo._id ? 'active' : ''}`}
          >
            <div className="chat-convo-avatar">{sellerLabel(convo).charAt(0).toUpperCase()}</div>
            <div className="chat-convo-info">
              <div className="chat-convo-name">{sellerLabel(convo)}</div>
              <div className="chat-convo-car">{convo.car?.makeModel}</div>
              <div className="chat-convo-preview">{convo.lastMessage || 'No messages yet'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {!activeConvo ? (
          <div className="chat-window-empty">
            <span>💬</span>
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            <div className="chat-window-header">
              <div className="chat-convo-avatar">{sellerLabel(activeConvo).charAt(0).toUpperCase()}</div>
              <div className="chat-window-header-info">
                <strong>{sellerLabel(activeConvo)}</strong>
                <span>About: {activeConvo.car?.makeModel}</span>
              </div>
            </div>

            <div className="chat-messages-area">
              {messages.map((msg) => {
                const isMine = msg.sender._id === user.id || msg.sender === user.id;
                return (
                  <div key={msg._id} className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                    <div className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="chat-input-row">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit" className="chat-send-btn">Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}