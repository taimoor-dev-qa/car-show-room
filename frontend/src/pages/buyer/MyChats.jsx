import DeleteConversationButton from '../../components/DeleteConversationButton';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useChat, { chatId } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import '../../styles/01-base-header.css';
import '../../styles/08-chat.css';

export default function MyChats() {
  const [text, setText] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedConversationId = new URLSearchParams(location.search).get('conversation')
    || location.state?.conversationId;
  const openedNavigation = useRef(null);
  const messagesEndRef = useRef(null);
  const { conversations, activeConvo, messages, openConversation, sendMessage, isMyMessage, deleteConversation } = useChat(user);

  useEffect(() => {
    if (!requestedConversationId || openedNavigation.current === location.key) return;
    const conversation = conversations.find((item) => chatId(item) === chatId(requestedConversationId));
    if (!conversation) return;

    // Consume this navigation before opening: read/live updates must not reopen it.
    openedNavigation.current = location.key;
    void openConversation(conversation);
  }, [requestedConversationId, location.key, conversations, openConversation]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (sendMessage(text)) setText('');
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
            className={`chat-convo-item chat-delete-item ${activeConvo?._id === convo._id ? 'active' : ''
              } ${convo.unreadCount > 0 ? 'unread' : ''}`}
          >
            <DeleteConversationButton conversation={convo} onDelete={deleteConversation} />
            <div className="chat-convo-avatar">{sellerLabel(convo).charAt(0).toUpperCase()}</div>
            <div className="chat-convo-info">
              <div className="chat-convo-name">{sellerLabel(convo)}</div>
              <div className="chat-convo-car">{convo.car?.makeModel}</div>
              <div className="chat-convo-preview">{convo.lastMessage || 'No messages yet'}</div>
              {convo.unreadCount > 0 && (
                <span className="chat-unread-badge">
                  {convo.unreadCount}
                </span>
              )}
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
                const isMine = isMyMessage(msg);
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
