import { Avatar } from "@material-ui/core";
import React from "react";
import "./SidebarChat.css";
import AddIcon from "@material-ui/icons/Add";
import { Link } from "react-router-dom";

const SidebarChat = ({
  setIsOpen,
  addNewChat,
  roomName,
  roomId,
  roomImage,
  prevMsg,
}) => {
  return !addNewChat ? (
    <Link to={`/rooms/${roomId}`}>
      <div className="sidebarChat">
        <Avatar src={`http://localhost:9000/image/${roomImage}`} />
        <div className="sidebarChat__info">
          <h2>{roomName}</h2>
          <p>{prevMsg}</p>
        </div>
      </div>
    </Link>
  ) : (
    <div onClick={() => setIsOpen(true)} className="sidebarChat createChat">
      <h2>Add new chat</h2>
      <AddIcon />
    </div>
  );
};

export default SidebarChat;
