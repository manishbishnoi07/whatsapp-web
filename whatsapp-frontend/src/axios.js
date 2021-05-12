import axios from "axios";

const instance = axios.create({
  baseURL: "https://whatsapp-web.herokuapp.com",
  withCredentials: true,
  credentials: "include",
});
export default instance;
