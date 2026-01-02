import { useState, useEffect, useMemo, useRef } from "react";
import { Upload } from "lucide-react";
import UploadLootForm from "./UploadLootForm";
import ImageModal from "../ImageModal";
import ImageTooltip from "../ImageTooltip";
import LootCard from "./LootCard";
import { removeHotItems } from "../../utils/sorting";
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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /** ---------------------------
   * Domain state (hooks)
   ---------------------------- */
  const { session } = useAuth();

  const { items, hotItems, loading, loadFinds, saveFind, loadHotFinds } =
    useFinds();

  const { reactions, loadReactions, saveReaction } = useReactions();
  // const [hotItems, setHotItems] = useState<LootItem[]>([]);

  /** ---------------------------
   * Initial load (finds + reactions)
   ---------------------------- */

  useEffect(() => {
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
            setHoveredImage={setHoveredImage}
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
    </section>
  );
}
