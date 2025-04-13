const mongoose = require("mongoose");

const ChatSessionSchema = new mongoose.Schema({
  sender_id: String,
  chat_id: String,
  name: {
    type: String,
    default: "New Session"
  },
  messages: [
    {
      text: String,
      isUser: Boolean,
    },
  ],
});

module.exports = mongoose.model("ChatSession", ChatSessionSchema);
