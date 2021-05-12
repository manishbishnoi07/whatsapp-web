import React, { useState } from "react";
import "./Modal.css";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import axios from "../axios";

const Modal = ({ user, isOpen, setIsOpen, text, title }) => {
  const [roomName, setRoomName] = useState("");
  const [roomImage, setRoomImage] = useState(null);
  const closeModel = () => {
    setIsOpen(false);
    setRoomName("");
    setRoomImage("");
  };

  const createNewChat = async (e) => {
    e.preventDefault();
    try {
      if (!roomName || !roomImage) return;

      const bodyFormData = new FormData();
      bodyFormData.append("name", roomName);
      bodyFormData.append("roomImage", roomImage);
      bodyFormData.append("createdBy", user.id);
      //Database Logic
      await axios.post("/rooms/new", bodyFormData);
      setIsOpen(false);
      setRoomName("");
      setRoomImage("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={`modal ${isOpen === true ? "open" : ""}`}>
      <div className="modal__content">
        <form onSubmit={createNewChat}>
          <IconButton onClick={closeModel} className="close">
            <CloseIcon />
          </IconButton>
          <h3>Room Details</h3>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Please enter name for chat"
            required
          />
          <div
            style={{
              display: "flex",
            }}
          >
            <label
              htmlFor="roomImage"
              style={{
                marginRight: "10px",
              }}
            >
              Image:
            </label>
            <input
              className="uploadInput"
              onChange={(e) => setRoomImage(e.target.files[0])}
              type="file"
              id="roomImage"
              accept="image/*"
              required
            />
          </div>
          <button className="create__btn">Create Room</button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
