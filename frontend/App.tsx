import React from "react";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./src/pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import LootShowcase from "./src/pages/LootShowcase";
import SignUp from "./src/pages/SignUp";
import NeedList from "./src/pages/NeedList";
import HaveList from "./src/pages/HaveList";
import NotFound from "./src/pages/NotFound";
import Login from "./src/pages/Login";

const App: React.FC = () => {
  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <Router>
        <main className="min-h-screen font-inter">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <ProtectedRoute>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <ProtectedRoute>
                  <SignUp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/need-list"
              element={
                <ProtectedRoute>
                  <NeedList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/have-list"
              element={
                <ProtectedRoute>
                  <HaveList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loot-showcase"
              element={
                <ProtectedRoute>
                  <LootShowcase />
                </ProtectedRoute>
              }
            />
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
