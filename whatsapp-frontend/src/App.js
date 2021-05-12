import "./App.css";
import Chat from "./components/Chat";
import Signin from "./components/SignIn";
import Sidebar from "./components/Sidebar";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "./axios";
import Modal from "./components/Modal";
function App() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(null);

  useEffect(() => {
    async function isLoggedIn() {
      try {
        const { data } = await axios.get("/loggedIn");
        setUser(data);
      } catch (err) {
        setUser(null);
      }
    }
    isLoggedIn();
  }, []);

  return (
    <div className="app">
      {!user ? (
        <Signin setUser={setUser} />
      ) : (
        <div className="app_body">
          <Router>
            <Sidebar user={user} setUser={setUser} setIsOpen={setIsOpen} />
            <Modal isOpen={isOpen} setIsOpen={setIsOpen} user={user} />
            <Switch>
              <Route exact path="/">
                <>
                  <div className="app_bodyInfo">
                    <div className="app_bodyLogo">
                      <img
                        src="http://assets.stickpng.com/images/580b57fcd9996e24bc43c543.png"
                        alt="whatsapp logo"
                      />
                    </div>
                    <h2>WhatsApp 2.0 is here</h2>
                    <p>
                      Chat with your loved ones by creating different rooms.
                    </p>
                    <p>
                      Made with <span>❤</span>
                    </p>
                  </div>
                </>
              </Route>
              <Route path="/rooms/:roomId">
                <Chat user={user} />
              </Route>
            </Switch>
          </Router>
        </div>
      )}
    </div>
  );
}

export default App;
