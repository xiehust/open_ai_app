import React from "react";
import SignIn from "./pages/login";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ChatPage from "./pages/chatpage";
import {ProvideAuth} from "./commons/use-auth";
import RequireAuth from "./pages/private-route";
import './App.css';
function App() {
  return (
    <ProvideAuth>
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/chat" element={<RequireAuth redirectPath="/" ><ChatPage/></RequireAuth>} />
        {/* <Route path="/chat" element={<ChatPage />}/> */}
      </Routes>
    </Router>
    </ProvideAuth>
  );
}

export default App;
