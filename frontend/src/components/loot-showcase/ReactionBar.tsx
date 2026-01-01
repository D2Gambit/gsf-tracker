import { useState } from "react";
import { SmilePlus } from "lucide-react";
import type { LootItem } from "../../types/loot";

const AVAILABLE_REACTIONS = [
  "🔥",
  "💪",
  "👌",
  "👍",
  "🤏",
  "🍆",
  "💦",
  "🏄",
  "💀",
];

type ReactionBarProps = {
  item: LootItem;
  handleReaction: (id: string, emoji: string) => void;
};

export default function ReactionBar({
  item,
  handleReaction,
}: ReactionBarProps) {
  /** ---------------------------
   * Handle emoji reaction click
   ---------------------------- */
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="group absolute bottom-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 rounded-full bg-zinc-800/90 px-2 py-1 shadow-md">
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="text-white rounded-full p-1 shadow-md transition-colors"
      >
        <SmilePlus className="h-3 w-3" />
      </button>
      {/* Emoji Buttons */}
      <div
        className={`
                        flex gap-1 rounded-full bg-zinc-800/90 p-1 shadow-md
                        transition-all overflow-hidden
                        ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}
                      `}
      >
        {AVAILABLE_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(item.id, emoji)}
            className="text-lg hover:scale-125 transition-transform cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
