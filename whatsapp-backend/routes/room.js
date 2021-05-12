import express from "express";
import mongoose from "mongoose";
import Room from "../models/roomSchema.js";
import User from "../models/userSchema.js";
import multer from "multer";
import GridFsStorage from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("imageUpload");
});

const storage = new GridFsStorage({
  url: process.env.DB_CONNECT,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename:
        new Date().toISOString() +
        Math.floor(Math.random() * 1000) +
        file.originalname,
      bucketName: "imageUpload",
    };
  },
});
const upload = multer({ storage });

router.get("/rooms/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userData = await User.find({ _id: userId }).populate(
      "rooms.roomId",
      "roomImage chats"
    );
    res.status(200).send(userData[0]);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/rooms/new", upload.single("roomImage"), async (req, res) => {
  const { name, createdBy } = req.body;
  const room = new Room({
    name,
    roomImage: req.file.filename,
    createdBy,
    chats: [],
  });
  try {
    const data = await room.save();
    const response = await User.updateOne(
      { _id: createdBy },
      {
        $push: {
          rooms: {
            roomName: name,
            roomId: data._id,
            roomImage: req.file.filename,
          },
        },
      }
    );
    res.status(201).send(response);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/add-member", async (req, res) => {
  const { roomName, email, roomId } = req.body;
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.send("No person exist's with this email");
    }
    const response = await User.updateOne(
      { email: req.body.email },
      {
        $push: {
          rooms: { roomName, roomId },
        },
      }
    );
    res.status(201).send("Member Added Successfully");
  } catch (err) {
    res.send("Server Error. Please try again later.");
  }
});

export default router;
