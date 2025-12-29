import React from "react";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./src/pages/Home";
import LootShowcase from "./src/pages/LootShowcase";
import SignUp from "./src/pages/SignUp";
import NeedList from "./src/pages/NeedList";
import HaveList from "./src/pages/HaveList";
import NotFound from "./src/pages/NotFound";
import Login from "./src/pages/Login";
import { useAuth } from "./AuthContext";

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <Router>
        <main className="min-h-screen font-inter">
          <Routes>
            <Route path="/" element={<Home />} />
            {isAuthenticated && <Route path="/login" element={<Login />} />}
            {isAuthenticated && <Route path="/signup" element={<SignUp />} />}
            {isAuthenticated && (
              <Route path="/need-list" element={<NeedList />} />
            )}
            {isAuthenticated && (
              <Route path="/have-list" element={<HaveList />} />
            )}
            {isAuthenticated && (
              <Route path="/loot-showcase" element={<LootShowcase />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </main>
      </Router>
    </Theme>
  );
};

export default App;
