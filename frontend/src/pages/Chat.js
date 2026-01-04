import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  useEffect(() => {
    if (socket) {
      socket.on('new-message', (data) => {
        if (selectedConversation && data.message.senderId._id === selectedConversation.user._id) {
          setMessages(prev => [...prev, data.message]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new-message');
      }
    };
  }, [socket, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/chat/conversations/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Fetch conversations error:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to view conversations');
      } else {
        toast.error('Failed to load conversations');
      }
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/chat/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Fetch messages error:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to view messages');
      } else {
        toast.error('Failed to load messages');
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/chat`, {
        receiverId: selectedConversation.user._id,
        message: newMessage
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNewMessage('');
      fetchMessages(selectedConversation.user._id);
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
          </div>

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="empty-conversations">
                <MessageSquare size={48} color="#9CA3AF" />
                <p>No conversations yet</p>
                <p className="empty-hint">
                  Start chatting by claiming a listing or viewing listing details!
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.user._id}
                  className={`conversation-item ${selectedConversation?.user._id === conv.user._id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">
                    {conv.user.profileImage ? (
                      <img src={conv.user.profileImage} alt={conv.user.name} />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{conv.user.name}</div>
                    <div className="conversation-preview">
                      {conv.lastMessage?.message?.substring(0, 50)}...
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="unread-badge">{conv.unreadCount}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-main">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {selectedConversation.user.profileImage ? (
                      <img src={selectedConversation.user.profileImage} alt={selectedConversation.user.name} />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div>
                    <h3>{selectedConversation.user.name}</h3>
                    <p>Active now</p>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message ${message.senderId._id === user?._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {message.message}
                    </div>
                    <div className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="chat-input-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit">
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation">
              <MessageSquare size={64} color="#9CA3AF" />
              <h3>No conversation selected</h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
              <div className="chat-help">
                <h4>How to start chatting:</h4>
                <ul>
                  <li>💬 Go to <Link to="/listings" className="chat-link">Listings</Link> page and click on any listing</li>
                  <li>👤 View listing details and interact with donors/receivers</li>
                  <li>📨 Send a message when you claim or create a listing</li>
                  <li>✅ Your conversation will appear here once you send a message</li>
                </ul>
                <Link to="/listings" className="btn btn-primary chat-action-btn">
                  <Package size={20} />
                  Browse Listings
                  <ArrowRight size={20} />
                </Link>
                <p className="chat-tip">
                  <strong>💡 Tip:</strong> Chat is used to coordinate food donations and collections. 
                  Start by claiming a listing or viewing listing details!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
