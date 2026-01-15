import { useState, useEffect, useMemo, useRef } from "react";
import { Upload } from "lucide-react";
import ItemEntryModal, { type ItemFormData } from "../ItemEntryModal";
import ImageModal from "../ImageModal";
import LootCard from "./LootCard";
import { removeHotItems } from "../../utils/sorting";
import { useAuth } from "../../../AuthContext";
import { useFinds } from "../../hooks/useFinds";
import { useReactions } from "../../hooks/useReactions";
import { useNavigate } from "react-router-dom";
import { deleteFind } from "../../api/finds.api";
import DeleteModal from "../DeleteModal";
import type { AddHaveItemRequest } from "../../types/list";
import { useHaves } from "../../hooks/useHaves";

// Prevents the form from resetting on every keystroke
const EMPTY_INITIAL_VALUES = {};

export default function LootGrid() {
  /** ---------------------------
       * Local UI state
       ---------------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [clickedImage, setClickedImage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [findIdToDelete, setFindIdToDelete] = useState("");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  /** ---------------------------
   * Domain state (hooks)
   ---------------------------- */
  const { session, userInfo } = useAuth();
  const accountName = userInfo?.accountName;

  const {
    items,
    setItems,
    hotItems,
    loading,
    loadFinds,
    saveFind,
    loadHotFinds,
  } = useFinds();

  const { addHaveItem } = useHaves();

  const { reactions, loadReactions, saveReaction, removeReaction } =
    useReactions();

  /** ---------------------------
   * Initial load (finds + reactions)
   ---------------------------- */

  useEffect(() => {
    if (!session || !userInfo || !accountName) {
      navigate("/");
    }
    if (!session?.gsfGroupId) return;
    loadFinds(session.gsfGroupId, true); // reset
  }, [session?.gsfGroupId]);

  useEffect(() => {
    if (!session?.gsfGroupId) return;
    loadHotFinds(session.gsfGroupId);
  }, [session?.gsfGroupId]);

  useEffect(() => {
    if (!loadMoreRef.current || !session?.gsfGroupId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadFinds(session.gsfGroupId);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [loadMoreRef, session?.gsfGroupId, loading]);

  useEffect(() => {
    if (!session?.gsfGroupId) return;
    loadReactions(session.gsfGroupId);
  }, [session?.gsfGroupId]);

  const removedHotItemsList = useMemo(
    () => removeHotItems(items, hotItems),
    [items, hotItems]
  );

  const handleDelete = (findId: string) => {
    deleteFind(findId);
    setItems(items.filter((item) => item.id !== findId));
  };

  const handleUploadSubmit = async (formData: ItemFormData) => {
    const gsfGroupId = session?.gsfGroupId ?? "Unknown";

    // Submit to Loot Showcase
    await saveFind({
      name: formData.name,
      // We assume image is present or handled by the API if null,
      // strict null checks might require formData.image! if your type mandates it
      image: formData.image!,
      description: formData.description,
      gsfGroupId: session?.gsfGroupId ?? "Unknown",
      quality: formData.quality,
    });

    // Conditional: Also submit to Have List
    if (formData.addToBoth) {
      try {
        const haveReq: AddHaveItemRequest = {
          image: formData.image!,
          gsfGroupId: gsfGroupId.toString(),
          name: formData.name,
          description: formData.description,
          foundBy: accountName || "Unknown",
          quality: formData.quality ? formData.quality : "No Quality",
          // Loot form doesn't have 'location' field, so we default it here
          // CHANGE LATER
          location: "Loot Drop",
          isReserved: "false",
          reservedBy: "",
        };

        await addHaveItem(haveReq, "");
      } catch (err) {
        console.error("Failed to cross-post to Have List", err);
      }
    }
  };

  return (
    <section className="bg-zinc-300 rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Latest Finds</h2>
        <button
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Find</span>
        </button>
      </div>

      {loading && <p className="text-zinc-400">Loading finds...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotItems.map((item, i) => (
          <LootCard
            key={item.id}
            index={String(i)}
            item={item}
            isHot={true}
            itemReactions={reactions[item.id]}
            saveReaction={saveReaction}
            removeReaction={removeReaction}
            showDeleteModal={setShowDeleteModal}
            setItemToDelete={setFindIdToDelete}
            setClickedImage={setClickedImage}
          />
        ))}
        {removedHotItemsList.map((item, i) => (
          <LootCard
            key={item.id}
            index={String(i)}
            item={item}
            isHot={false}
            itemReactions={reactions[item.id]}
            saveReaction={saveReaction}
            removeReaction={removeReaction}
            showDeleteModal={setShowDeleteModal}
            setItemToDelete={setFindIdToDelete}
            setClickedImage={setClickedImage}
          />
        ))}
      </div>

      {clickedImage && (
        <ImageModal
          imageUrl={clickedImage}
          onClose={() => setClickedImage("")}
        />
      )}

      {isModalOpen && (
        <ItemEntryModal
          isModalOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleUploadSubmit}
          mode="loot"
          initialValues={EMPTY_INITIAL_VALUES}
        />
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-12">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            No loot uploaded yet. Start sharing your amazing finds!
          </p>
        </div>
      )}

      <div ref={loadMoreRef} className="h-10" />

      {loading && (
        <p className="text-center text-zinc-500 mt-4">Loading more finds...</p>
      )}

      {/* Render the Confirmation Component */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFindIdToDelete("");
        }}
        onConfirm={() => handleDelete(findIdToDelete)}
        title="Remove Showcase Item"
        message={
          <span>
            Delete{" "}
            <span className="font-extrabold">
              {items.filter((item) => item.id === findIdToDelete).length > 0 &&
                items.filter((item) => item.id === findIdToDelete)[0].name}
              ?
            </span>{" "}
            This action cannot be undone.
          </span>
        }
        confirmLabel="Delete"
      />
    </section>
  );
}
