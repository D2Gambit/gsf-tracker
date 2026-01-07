import React, { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import type { AddHaveItemRequest } from "../../types/list";

type AddHaveItemForm = {
  name: string;
  description: string;
  quality: string;
  location: string;
  image: File | null;
};

export default function HaveItemForm({
  isAddItemModalOpen,
  setIsAddItemModalOpen,
  editItem,
  addHaveItem,
}: {
  isAddItemModalOpen: boolean;
  setIsAddItemModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editItem: any;
  addHaveItem: (item: AddHaveItemRequest, editItemId: string) => Promise<void>;
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
    setIsAddItemModalOpen(false); // closes the modal

    const req: AddHaveItemRequest = {
      image: form.image!,
      gsfGroupId: session?.gsfGroupId?.toString() || "Unknown",
      name: form.name,
      description: form.description,
      foundBy: parsedUserInfo.accountName,
      quality: form.quality ? form.quality : "No Quality",
      location: form.location ? form.location : "N/A",
      isReserved: editItem.id ? editItem.isReserved.toString() : "false",
      reservedBy: editItem.id ? editItem.reservedBy : "",
    };

    addHaveItem(req, editItem.id);
  };

  useEffect(() => {
    if (!isAddItemModalOpen) return;

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
        if (item.type.startsWith("text")) {
          item.getAsString((text) => {
            try {
              const parsedItem = JSON.parse(text);

              setForm((prev) => {
                const qty = Number(parsedItem.quantity);
                const isMaterial =
                  !parsedItem.name &&
                  !Number.isNaN(qty) &&
                  qty >= 1 &&
                  qty <= 50;

                let nameVal = "";
                let qualityVal = parsedItem.quality ?? prev?.quality ?? "";

                if (isMaterial) {
                  // material: use type as name and tag as Materials
                  nameVal = String(parsedItem.type ?? "");
                  qualityVal = "Materials";
                } else {
                  if (parsedItem.name) {
                    nameVal =
                      parsedItem.name +
                      (parsedItem.type ? " - " + parsedItem.type : "");
                  } else if (parsedItem.type) {
                    nameVal = parsedItem.type;
                  } else {
                    nameVal = prev.name ?? "";
                  }
                  qualityVal = parsedItem.quality ?? prev.quality ?? "";
                }

                return {
                  ...prev,
                  name: nameVal,
                  quality: qualityVal,
                  description: text,
                };
              });
            } catch {
              setForm((prev) => ({
                ...prev,
                description: text,
              }));
            }
          });
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isAddItemModalOpen]);

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
              Optional: Paste the item text (Ctrl + C when hovering item ingame)
              or image from clipboard (Ctrl + V)
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
          <option value="Charms">Charms</option>
          <option value="Materials">Materials</option>
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
            onClick={() => setIsAddItemModalOpen(false)}
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
