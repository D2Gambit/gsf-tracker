"use client";

import React from "react";
import NewGSFForm from "../components/NewGSFForm";
import LoginForm from "../components/LoginForm";

export default function Login() {
  const [showNewGSFForm, setShowNewGSFForm] = React.useState(false);

  return (
    <div className="bg-zinc-800 flex flex-col">
      {showNewGSFForm ? (
        <NewGSFForm />
      ) : (
        <LoginForm setShowNewGSFForm={setShowNewGSFForm} />
      )}
    </div>
  );
}
