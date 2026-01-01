import { useState, useEffect, useMemo } from "react";
import { Upload } from "lucide-react";
import UploadLootForm from "./UploadLootForm";
import ImageModal from "../ImageModal";
import ImageTooltip from "../ImageTooltip";
import LootCard from "./LootCard";
import { sortLootWithTopReactions } from "../../utils/sorting";
import { useAuth } from "../../../AuthContext";
import { useFinds } from "../../hooks/useFinds";
import { useReactions } from "../../hooks/useReactions";

export default function LootGrid() {
  /** ---------------------------
       * Local UI state
       ---------------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [clickedImage, setClickedImage] = useState("");
  const [hoveredImage, setHoveredImage] = useState("");

  /** ---------------------------
   * Domain state (hooks)
   ---------------------------- */
  const { session } = useAuth();

  const { items, loading, loadFinds, saveFind } = useFinds();

  const { reactions, loadReactions, saveReaction } = useReactions();

  /** ---------------------------
   * Initial load (finds + reactions)
   ---------------------------- */

  useEffect(() => {
    if (!session?.gsfGroupId) return;
    loadFinds(session.gsfGroupId);
  }, [session?.gsfGroupId]);

  useEffect(() => {
    if (!session?.gsfGroupId) return;
    loadReactions(session.gsfGroupId);
  }, [session?.gsfGroupId]);

  const sortedItems = useMemo(
    () => sortLootWithTopReactions(items, reactions, 3),
    [items, reactions]
  );

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <p className="text-zinc-400">Loading finds...</p>}

        {sortedItems.map((item, i) => (
          <LootCard
            key={item.id}
            index={String(i)}
            item={item}
            isHot={i >= 0 && i <= 2 && reactions[item.id] !== undefined}
            itemReactions={reactions[item.id]}
            saveReaction={saveReaction}
            setHoveredImage={setHoveredImage}
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

      <ImageTooltip imageUrl={hoveredImage} />

      {isModalOpen && (
        <UploadLootForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          saveFind={saveFind}
        />
      )}

      {items.length === 0 && (
        <div className="text-center py-12">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            No loot uploaded yet. Start sharing your amazing finds!
          </p>
        </div>
      )}
    </section>
  );
}
