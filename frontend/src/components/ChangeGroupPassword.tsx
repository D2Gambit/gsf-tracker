import { Lock } from "lucide-react";
import ChangePasswordForm from "./ChangePasswordForm";
import { useState } from "react";

export default function ChangeGroupPassword({ className }) {
  const [isChangePasswordFormOpen, setIsChangePasswordFormOpen] =
    useState(false);
  return (
    <div className={className}>
      <button
        className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        onClick={() => setIsChangePasswordFormOpen(true)}
      >
        <Lock className="h-5 w-5 text-white mr-1" /> Change Group Password
      </button>
      <ChangePasswordForm
        isOpen={isChangePasswordFormOpen}
        onClose={() => setIsChangePasswordFormOpen(false)}
      />
    </div>
  );
}
