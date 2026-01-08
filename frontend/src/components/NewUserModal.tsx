import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";

type ExistingPlayerForm = {
  accountName: string;
};

export default function NewUserModal({
  setIsModalOpen,
  existingPlayers,
  gsfGroupId,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  existingPlayers: any[];
  gsfGroupId: string;
}) {
  const [form, setForm] = useState<ExistingPlayerForm>({
    accountName: "",
  });

  const { session, logout, selectUser } = useAuth();

  const handleExistingPlayerConfirmClick = async () => {
    setIsModalOpen(false); // closes the modal
    try {
      const res = await fetch(
        `/api/member/${session?.gsfGroupId}/${form.accountName}`
      );

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const resData = await res.json();

      selectUser({
        gsfGroupId: resData[0].gsfGroupId,
        role: resData[0].role,
        accountName: resData[0].accountName,
        userInfo: resData[0],
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error calling backend:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-800 w-full max-w-lg rounded-lg p-6">
        <h3 className="text-xl font-bold text-zinc-100 mb-4">
          {`Welcome to ${gsfGroupId}!`}
        </h3>
        <p className="block mb-2 text-sm font-medium text-zinc-100">
          If you're new here, please register to join our GSF!
        </p>
        <Link to="/signup" className="inline-flex items-center">
          <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            <UserPlus className="h-5 w-5" />
            <span>Sign up</span>
          </button>
        </Link>

        <p className="block mb-2 text-sm font-medium text-zinc-100">
          <br />
          If you're already registered to{" "}
          <span className="font-bold underline">{gsfGroupId}</span>, but
          returning from another device, please select your account name below:
        </p>
        {/* Account Name */}
        <select
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.accountName}
          onChange={(e) => setForm({ ...form, accountName: e.target.value })}
        >
          <option value="">Select Account</option>
          {existingPlayers.map((player) => (
            <option key={player.accountName} value={player.accountName}>
              {player.accountName}
            </option>
          ))}
        </select>

        {/* Actions */}
        <div className="flex justify-between space-x-3">
          <button
            className="px-4 py-2 rounded bg-zinc-600 text-zinc-100 hover:bg-zinc-700"
            onClick={logout}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={handleExistingPlayerConfirmClick}
            disabled={!form.accountName}
          >
            Link Account to New Device
          </button>
        </div>
      </div>
    </div>
  );
}
