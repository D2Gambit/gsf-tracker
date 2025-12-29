import React, { useState } from "react";
import { useAuth } from "../../AuthContext";

type NeedItemForm = {
  name: string;
  description: string;
  priority: string;
};

export default function AddNeedItemForm({
  setIsModalOpen,
  needItems,
  setNeedItems,
  addItem,
  editItem,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  needItems: any[];
  setNeedItems: React.Dispatch<React.SetStateAction<any[]>>;
  addItem: (id: string) => void;
  editItem: any;
}) {
  const [form, setForm] = useState<NeedItemForm>({
    name: editItem.name,
    description: editItem.description,
    priority: editItem.priority,
  });

  const { session } = useAuth();

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  const handleAddItemConfirmClick = async () => {
    setIsModalOpen(false); // closes the modal
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("requestedBy", parsedUserInfo.accountName);
      formData.append("priority", form.priority);
      formData.append("isActive", "true");
      formData.append("gsfGroupId", session?.gsfGroupId ?? "Unknown");

      const res = await fetch("/api/add-need-item", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      if (editItem.id !== undefined) {
        await fetch(`/api/delete-need-item/${editItem.id}`, {
          method: "DELETE",
        });
      }

      const data = await res.json();
      setNeedItems([
        data,
        ...needItems.filter((item) => editItem.id !== item.id),
      ]); // flattens need items from parent and adds response item
      addItem(data.id); // show toast notification
    } catch (err) {
      console.error("Error calling backend:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-800 w-full max-w-lg rounded-lg p-6">
        <h3 className="text-xl font-bold text-zinc-100 mb-4">
          {editItem.name ? "Edit Need Item" : "Add Need Item"}
        </h3>

        {/* Name */}
        <input
          type="text"
          placeholder="Item Name"
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Priority*/}
        <label className="block mb-2 text-sm font-medium text-zinc-100">
          Priority
        </label>
        <select
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option value="">Select Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded bg-zinc-600 text-zinc-100"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={handleAddItemConfirmClick}
            disabled={!form.name}
          >
            {editItem.name ? "Edit Need" : "Request Need"}
          </button>
        </div>
      </div>
    </div>
  );
}
