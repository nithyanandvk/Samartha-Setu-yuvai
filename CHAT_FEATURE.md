# Chat Feature Documentation

## Overview
The chat feature in Samartha Setu enables real-time communication between donors and receivers, facilitating coordination for food donations and collections.

## How It Works

### Architecture
1. **Backend (Node.js + Express + Socket.IO)**
   - RESTful API endpoints for message CRUD operations
   - Socket.IO for real-time message delivery
   - MongoDB for persistent message storage

2. **Frontend (React)**
   - React components for chat UI
   - Socket.IO client for real-time updates
   - Axios for API calls

### Components

#### 1. Message Model (`backend/models/Message.js`)
- Stores messages with sender, receiver, listing reference
- Tracks read status and message type
- Indexed for efficient queries

#### 2. Chat Routes (`backend/routes/chat.js`)
- `POST /api/chat` - Send a message
- `GET /api/chat/:userId` - Get conversation with a user
- `GET /api/chat/conversations/list` - Get all user's conversations

#### 3. Chat Page (`frontend/src/pages/Chat.js`)
- Displays list of conversations
- Shows messages in selected conversation
- Real-time message updates via Socket.IO
- Auto-scroll to latest message

### Flow

1. **Fetching Conversations**
   - User opens chat page
   - Frontend calls `GET /api/chat/conversations/list`
   - Backend aggregates messages to find unique conversations
   - Returns list with last message and unread count

2. **Viewing Messages**
   - User selects a conversation
   - Frontend calls `GET /api/chat/:userId`
   - Backend returns all messages between current user and selected user
   - Messages marked as read

3. **Sending Messages**
   - User types message and sends
   - Frontend calls `POST /api/chat` with receiverId and message
   - Backend:
     - Saves message to database
     - Creates notification for receiver
     - Emits Socket.IO event to receiver
   - Frontend refreshes messages

4. **Real-Time Updates**
   - Socket.IO connection established on login
   - User joins room with their userId
   - When message sent, server emits to receiver's room
   - Receiver's frontend receives event and updates UI

### Socket.IO Integration
- Connection established via `SocketContext`
- User joins room: `socket.emit('join-room', userId)`
- Server emits to room: `io.to(userId).emit('new-message', data)`
- Client listens: `socket.on('new-message', callback)`

### Features
- ✅ Real-time message delivery
- ✅ Conversation list with unread counts
- ✅ Message read status tracking
- ✅ Notification integration
- ✅ Listing context (can link messages to food listings)
- ✅ Responsive design

### Security
- All routes protected with `auth` middleware
- Users can only see their own conversations
- JWT token required for all requests

### Error Handling
- Network errors show toast notifications
- 401 errors redirect to login
- Failed sends show error messages

## Usage Example

```javascript
// Send a message
await axios.post('/api/chat', {
  receiverId: 'user123',
  message: 'Hello!',
  listingId: 'listing456' // optional
});

// Get conversations
const conversations = await axios.get('/api/chat/conversations/list');

// Get messages with a user
const messages = await axios.get('/api/chat/user123');
```

## Future Enhancements
- File/image sharing
- Voice messages
- Group chats for organizations
- Message search
- Typing indicators
- Message reactions

