import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SearchOutlined from "@material-ui/icons/Search";
import { IconButton, Avatar } from "@material-ui/core";
import { BiLogOutCircle } from "react-icons/bi";
import SidebarChat from "./SidebarChat";
import axios from "../axios";
import Pusher from "pusher-js";
import { useHistory } from "react-router-dom";

const Sidebar = ({ user, setUser, setIsOpen }) => {
  const [rooms, setRooms] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const getRooms = async () => {
      const { data } = await axios.get(`/rooms/${user.id}`);
      setRooms(data.rooms);
    };
    getRooms();
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe("room-created");
    channel.bind("inserted", () => {
      getRooms();
    });
    const channel1 = pusher.subscribe("user-added-to-room");
    channel1.bind("updated", () => {
      getRooms();
    });
    const channel2 = pusher.subscribe("message");
    channel2.bind("updated", () => {
      getRooms();
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      channel1.unbind_all();
      channel1.unsubscribe();
      channel2.unbind_all();
      channel2.unsubscribe();
    };
  }, [user.id]);

  //Sign out
  const handleSignout = async () => {
    await axios.get("/signout");
    setUser(null);
    history.push("/");
  };

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar__header">
        <div className="sidebar__headerLeft">
          <Avatar src={`http://localhost:9000/image/${user.profileImage}`} />
          <IconButton onClick={handleSignout}>
            <BiLogOutCircle />
          </IconButton>
        </div>
        <div className="sidebar__headerRight">
          <IconButton>
            <DonutLargeIcon />
          </IconButton>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
      </div>

      {/* Sidebar Search */}
      <div className="sidebar__search">
        <div className="sidebar__searchContainer">
          <SearchOutlined />
          <input type="text" placeholder="Search or start new chat" />
        </div>
      </div>

      <div className="sidebar__chats">
        <SidebarChat addNewChat user={user} setIsOpen={setIsOpen} />
        {rooms.map((room) => {
          const { chats } = room.roomId;
          const prevMsg =
            chats.length !== 0
              ? chats[chats.length - 1].message
              : "No previous message";
          return (
            <SidebarChat
              key={room.roomId._id}
              roomName={room.roomName}
              roomId={room.roomId._id}
              roomImage={room.roomId.roomImage}
              prevMsg={prevMsg}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
