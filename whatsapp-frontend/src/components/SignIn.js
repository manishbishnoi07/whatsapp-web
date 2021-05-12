import React, { useState } from "react";
import "./Signin.css";
import axios from "../axios";
const Signin = ({ setUser }) => {
  const [signin, setSignin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");
  const [file, setFile] = useState(null);

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/signin", {
        email,
        password,
      });
      if (data === "Failure") {
        return alert("Email or password is wrong");
      }
      setUser(data);
    } catch (err) {
      alert("Server error. Try again later");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== cpassword) {
      return alert("Password doesn't match");
    }
    const bodyFormData = new FormData();
    bodyFormData.append("name", name);
    bodyFormData.append("email", email);
    bodyFormData.append("password", password);

    bodyFormData.append("profileImage", file);
    //Database Logic
    const { data } = await axios.post("/signup", bodyFormData);
    alert(data);
    setName("");
    setEmail("");
    setPassword("");
    setCpassword("");
  };

  const switchToOther = () => {
    setName("");
    setEmail("");
    setPassword("");
    setCpassword("");
    setSignin(!signin);
  };

  return (
    <div className="signin">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT54FDQMVG4G3EkEuq_Dl702T-vpq2eelEAdDd1UXaBJUXTOrvr3pUwZ6dsj4e7xIDMHXE&usqp=CAU"
        alt="whatsapp logo"
      />
      {signin ? (
        <form onSubmit={handleSignin}>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input type="submit" value="Sign In" />
        </form>
      ) : (
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            title="Must contain at least one number, one uppercase and lowercase letter, and at least 8 or more characters"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={cpassword}
            onChange={(e) => setCpassword(e.target.value)}
            required
          />
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            accept="image/*"
            required
          />
          <input type="submit" value="Sign Up" />
        </form>
      )}
      {signin ? (
        <p>
          Don't have an account?
          <span onClick={switchToOther}>Sign Up</span>
        </p>
      ) : (
        <p>
          Already have an account?
          <span onClick={switchToOther}>Sign In</span>
        </p>
      )}
    </div>
  );
};

export default Signin;
