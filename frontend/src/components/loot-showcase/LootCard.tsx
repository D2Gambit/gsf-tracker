import type { LootItem } from "../../types/loot";
import type { ReactionCounts } from "../../types/reactions";
import { Calendar, Trash2 } from "lucide-react";
import ReactionBar from "./ReactionBar";
import { useAuth } from "../../../AuthContext";
import { toast } from "react-toastify";
import { useState } from "react";
import { HoverPreview } from "../have-list/HoverPreview";
import ItemDescriptionRenderer from "../have-list/ItemDescriptionRenderer";
import {
  hasParsedDescription,
  normalizeDescriptionForModal,
} from "../../utils/strings";

type LootCardProps = {
  index: string;
  item: LootItem;
  isHot: boolean;
  itemReactions: ReactionCounts;
  saveReaction: (data: {
    gsfGroupId: string;
    findId: string;
    accountName: string;
    emoji: string;
  }) => Promise<void>;
  removeReaction: (data: {
    gsfGroupId: string;
    findId: string;
    accountName: string;
    emoji: string;
  }) => Promise<void>;
  showDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setItemToDelete: React.Dispatch<React.SetStateAction<string>>;
  setClickedImage: React.Dispatch<React.SetStateAction<string>>;
};

export default function LootCard({
  index,
  item,
  isHot,
  itemReactions,
  saveReaction,
  removeReaction,
  showDeleteModal,
  setItemToDelete,
  setClickedImage,
}: LootCardProps) {
  const { session, userInfo } = useAuth();

  const [hoveredItem, setHoveredItem] = useState<LootItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const normalized = normalizeDescriptionForModal(item.description, item.name);
  const accountName = userInfo?.accountName;

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleReaction = async (findId: string, emoji: string) => {
    if (!session?.gsfGroupId || !userInfo?.accountName) return;

    // Check if the user has already reacted with this emoji
    const hasReacted =
      itemReactions &&
      itemReactions[emoji] &&
      itemReactions[emoji].accounts.includes(userInfo.accountName);

    try {
      if (hasReacted) {
        // User has reacted, so remove the reaction
        await removeReaction({
          gsfGroupId: session.gsfGroupId,
          findId,
          accountName: userInfo.accountName,
          emoji,
        });
      } else {
        // User has not reacted, so save the reaction
        await saveReaction({
          gsfGroupId: session.gsfGroupId,
          findId,
          accountName: userInfo.accountName,
          emoji,
        });
      }
    } catch (error) {
      console.error("Failed to update reaction", error);
      toast.error("Something went wrong updating your reaction.");
    }
  };

  return (
    <div
      key={index}
      className="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-black/30 transition-shadow"
    >
      {isHot && (
        <span
          className="text-[2em] absolute top-0 left-0 rounded-br-md rounded-tl-lg bg-gradient-to-tl from-gray-600/60 to-white"
          title="This item is HOT!"
        >
          🔥
        </span>
      )}
      {accountName === item.foundBy && (
        <button
          className="absolute top-0 right-0 rounded-bl-md rounded-tr-lg bg-gradient-to-tr from-gray-600/60 to-white z-20 hover:bg-red-700"
          title="Delete Item"
          onClick={() => {
            setItemToDelete(item.id);
            showDeleteModal(true);
          }}
        >
          <Trash2 className="w-12 h-12 p-2" />
        </button>
      )}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-48 object-cover hover:cursor-pointer"
          onClick={() => {
            setClickedImage(item.imageUrl);
          }}
          onMouseEnter={(e) => {
            setHoveredItem(item);
            setMousePos({ x: e.clientX, y: e.clientY });
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredItem(null)}
        />
      ) : (
        <div
          onClick={() => {
            setClickedImage(item.imageUrl);
          }}
          onMouseEnter={(e) => {
            setHoveredItem(item);
            setMousePos({ x: e.clientX, y: e.clientY });
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <ItemDescriptionRenderer
            description={normalized.description}
            itemName={item.name}
            foundBy={item.foundBy}
            quality={item.quality}
            className="w-full h-48 overflow-hidden object-cover hover:cursor-pointer font-serif bg-black/85 text-md leading-snug bg-gradient-radial from-zinc-800 via-zinc-900 to-black px-4 py-3 min-w-[360px]"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{item.name} </h3>

        <p
          className={`text-sm text-gray-600 mb-3 ${
            !item.description && "italic"
          }`}
        >
          {item.description && !hasParsedDescription(item.description)
            ? item.description
            : "No description provided."}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Found by:{" "}
            <span className="font-medium text-gray-700">{item.foundBy}</span>
          </span>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-CA")
                : "Unknown"}
            </span>
          </div>
        </div>
        {itemReactions && (
          <div className="inline-flex flex-wrap items-end gap-2 mt-2 text-sm">
            {Object.entries(itemReactions).map(([emoji, data]) => {
              const hasReacted =
                accountName && data.accounts.includes(accountName);

              return (
                <span
                  key={emoji}
                  title={data.accounts.join("\n")}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 cursor-pointer border transition-all hover:scale-110 ${
                    hasReacted
                      ? "border-blue-500 bg-blue-100/10 text-blue-600 hover:bg-zinc-400/60"
                      : "border-transparent bg-zinc-800/90 text-gray-300 hover:bg-zinc-800/60"
                  }`}
                  onClick={() => handleReaction(item.id, emoji)}
                >
                  <span>{emoji}</span>
                  <span className="font-medium">{data.count}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
      {hoveredItem && <HoverPreview item={hoveredItem} position={mousePos} />}
      <ReactionBar itemId={item.id} handleReaction={handleReaction} />
    </div>
  );
}
