import React, { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { Loader } from "lucide-react";
import type { LootUploadItem } from "../../types/loot";

type UploadForm = {
  name: string;
  description: string;
  image: File | null;
  quality: string;
};

export default function UploadLootForm({
  isModalOpen,
  setIsModalOpen,
  saveFind,
}: {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  saveFind: (find: LootUploadItem) => Promise<void>;
}) {
  const [form, setForm] = useState<UploadForm>({
    name: "",
    description: "",
    image: null,
    quality: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { session } = useAuth();

  const handleUploadConfirmClick = async () => {
    setIsSubmitting(true);
    saveFind({
      name: form.name,
      image: form.image!,
      description: form.description,
      gsfGroupId: session?.gsfGroupId ?? "Unknown",
      quality: form.quality,
    });
    setIsSubmitting(false);
    setIsModalOpen(false);
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
  }, [isModalOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-800 w-full max-w-lg rounded-lg p-6">
        <h3 className="text-xl font-bold text-zinc-100 mb-4">
          Upload New Find
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
              Paste the item text (Ctrl + C when hovering item ingame) or image
              from clipboard (Ctrl + V)
            </p>
          )}
        </div>

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

        <label className="block mb-2 text-sm font-medium text-zinc-100">
          Quality
        </label>
        <select
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.quality}
          onChange={(e) => setForm({ ...form, quality: e.target.value })}
        >
          <option value="">Optional: Select Quality</option>
          <option value="Normal">Normal</option>
          <option value="Magic">Magic</option>
          <option value="Rare">Rare</option>
          <option value="Unique">Unique</option>
          <option value="Set">Set</option>
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
            onClick={handleUploadConfirmClick}
            disabled={!form.name && isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex justify-center">
                <Loader className="animate-spin mr-2" /> Uploading...
              </div>
            ) : (
              "Confirm Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
