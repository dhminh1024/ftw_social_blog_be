const socket_io = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const GlobalMessage = require("../models/GlobalMessage");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const io = socket_io();
const socketApi = {};
let onlineUsers = {};
const socketTypes = {
  NOTIFICATION: "NOTIFICATION",
  GLOBAL_MSG_INIT: "GLOBAL_MESSAGE_INIT",
  GLOBAL_MSG_SEND: "GLOBAL_MSG_SEND",
  GLOBAL_MSG_RECEIVE: "GLOBAL_MSG_RECEIVE",
  PRIVATE_MSG_INIT: "PRIVATE_MSG_INIT",
  PRIVATE_MSG_SEND: "PRIVATE_MSG_SEND",
  PRIVATE_MSG_RECEIVE: "PRIVATE_MSG_RECEIVE",
  ERROR: "ERROR",
};

socketApi.io = io;

io.use((socket, next) => {
  try {
    const accessToken = socket.handshake.query.accessToken;
    jwt.verify(accessToken, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return next(new Error("Token expired"));
        } else {
          return next(new Error("Token is invalid"));
        }
      }
      socket.userId = payload._id;
    });
    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", async function (socket) {
  onlineUsers[socket.userId] = socket.id;
  console.log("Connected", socket.userId);

  socket.on(socketTypes.GLOBAL_MSG_INIT, async () => {
    try {
      let globalMessages = await (
        await GlobalMessage.find({}, "-updatedAt")
          .sort({ _id: -1 })
          .limit(100)
          .populate("user", "name avatarUrl")
      ).reverse();
      io.emit(socketTypes.NOTIFICATION, {
        onlineUsers: Object.keys(onlineUsers),
        globalMessages,
      });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(socketTypes.GLOBAL_MSG_SEND, async (msg) => {
    try {
      if (msg.body) {
        const user = await User.findById(msg.from, "name avatarUrl");
        if (user && user._id.equals(socket.userId)) {
          const globalMessage = await GlobalMessage.create({
            user,
            body: msg.body,
          });
          io.emit(socketTypes.GLOBAL_MSG_RECEIVE, globalMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(socketTypes.PRIVATE_MSG_INIT, async (msg) => {
    try {
      const user = await User.findById(msg.from, "name avatarUrl");
      const toUser = await User.findById(msg.to, "name avatarUrl");
      let conversation;
      if (!msg.conversation) {
        conversation = await Conversation.findOneAndUpdate(
          {
            // users: {
            //   $all: [
            //     { $elemMatch: { $eq: user._id } },
            //     { $elemMatch: { $eq: toUser._id } },
            //   ],
            //   $size: 2,
            // },
            $or: [
              { users: [user._id, toUser._id] },
              { users: [toUser._id, user._id] },
            ],
          },
          { $setOnInsert: { users: [user._id, toUser._id] } },
          {
            fields: { users: 0 },
            upsert: true,
            new: true,
          }
        );
      } else {
        conversation = await Conversation.findById(msg.conversation);
      }

      if (conversation) {
        // Get old messages
        let privateMessages = await (
          await Message.find({ conversation: conversation._id }, "-updatedAt")
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("user", "name avatarUrl")
        ).reverse();

        let selectedConversation = conversation.toJSON();
        selectedConversation.to = toUser;

        io.to(onlineUsers[msg.from]).emit(socketTypes.NOTIFICATION, {
          selectedConversation,
          privateMessages,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(socketTypes.PRIVATE_MSG_SEND, async (msg) => {
    try {
      const user = await User.findById(msg.from, "name avatarUrl");
      const toUser = await User.findById(msg.to, "name avatarUrl");
      if (user && user._id.equals(socket.userId)) {
        if (msg.body) {
          let newMessage = await Message.create({
            conversation: msg.conversation,
            user: user._id,
            to: toUser._id,
            body: msg.body,
          });
          await Conversation.findOneAndUpdate(
            { _id: msg.conversation },
            { lastMessage: msg.body, lastMessageUpdatedAt: Date.now() }
          );
          newMessage = newMessage.toJSON();
          newMessage.user = user;
          io.to(onlineUsers[msg.from]).emit(
            socketTypes.PRIVATE_MSG_RECEIVE,
            newMessage
          );
          if (msg.from !== msg.to) {
            io.to(onlineUsers[msg.to]).emit(
              socketTypes.PRIVATE_MSG_RECEIVE,
              newMessage
            );
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("error", (error) => {
    console.log(error);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected", socket.userId);
    delete onlineUsers[socket.userId];
    io.emit(socketTypes.NOTIFICATION, {
      onlineUsers: Object.keys(onlineUsers),
    });
    // console.log("Number of online users", Object.keys(onlineUsers).length);
  });
});

module.exports = socketApi;
