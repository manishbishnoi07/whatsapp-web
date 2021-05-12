import express from "express";
import mongoose from "mongoose";
import User from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

//Logged In
router.get("/loggedIn", async (req, res) => {
  const token = req.cookies.authToken;
  if (!token) return res.json(null);
  try {
    const verified = await jwt.verify(token, process.env.TOKEN_SECRET);
    res.send(verified);
  } catch (err) {
    res.json(null);
  }
});

//Sign out
router.get("/signout", (req, res) => {
  res
    .cookie("authToken", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .send(null);
});

//Sign In
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  //Checking if email exists or not
  if (!user) {
    return res.send("Failure");
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        {
          name: user.name,
          email: user.email,
          id: user._id,
          profileImage: user.profileImage,
        },
        process.env.TOKEN_SECRET
      );
      return res
        .cookie("authToken", token, {
          httpOnly: false,
        })
        .send({
          name: user.name,
          email: user.email,
          id: user._id,
          profileImage: user.profileImage,
        });
    }
    res.send("Failure");
  } catch (err) {
    res.status(500).send("Server error. Try again later");
  }
});

//Sign UP
router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { name, email, password } = req.body;
  //Check if email already exists or not
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    return res.send("Email already exists");
  }
  try {
    //Hash Passwords
    const hashedPassword = await bcrypt.hash(password, 10);
    //Create new User
    await new User({
      name,
      email,
      password: hashedPassword,
      rooms: [],
      profileImage: req.file.filename,
    }).save();
    res.status(201).send("Signup successful");
  } catch (err) {
    res.send("Server error. Try again later");
  }
});

router.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
});

export default router;
