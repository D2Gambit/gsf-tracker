import { useState } from "react";
import BingoBoard from "../components/BingoBoard";
import PersonalBingoBoard from "../components/PersonalBingoBoard";
import Header from "../components/Header";
import { useAuth } from "../../AuthContext";

const subTabs = [
  { key: "group", name: "Group Bingo" },
  { key: "personal", name: "Personal Bingo" },
] as const;

const BingoPage = () => {
  const [activeTab, setActiveTab] = useState<"group" | "personal">("group");

  const { session } = useAuth();
  const gsfGroupId: string = session?.gsfGroupId ?? "unknown-group";

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {subTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab.key
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-zinc-400 hover:text-red-400"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {activeTab === "group" ? (
          <BingoBoard gsfGroupId={gsfGroupId} />
        ) : (
          <PersonalBingoBoard gsfGroupId={gsfGroupId} />
        )}
      </main>
    </div>
  );
};

export default BingoPage;
