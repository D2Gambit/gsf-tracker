import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { parseItemText } from "../utils/itemParser";

export type ItemFormData = {
  name: string;
  description: string;
  quality: string;
  image: File | null;
  location: string;
  isMap: boolean;
  addToBoth: boolean;
};

interface ItemEntryModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  // 'loot' = Loot Showcase, 'have' = Have List
  mode: "loot" | "have";
  initialValues?: Partial<ItemFormData>;
  title?: string;
}

export default function ItemEntryModal({
  isModalOpen,
  onClose,
  onSubmit,
  mode,
  initialValues = {},
  title,
}: ItemEntryModalProps) {
  const [form, setForm] = useState<ItemFormData>({
    name: "",
    description: "",
    quality: "",
    image: null,
    location: "",
    isMap: false,
    addToBoth: false,
    ...initialValues, // Override defaults with initial values (for editing)
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if we are editing a Have List item.
  // We check for an ID (standard) or if 'name' is populated
  const isEdit =
    mode === "have" && (!!(initialValues as any)?.id || !!initialValues?.name);

  // Reset form when modal opens/closes or initialValues change
  useEffect(() => {
    if (isModalOpen) {
      setForm({
        name: "",
        description: "",
        quality: "",
        image: null,
        location: "",
        isMap: false,
        addToBoth: false,
        ...initialValues,
      });
    }
  }, [isModalOpen, initialValues]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        // Handle image paste
        if (item.type.startsWith("image")) {
          const file = item.getAsFile();
          if (file) {
            setForm((prev) => ({ ...prev, image: file }));
          }
        }

        // Handle text/JSON paste
        if (item.type.startsWith("text")) {
          item.getAsString((text) => {
            setForm((prev) => {
              const updates = parseItemText(text, prev.quality, prev.name);
              return {
                ...prev,
                ...updates,
              };
            });
          });
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isModalOpen]);

  // Determine Default Title
  const displayTitle =
    title ?? (mode === "loot" ? "Upload New Find" : "Add Have Item");

  // Determine the label for the switch based on current mode
  const switchLabel =
    mode === "loot" ? 'Also add to "Have List"' : 'Also add to "Loot Showcase"';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-800 w-full max-w-lg rounded-lg p-6">
        <h3 className="text-xl font-bold text-zinc-100 mb-4">{displayTitle}</h3>

        {/* Image Preview */}
        <div className="mb-4 border border-dashed border-zinc-500 rounded p-4 text-center">
          {form.image ? (
            <img
              src={URL.createObjectURL(form.image)}
              alt="Preview"
              className="mx-auto max-h-48 rounded"
            />
          ) : (
            <p className="text-zinc-400 text-sm">
              {mode === "loot" ? "Paste" : "Optional: Paste"} the item text
              (Ctrl + C hovering item) or image (Ctrl + V)
            </p>
          )}
        </div>

        {/* Name */}
        <input
          type="text"
          placeholder={mode === "have" ? "* Item Name" : "Item Name"}
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Description */}
        <textarea
          placeholder={
            mode === "have" ? "Optional: Description" : "Description"
          }
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Map Warning */}
        {form.isMap && (
          <p className="block mb-2 text-xs font-medium text-zinc-100">
            <span className="text-red-500">Note:</span> Maps do not render
            correctly. If you want to showcase a map, consider uploading it as
            an image.
          </p>
        )}

        {/* Quality */}
        <label className="block mb-2 text-sm font-medium text-zinc-100">
          Quality
        </label>
        <select
          className="w-full mb-3 p-2 rounded bg-zinc-700 text-zinc-100"
          value={form.quality}
          onChange={(e) => setForm({ ...form, quality: e.target.value })}
        >
          <option value="">
            {mode === "have" ? "* Select Quality" : "Optional: Select Quality"}
          </option>
          <option value="Normal">Normal</option>
          <option value="Magic">Magic</option>
          <option value="Rare">Rare</option>
          <option value="Unique">Unique</option>
          <option value="Set">Set</option>
          <option value="Charms">Charms</option>
          <option value="Materials">Materials</option>
        </select>

        {/* Inventory Mode Specific: Location */}
        {mode === "have" && (
          <input
            type="text"
            placeholder="Optional: Location Found"
            className="w-full mb-4 p-2 rounded bg-zinc-700 text-zinc-100"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        )}

        {/* Cross-Post Toggle Switch */}
        {!isEdit && (
          <div className="flex items-center mb-6 pt-2 border-t border-zinc-700">
            <button
              type="button"
              role="switch"
              aria-checked={form.addToBoth}
              onClick={() => setForm({ ...form, addToBoth: !form.addToBoth })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-800 ${
                form.addToBoth ? "bg-red-600" : "bg-zinc-600"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  form.addToBoth ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="ml-3 text-sm font-medium text-zinc-300">
              {switchLabel}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded bg-zinc-600 text-zinc-100 hover:bg-zinc-500"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!form.name || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center">
                <Loader className="animate-spin mr-2 h-4 w-4" />{" "}
                {mode === "loot" ? "Uploading..." : "Saving..."}
              </div>
            ) : // Logic for button text based on mode and if existing ID is present (passed via initialValues)
            mode === "loot" ? (
              "Confirm Upload"
            ) : isEdit ? ( // Checking if it's an edit
              "Edit Have Item"
            ) : (
              "Add Have Item"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
