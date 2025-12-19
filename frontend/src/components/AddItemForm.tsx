import React, { useState } from "react";

type NeedItemForm = {
  itemName: string;
  description: string;
  requestedBy: string;
  priority: string;
};

export default function AddItemForm({
  isModalOpen,
  setIsModalOpen,
  needItems,
  setNeedItems,
  addItem,
}: {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  needItems: any[];
  setNeedItems: React.Dispatch<React.SetStateAction<any[]>>;
  addItem: (id: string) => void;
}) {
  const [form, setForm] = useState<NeedItemForm>({
    itemName: "",
    description: "",
    requestedBy: "",
    priority: "",
  });

  const handleAddItemConfirmClick = async () => {
    try {
      const res = await fetch("/api/add-need-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      setNeedItems([
        ...needItems,
        {
          ...form,
          dateAdded: new Date(Date.now()).toLocaleDateString("en-CA"),
          isActive: true,
        },
      ]);
      setIsModalOpen(false);
      addItem("1");
      console.log("Form Data", form);
      console.log("Backend response:", data);
    } catch (err) {
      console.error("Error calling backend:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-800 w-full max-w-lg rounded-lg p-6">
        <h3 className="text-xl font-bold text-zinc-100 mb-4">Add Need Item</h3>

        {/* Name */}
        <input
          type="text"
          placeholder="Item Name"
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.itemName}
          onChange={(e) => setForm({ ...form, itemName: e.target.value })}
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

        {/* Requested By */}
        <input
          type="text"
          placeholder="Requested by"
          className="w-full mb-4 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.requestedBy}
          onChange={(e) => setForm({ ...form, requestedBy: e.target.value })}
        />

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
            disabled={!form.itemName}
          >
            Request Need
          </button>
        </div>
      </div>
    </div>
  );
}
