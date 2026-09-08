import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useChat from '../../hooks/useChat';
import '../../styles/seller-style.css';

export default function Chat() {
  const [text, setText] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const {
    conversations,
    activeConvo,
    messages,
    openConversation,
    sendMessage,
    isMyMessage,
  } = useChat(user);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (sendMessage(text)) setText('');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🚗</div>

          <div className="brand-text">
            <h2>
              Car<span>Zone</span>
            </h2>
            <span>Seller Panel</span>
          </div>
        </div>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        <nav className="nav-menu">
          <Link
            to="/seller/dashboard"
            className="nav-item"
          >
            <span>Dashboard</span>
          </Link>

          <Link
            to="/seller/rental-cars"
            className="nav-item"
          >
            <span>Rental Cars</span>
          </Link>

          <Link
            to="/seller/rental-requests"
            className="nav-item"
          >
            <span>Rental Requests</span>
          </Link>

          <Link
            to="/seller/inquiries"
            className="nav-item"
          >
            <span>Inquiries</span>
          </Link>

          <Link
            to="/seller/analytics"
            className="nav-item">
            <span>Analytics</span>
          </Link>

          <Link
            to="/seller/chat"
            className="nav-item active"
          >
            <span>Messages</span>
          </Link>
        </nav>

        <div className="sidebar-section-title">
          SYSTEM
        </div>

        <nav className="nav-menu">
          <Link
            to="/seller/profile"
            className="nav-item"
          >
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link
            to="/"
            className="back-to-site"
          >
            ← Back to CarZone
          </Link>

          <a
            onClick={logout}
            className="back-to-site"
            style={{ cursor: 'pointer' }}
          >
            Logout
          </a>
        </div>
      </aside>

      <main
        className="main-content"
        style={{
          display: 'flex',
          gap: 0,
          padding: 0,
          height: '100vh',
        }}
      >
        {/* Conversations */}
        <div
          style={{
            width: 300,
            borderRight: '1px solid #e5e7eb',
            overflowY: 'auto',
            background: '#fff',
          }}
        >
          <div
            style={{
              padding: 20,
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <h2 style={{ fontSize: 16 }}>
              Messages
            </h2>
          </div>

          {conversations.length === 0 && (
            <p
              style={{
                padding: 20,
                fontSize: 13,
                color: '#64748b',
              }}
            >
              No conversations yet.
            </p>
          )}

          {conversations.map((convo) => {
            const isUnread = (convo.unreadCount || 0) > 0;
            const isActive =
              String(activeConvo?._id) === String(convo._id);

            return (
              <div
                key={convo._id}
                onClick={() => openConversation(convo)}
                style={{
                  padding: 16,
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',

                  background: isActive
                    ? '#fee2e4'
                    : isUnread
                      ? '#fff1f2'
                      : 'transparent',

                  borderLeft: isUnread
                    ? '4px solid #e11d2e'
                    : '4px solid transparent',
                }}
              >
                <strong
                  style={{
                    fontSize: 13.5,
                    fontWeight: isUnread ? 800 : 600,
                  }}
                >
                  {convo.buyer?.name}
                </strong>

                <p
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    margin: '2px 0',
                  }}
                >
                  {convo.car?.makeModel}
                </p>

                <p
                  style={{
                    fontSize: 12,
                    color: isUnread
                      ? '#334155'
                      : '#94a3b8',
                    fontWeight: isUnread ? 700 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {convo.lastMessage || 'No messages yet'}
                </p>

                {isUnread && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 20,
                      height: 20,
                      padding: '0 6px',
                      marginTop: 6,
                      borderRadius: 20,
                      background: '#e11d2e',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {convo.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Chat Window */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#f6f7fb',
          }}
        >
          {!activeConvo ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
              }}
            >
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: 16,
                  background: '#fff',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <strong>
                  {activeConvo.buyer?.name}
                </strong>

                <p
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                  }}
                >
                  About: {activeConvo.car?.makeModel}
                </p>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 20,
                }}
              >
                {messages.map((msg) => {
                  const mine = isMyMessage(msg);

                  return (
                    <div
                      key={msg._id}
                      style={{
                        display: 'flex',
                        justifyContent: mine
                          ? 'flex-end'
                          : 'flex-start',
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '60%',
                          padding: '10px 14px',
                          borderRadius: 12,
                          background: mine
                            ? '#e11d2e'
                            : '#fff',
                          color: mine
                            ? '#fff'
                            : '#0f172a',
                        }}
                      >
                        <p style={{ fontSize: 13.5 }}>
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSend}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: 16,
                  background: '#fff',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <input
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: 10,
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                  }}
                />

                <button
                  type="submit"
                  className="add-btn"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}