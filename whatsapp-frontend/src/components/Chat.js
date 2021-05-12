import React, { useState, useEffect, useRef } from "react";
import { Avatar, IconButton } from "@material-ui/core";
import { AttachFile, MoreVert, SearchOutlined } from "@material-ui/icons";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import axios from "../axios";
import "./Chat.css";
import { useParams } from "react-router";
import Pusher from "pusher-js";

const Chat = ({ user }) => {
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomImage, setRoomImage] = useState("");
  const [messages, setMessages] = useState([]);
  const [admin, setAdmin] = useState({});
  const { roomId } = useParams();
  const chatHistory = useRef(null);

  useEffect(() => {
    chatHistory.current.scrollTop = chatHistory.current.scrollHeight;
  });

  useEffect(() => {
    const getMessages = async () => {
      const { data } = await axios.get(`/messages/${roomId}`);
      setRoomName(data.name);
      setRoomImage(data.roomImage);
      setAdmin(data.createdBy);
      setMessages(data.chats);
    };
    getMessages();
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe("message");
    channel.bind("updated", () => {
      getMessages();
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [roomId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    await axios.post(`/messages/${roomId}`, {
      message: input,
      sender: user.id,
    });
    setInput("");
  };

  const addMember = () => {
    const personEmail = prompt("Enter the email of the person");
    if (personEmail) {
      axios
        .post("/add-member", {
          email: personEmail,
          roomName,
          roomId,
        })
        .then(({ data }) => {
          alert(data);
        })
        .catch((err) => {
          alert(err);
        });
    }
  };

  return (
    <div className="chat">
      {/* Chat Header */}
      <div className="chat__header">
        <Avatar src={`https://whatsapp-web.herokuapp.com/image/${roomImage}`} />
        <div className="chat__headerInfo">
          <h4>{roomName}</h4>
          <p>
            last seen{" "}
            {messages.length === 0
              ? ""
              : new Date(messages[messages.length - 1]?.time)?.toLocaleString(
                  undefined,
                  {
                    timeZone: "Asia/Kolkata",
                  }
                )}
          </p>
        </div>
        <div className="chat__headerRight">
          <IconButton>
            <SearchOutlined />
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
      </div>
      <div className="chat__addMembers">
        {user.id === admin._id ? (
          <>
            <p>
              You are the admin of this Room. Only you can add members to this
              room.
            </p>
            <button onClick={addMember}>Add Member</button>
          </>
        ) : (
          <p>
            {admin.name} is the admin of this Room. To add members to this room,
            contact Admin.
          </p>
        )}
      </div>

      {/* Chat Body */}
      <div ref={chatHistory} className="chat__body">
        {messages.map((message) => (
          <p
            className={`chat__message ${
              user.id === message.sender._id && "chat__reciever"
            }`}
            key={message._id}
          >
            <span className="chat__name">{message.sender.name}</span>
            {message.message}
            <span className="chat__timestamp">
              {new Date(message.time).toLocaleString(undefined, {
                timeZone: "Asia/Kolkata",
              })}
            </span>
          </p>
        ))}
      </div>

      <div className="chat__footer">
        <IconButton>
          <InsertEmoticonIcon />
        </IconButton>
        <IconButton>
          <AttachFile />
        </IconButton>
        <form>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            type="text"
          />
          <button onClick={sendMessage} type="submit">
            Send a message
          </button>
        </form>
        <IconButton>
          <MicIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default Chat;
