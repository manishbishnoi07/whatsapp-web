import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import messageRoute from "./routes/message.js";
import authRoute from "./routes/auth.js";
import roomRoute from "./routes/room.js";
import cors from "cors";
import Pusher from "pusher";
import cookieParser from "cookie-parser";

//app config
const app = express();
dotenv.config();
const port = process.env.PORT || 9000;

//middlewares
app.use(express.json());
app.use(
  cors({ origin: ["https://whatsapp-web-app.netlify.app/"], credentials: true })
);
app.use(cookieParser());

//Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

//DB Config
mongoose.connect(process.env.DB_CONNECT, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.once("open", () => {
  const usersChangeStream = db.collection("users").watch();
  const roomsChangeStream = db.collection("rooms").watch();
  usersChangeStream.on("change", (change) => {
    if (change.operationType === "update") {
      pusher.trigger("user-added-to-room", "updated", {
        message: `Updated User with id ${change.documentKey}`,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
  roomsChangeStream.on("change", (change) => {
    if (change.operationType === "update") {
      pusher.trigger("message", "updated", {
        message: `Updated Room with id ${change.documentKey}`,
      });
    } else if (change.operationType === "insert") {
      const { _id, name, createdBy, chats } = change.fullDocument;
      pusher.trigger("room-created", "inserted", {
        _id,
        name,
        createdBy,
        chats,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
});

//Api routes
app.get("/", (req, res) => {
  res.send("This is the backend server of whatsapp-web");
});
app.use(messageRoute);
app.use(authRoute);
app.use(roomRoute);

//Listen
app.listen(port, () => {
  console.log(`Listening on port no ${port}`);
});
