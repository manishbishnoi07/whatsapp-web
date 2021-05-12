import express from "express";
import Room from "../models/roomSchema.js";
const router = express.Router();

router.get("/messages/:roomId", (req, res) => {
  const { roomId } = req.params;
  if (!roomId) return res.send();
  Room.findOne({ _id: roomId })
    .populate("chats.sender", "name")
    .populate("createdBy", "name")
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.post("/messages/:roomId", (req, res) => {
  const { roomId } = req.params;
  Room.updateOne(
    { _id: roomId },
    {
      $push: {
        chats: req.body,
      },
    }
  )
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

export default router;
