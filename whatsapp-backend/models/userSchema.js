import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  rooms: [
    {
      roomName: String,
      roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    },
  ],
  profileImage: String,
});

export default mongoose.model("User", userSchema);
