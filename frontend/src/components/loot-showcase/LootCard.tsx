import type { LootItem } from "../../types/loot";
import type { ReactionCounts } from "../../types/reactions";
import { Calendar } from "lucide-react";
import ReactionBar from "./ReactionBar";
import { useAuth } from "../../../AuthContext";

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
  setHoveredImage: React.Dispatch<React.SetStateAction<string>>;
  setClickedImage: React.Dispatch<React.SetStateAction<string>>;
};

export default function LootCard({
  index,
  item,
  isHot,
  itemReactions,
  saveReaction,
  setHoveredImage,
  setClickedImage,
}: LootCardProps) {
  const { session } = useAuth();

  // When a reaction is clicked, save the reaction
  const handleReaction = async (findId: string, emoji: string) => {
    const userInfo = localStorage.getItem("gsfUserInfo");
    const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

    if (!session?.gsfGroupId || !parsedUserInfo.accountName) return;

    await saveReaction({
      gsfGroupId: session.gsfGroupId,
      findId,
      accountName: parsedUserInfo.accountName,
      emoji,
    });
  };

  return (
    <div
      key={index}
      className="group relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
    >
      {isHot && (
        <span
          className="text-[2em] absolute top-0 left-0 rounded-br-2xl rounded-tl-lg bg-gradient-to-tl from-gray-600/60 to-white"
          title="This item is HOT!"
        >
          🔥
        </span>
      )}
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-full h-48 object-cover hover:cursor-pointer"
        onClick={() => {
          setClickedImage(item.imageUrl);
        }}
        onMouseEnter={() => setHoveredImage(item.imageUrl)}
        onMouseLeave={() => setHoveredImage("")}
      />
      {/* TODO: Reserve space between reactions and description for wrapping reactions */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{item.name} </h3>
        {itemReactions && (
          <div className="inline-flex flex-wrap gap-2 my-1 text-sm">
            {Object.entries(itemReactions).map(([emoji, data]) => (
              <span
                key={emoji}
                title={data.accounts.join("\n")}
                className="flex items-center gap-1 rounded-full bg-zinc-800/90 hover:bg-zinc-800/60 hover:scale-125 transition-transform text-gray-300 px-2 py-0.5 cursor-pointer"
                onClick={() => handleReaction(item.id, emoji)}
              >
                <span>{emoji}</span>
                <span className="font-medium">{data.count}</span>
              </span>
            ))}
          </div>
        )}

        <p
          className={`text-sm text-gray-600 mb-3 ${
            !item.description && "italic"
          }`}
        >
          {item.description ? item.description : "No description provided."}
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
      </div>
      <ReactionBar itemId={item.id} handleReaction={handleReaction} />
    </div>
  );
}
