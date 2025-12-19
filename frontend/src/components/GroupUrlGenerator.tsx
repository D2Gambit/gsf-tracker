import React, { useState } from "react";
import { Copy, RefreshCw, Users, UserMinus } from "lucide-react";
import { toast } from "react-toastify";

interface Player {
  id: string;
  accountName: string;
  characterName: string;
}

const GroupUrlGenerator = () => {
  const [groupUrl, setGroupUrl] = useState(
    "https://www.gsftracker.com/group/CariGSF-JAN2026"
  );
  const [groupName, setGroupName] = useState("CariGSF");

  const [players, setPlayers] = useState<Player[]>([
    { id: "1", accountName: "Carizona", characterName: "AmazonQueen" },
    { id: "2", accountName: "TheCombinelord", characterName: "SinfulSpongee" },
    { id: "3", accountName: "Jaquar", characterName: "JaqOfTrades" },
    { id: "4", accountName: "zachammer", characterName: "ZachAttack" },
    { id: "5", accountName: "minted", characterName: "KnightedFOH" },
    { id: "6", accountName: "D2Gambit", characterName: "DiseasedWorm" },
  ]);

  const generateNewUrl = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const slug = groupName.toLowerCase().replace(/\s+/g, "-");
    setGroupUrl(`https://www.gsftracker.com/group/${slug}-${randomId}`);
    toast.success("New group URL generated!");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(groupUrl);
      toast.success("URL copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const removePlayer = (id: string) => {
    setPlayers((players) => players.filter((player) => player.id !== id));
    toast.success("Player removed from group");
  };

  return (
    <section className="bg-zinc-300 rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Group Organizer</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="groupName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Group Name
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Enter your group name"
          />
        </div>

        <div>
          <label
            htmlFor="groupUrl"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Shareable Group URL
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="groupUrl"
              value={groupUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={generateNewUrl}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>New</span>
            </button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800 mb-2">
            Share this URL with your group members
          </h3>
          <p className="text-sm text-red-700">
            Anyone with this URL can join your GSF group and contribute to the
            shared item lists.
          </p>
        </div>

        {/* Group Members Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Group Members ({players.length})
          </h3>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {player.accountName}
                  </div>
                  <div className="text-sm text-gray-600">
                    Character: {player.characterName}
                  </div>
                </div>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove player from group"
                >
                  <UserMinus className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              </div>
            ))}
            {players.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No players in the group yet. Share the URL to invite members.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GroupUrlGenerator;
