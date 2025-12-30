import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { parse } from "zod/v4/core";

type AddHaveItemForm = {
  name: string;
  description: string;
  quality: string;
  location: string;
  image: File | null;
};

export default function HaveItemForm({
  isModalOpen,
  setIsModalOpen,
  haveItems,
  setHaveItems,
  addItem,
  editItem,
}: {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  haveItems: any[];
  setHaveItems: React.Dispatch<React.SetStateAction<any[]>>;
  addItem: (id: string) => void;
  editItem: any;
}) {
  const [form, setForm] = useState<AddHaveItemForm>({
    name: editItem.name,
    description: editItem.description,
    quality: editItem.quality,
    location: editItem.location,
    image: null,
  });

  const { session } = useAuth();

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  const handleAddHaveItemConfirmClick = async () => {
    setIsModalOpen(false); // closes the modal

    const formData = new FormData();
    formData.append("image", form.image!);
    formData.append("gsfGroupId", session?.gsfGroupId?.toString() || "Unknown");
    formData.append("name", form.name);
    formData.append(
      "description",
      form.description ? form.description : "No description provided."
    );
    formData.append("foundBy", parsedUserInfo.accountName);
    formData.append("quality", form.quality ? form.quality : "No Quality");
    formData.append("location", form.location ? form.location : "N/A");

    if (editItem.id !== undefined) {
      formData.append("isReserved", editItem.isReserved.toString());
      formData.append("reservedBy", editItem.reservedBy);
    }

    try {
      const res = await fetch("/api/add-have-item", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      if (editItem.id !== undefined) {
        await fetch(`/api/delete-have-item/${editItem.id}`, {
          method: "DELETE",
        });
      }

      const data = await res.json();
      setHaveItems([
        data,
        ...haveItems.filter((item) => editItem.id !== item.id),
      ]);
      addItem(data.id);
    } catch (err) {
      console.error("Error calling backend:", err);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image")) {
          const file = item.getAsFile();
          if (file) {
            setForm((prev) => ({ ...prev, image: file }));
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isModalOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-800 w-full max-w-lg rounded-lg p-6">
        <h3 className="text-xl font-bold text-zinc-100 mb-4">
          {editItem.name ? "Edit Have Item" : "Add Have Item"}
        </h3>

        {/* Image preview */}
        <div className="mb-4 border border-dashed border-zinc-500 rounded p-4 text-center">
          {form.image ? (
            <img
              src={URL.createObjectURL(form.image)}
              alt="Preview"
              className="mx-auto max-h-48 rounded"
            />
          ) : (
            <p className="text-zinc-400 text-sm">
              Optional: Paste an image from clipboard (Ctrl + V)
            </p>
          )}
        </div>

        {/* Name */}
        <input
          type="text"
          placeholder="* Item Name"
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Description */}
        <textarea
          placeholder="Optional: Description"
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Quality*/}
        <label className="block mb-2 text-sm font-medium text-zinc-100">
          Quality
        </label>
        <select
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.quality}
          onChange={(e) => setForm({ ...form, quality: e.target.value })}
        >
          <option value="">* Select Quality</option>
          <option value="Normal">Normal</option>
          <option value="Magic">Magic</option>
          <option value="Rare">Rare</option>
          <option value="Unique">Unique</option>
          <option value="Set">Set</option>
        </select>

        {/* Location */}
        <input
          type="text"
          placeholder="Optional: Location Found"
          className="w-full mb-4 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
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
            onClick={handleAddHaveItemConfirmClick}
            disabled={!form.name}
          >
            {editItem.name ? "Edit Have Item" : "Add Have Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
