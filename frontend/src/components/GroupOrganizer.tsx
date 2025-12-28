import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, RefreshCw, Users, UserMinus, UserPlus } from "lucide-react";
import { toast } from "react-toastify";

interface Player {
  id: string;
  accountName: string;
  characterName: string;
}

const GroupOrganizer = () => {
  const [groupName, setGroupName] = useState("CariGSF");

  // const [players, setPlayers] = useState<Player[]>([
  //   { id: "1", accountName: "Carizona", characterName: "AmazonQueen" },
  //   { id: "2", accountName: "TheCombinelord", characterName: "SinfulSpongee" },
  //   { id: "3", accountName: "Jaquar", characterName: "JaqOfTrades" },
  //   { id: "4", accountName: "zachammer", characterName: "ZachAttack" },
  //   { id: "5", accountName: "minted", characterName: "KnightedFOH" },
  //   { id: "6", accountName: "D2Gambit", characterName: "DiseasedWorm" },
  // ]);

  const [players, setPlayers] = useState<Player[]>([]);

  const removePlayer = (id: string) => {
    setPlayers((players) => players.filter((player) => player.id !== id));
    toast.success("Player removed from group");
  };

  return (
    <section className="bg-zinc-300 rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center space-x-3 mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">{groupName}</h2>
        </div>
        <Link to="/signup">
          <button className="flex space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            <UserPlus className="h-5 w-5" />
            <span>Sign up</span>
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        {/* Group Members Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
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
                No players in the group yet. Share the group name and password
                to invite members.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GroupOrganizer;
