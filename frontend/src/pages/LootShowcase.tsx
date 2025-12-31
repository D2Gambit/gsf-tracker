import React, { useState, useEffect } from "react";
import { Upload, Calendar } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UploadFindForm from "../components/UploadFindForm";
import { useAuth } from "../../AuthContext";
import ImageModal from "../components/ImageModal";
import ImageTooltip from "../components/ImageTooltip";
import { toast } from "react-toastify";

interface LootItem {
  id: string;
  name: string;
  imageUrl: string;
  foundBy: string;
  createdAt: string;
  description?: string;
}

type ReactionRow = {
  id: string;
  gsfGroupId: string;
  findId: string;
  accountName: string;
  emoji: string;
  createdAt: string;
};

// move fetchFinds function to a separate file within a services folder and import it here
// move interfaces into a separate file within a types folder and import them here
// update useEffect with modern hooks and cleanup if necessary
// move custom inline styles to a separate file within a styles folder and import them here
// move excess html into separate components and import them here

export default function LootShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [lootItems, setLootItems] = useState<LootItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickedImage, setClickedImage] = useState("");
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  type ReactionCounts = Record<string, number>;

  const [reactions, setReactions] = useState<Record<string, ReactionCounts>>(
    {}
  );

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

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

  const { session } = useAuth();

  const buildReactionMap = (
    rows: ReactionRow[]
  ): Record<string, Record<string, number>> => {
    return rows.reduce((acc, row) => {
      const { findId, emoji } = row;

      if (!acc[findId]) {
        acc[findId] = {};
      }

      acc[findId][emoji] = (acc[findId][emoji] ?? 0) + 1;

      return acc;
    }, {} as Record<string, Record<string, number>>);
  };

  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  const fetchFinds = async () => {
    try {
      setLoading(true);

      // Get all finds first
      const res = await fetch(`/api/finds/${session?.gsfGroupId}`);
      if (!res.ok) throw new Error("Failed to fetch finds");

      const data = await res.json();
      setLootItems(data);
      // Then grab all the find reactions
      const reactionRes = await fetch(
        `/api/find-reactions/${session?.gsfGroupId}`
      );
      if (!reactionRes.ok) {
        throw new Error("Failed to fetch find reactions");
      }
      const reactionsData: ReactionRow[] = await reactionRes.json();
      const reactionMap = buildReactionMap(reactionsData);
      setReactions(reactionMap);
    } catch (err) {
      setError("Unable to load finds");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (lootId: string, emoji: string) => {
    if (!userInfo) return;

    const reqData = new FormData();
    reqData.append("gsfGroupId", session?.gsfGroupId ?? "Unknown");
    reqData.append("findId", lootId);
    reqData.append("accountName", parsedUserInfo.accountName);
    reqData.append("emoji", emoji);
    const res = await fetch(`/api/create-reaction`, {
      method: "POST",
      body: reqData,
    });

    if (res.status === 409) {
      toast.error("You already reacted with this emoji!");
    } else if (!res.ok) {
      // rollback optimistic update
      toast.error("Unable to add reaction. Please try again!");
    } else {
      setReactions((prev) => ({
        ...prev,
        [lootId]: {
          ...prev[lootId],
          [emoji]: (prev[lootId]?.[emoji] ?? 0) + 1,
        },
      }));
    }
  };

  useEffect(() => {
    fetchFinds();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-300 mb-4">
            Loot Showcase
          </h1>
          <p className="text-lg text-gray-400">
            Show off your latest finds and share the excitement with the
            community. Each item listed here is a testament to your skill and
            dedication. Whether it's a rare drop or a meticulously crafted
            piece, every item has a story to tell!
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-zinc-300 rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Latest Finds</h2>
              <button
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                onClick={handleUploadClick}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Find</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading && <p className="text-zinc-400">Loading finds...</p>}

              {error && <p className="text-red-500">{error}</p>}
              {lootItems.map((item, i) => (
                <div
                  key={i}
                  className="group relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover hover:cursor-pointer"
                    onClick={() => {
                      setClickedImage(item.imageUrl);
                    }}
                    onMouseEnter={() => setHoveredImage(item.imageUrl)}
                    onMouseLeave={() => setHoveredImage(null)}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.name}{" "}
                      {reactions[item.id] && (
                        <div className="inline-flex flex-wrap gap-2 mt-2 text-sm">
                          {Object.entries(reactions[item.id]).map(
                            ([emoji, count]) => (
                              <span
                                key={emoji}
                                className="flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5"
                                onClick={() => handleReaction(item.id, emoji)}
                              >
                                <span>{emoji}</span>
                                <span className="font-medium">{count}</span>
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </h3>

                    <p
                      className={`text-sm text-gray-600 mb-3 ${
                        !item.description && "italic"
                      }`}
                    >
                      {item.description
                        ? item.description
                        : "No description provided."}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Found by:{" "}
                        <span className="font-medium text-gray-700">
                          {item.foundBy}
                        </span>
                      </span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString(
                                "en-CA"
                              )
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="group absolute bottom-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 rounded-full bg-zinc-800/90 px-2 py-1 shadow-md">
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
              ))}
            </div>

            {clickedImage && (
              <ImageModal
                imageUrl={clickedImage}
                onClose={() => setClickedImage("")}
              />
            )}

            <ImageTooltip imageUrl={hoveredImage} />

            {lootItems.length === 0 && (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No loot uploaded yet. Start sharing your amazing finds!
                </p>
              </div>
            )}
          </section>
          {isModalOpen && (
            <UploadFindForm
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              onUploadSuccess={fetchFinds}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
