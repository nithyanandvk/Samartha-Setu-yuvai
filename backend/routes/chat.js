const express = require('express');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/chat
// @desc    Send a message
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, listingId, message } = req.body;

    const newMessage = new Message({
      senderId: req.user._id,
      receiverId,
      listingId: listingId || null,
      message,
      messageType: 'text'
    });

    await newMessage.save();

    // Create notification
    await Notification.create({
      userId: receiverId,
      type: 'message',
      title: 'New Message',
      message: `${req.user.name}: ${message.substring(0, 50)}...`,
      relatedId: listingId || null,
      priority: 'medium'
    });

    // Emit real-time event
    const io = req.app.get('io');
    io.to(receiverId.toString()).emit('new-message', {
      message: await Message.findById(newMessage._id)
        .populate('senderId', 'name email profileImage')
        .populate('receiverId', 'name email profileImage')
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/conversations/list
// @desc    Get all conversations
// @access  Private
router.get('/conversations/list', auth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', req.user._id] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$senderId', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Populate user details
    const User = require('../models/User');
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = await User.findById(conv._id).select('name email profileImage');
        return {
          user: otherUser,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json(populatedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/:userId
// @desc    Get conversation with a user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user._id }
      ]
    })
    .populate('senderId', 'name email profileImage')
    .populate('receiverId', 'name email profileImage')
    .populate('listingId', 'title')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: req.params.userId,
        receiverId: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

