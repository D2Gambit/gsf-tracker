import React from "react";
import { useAuth } from "../../../AuthContext";
import type { AddHaveItemRequest } from "../../types/list";
import ItemEntryModal, { type ItemFormData } from "../ItemEntryModal";
import { useFinds } from "../../hooks/useFinds";

export default function HaveItemController({
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
  const { session } = useAuth();

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  const { saveFind } = useFinds();

  const initialValues: Partial<ItemFormData> = editItem?.name
    ? {
        name: editItem.name,
        description: editItem.description,
        quality: editItem.quality,
        location: editItem.location,
        image: null,
      }
    : {};

  const handleFormSubmit = async (formData: ItemFormData) => {
    const gsfGroupId = session?.gsfGroupId?.toString() || "Unknown";

    const req: AddHaveItemRequest = {
      image: formData.image!,
      gsfGroupId: session?.gsfGroupId?.toString() || "Unknown",
      name: formData.name,
      description: formData.description,
      foundBy: parsedUserInfo.accountName || "Unknown",
      quality: formData.quality ? formData.quality : "No Quality",
      location: formData.location ? formData.location : "N/A",
      isReserved: editItem.id ? editItem.isReserved.toString() : "false",
      reservedBy: editItem.id ? editItem.reservedBy : "",
    };

    await addHaveItem(req, editItem.id);

    // Conditional: Also submit to Loot Showcase
    if (formData.addToBoth && !editItem.id) {
      try {
        await saveFind({
          name: formData.name,
          image: formData.image!,
          description: formData.description,
          gsfGroupId: gsfGroupId,
          quality: formData.quality,
        });
      } catch (err) {
        console.error("Failed to cross-post to Loot Showcase", err);
      }
    }

    // The Modal handles its own loading state, but we close it via the prop
    setIsAddItemModalOpen(false);
  };

  return (
    <ItemEntryModal
      isModalOpen={isAddItemModalOpen}
      onClose={() => setIsAddItemModalOpen(false)}
      onSubmit={handleFormSubmit}
      mode="have"
      initialValues={initialValues}
      title={editItem.id ? "Edit Have Item" : "Add Have Item"}
    />
  );
}
