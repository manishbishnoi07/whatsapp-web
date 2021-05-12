import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  roomImage: String,
  chats: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      message: String,
      time: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.model("Room", roomSchema);
