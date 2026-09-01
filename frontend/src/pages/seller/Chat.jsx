import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';
import '../../styles/seller-style.css';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }
    socket.connect();
    fetchConversations();
    return () => socket.disconnect();
  }, []);

  // Naya message aane pe socket se sunna
  useEffect(() => {
    socket.on('newMessage', (message) => {
      // Sirf tabhi add karo agar wo currently khuli hui conversation ka hai
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

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🚗</div>
          <div className="brand-text"><h2>Car<span>Zone</span></h2><span>Seller Panel</span></div>
        </div>
        <div className="sidebar-section-title">MAIN MENU</div>
        <nav className="nav-menu">
          <Link to="/seller/dashboard" className="nav-item"><span>Dashboard</span></Link>
          <Link to="/seller/inquiries" className="nav-item"><span>Inquiries</span></Link>
          <Link to="/seller/chat" className="nav-item active"><span>Messages</span></Link>
        </nav>
        <div className="sidebar-section-title">SYSTEM</div>
        <nav className="nav-menu">
          <Link to="/seller/profile" className="nav-item"><span>Settings</span></Link>
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="back-to-site">← Back to CarZone</Link>
          <a onClick={logout} className="back-to-site" style={{ cursor: 'pointer' }}>Logout</a>
        </div>
      </aside>

      <main className="main-content" style={{ display: 'flex', gap: 0, padding: 0, height: '100vh' }}>
        {/* Conversations List */}
        <div style={{ width: 300, borderRight: '1px solid #e5e7eb', overflowY: 'auto', background: '#fff' }}>
          <div style={{ padding: 20, borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: 16 }}>Messages</h2>
          </div>
          {conversations.length === 0 && (
            <p style={{ padding: 20, fontSize: 13, color: '#64748b' }}>No conversations yet.</p>
          )}
          {conversations.map((convo) => (
            <div
              key={convo._id}
              onClick={() => openConversation(convo)}
              style={{
                padding: 16, cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                background: activeConvo?._id === convo._id ? '#fee2e4' : 'transparent',
              }}
            >
              <strong style={{ fontSize: 13.5 }}>{convo.buyer?.name}</strong>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0' }}>{convo.car?.makeModel}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {convo.lastMessage || 'No messages yet'}
              </p>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f6f7fb' }}>
          {!activeConvo ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              <div style={{ padding: 16, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                <strong>{activeConvo.buyer?.name}</strong>
                <p style={{ fontSize: 12, color: '#64748b' }}>About: {activeConvo.car?.makeModel}</p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender._id === user.id || msg.sender === user.id ? 'flex-end' : 'flex-start',
                      marginBottom: 10,
                    }}
                  >
                    <div style={{
                      maxWidth: '60%', padding: '10px 14px', borderRadius: 12,
                      background: (msg.sender._id === user.id || msg.sender === user.id) ? '#e11d2e' : '#fff',
                      color: (msg.sender._id === user.id || msg.sender === user.id) ? '#fff' : '#0f172a',
                    }}>
                      <p style={{ fontSize: 13.5 }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, padding: 16, background: '#fff', borderTop: '1px solid #e5e7eb' }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 8 }}
                />
                <button type="submit" className="add-btn">Send</button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
