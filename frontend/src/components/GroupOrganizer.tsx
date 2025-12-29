import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, RefreshCw, Users, UserMinus, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../AuthContext";

interface Player {
  id: string;
  gsfGroupId: string;
  role: string;
  accountName: string;
  characterName: string;
  hasPlayedGsf: boolean;
  preferredTimezone: string;
  preferredClass: string;
  preferredSecondaryClass: string;
  discordName: string;
}

const GroupOrganizer = () => {
  const { session } = useAuth();

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch(`/api/members/${session?.gsfGroupId}`);
        const data = await res.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, [session?.gsfGroupId]);

  const removePlayer = (id: string) => {
    try {
      fetch(`/api/delete-member/${id}`, { method: "DELETE" });
      setPlayers((players) => players.filter((player) => player.id !== id));
      toast.success("Player removed from group");
    } catch (error) {
      console.error("Error removing player:", error);
    }
  };

  const classColors = (playerClass: string) => {
    switch (playerClass.toLowerCase()) {
      case "amazon":
        return "bg-green-100 text-green-800";
      case "barbarian":
        return "bg-orange-100 text-orange-800";
      case "druid":
        return "bg-green-100 text-green-800";
      case "necromancer":
        return "bg-purple-100 text-purple-800";
      case "paladin":
        return "bg-blue-100 text-blue-800";
      case "sorceress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "text-gray-500";
    }
  };

  return (
    <section className="bg-zinc-300 rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center space-x-3 mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {session?.gsfGroupId}
          </h2>
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
                    <span
                      className={`inline-flex mr-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        player.role === "organizer"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                      title="Role"
                    >
                      {player.role.charAt(0).toUpperCase() +
                        player.role.slice(1)}
                    </span>
                    {player.accountName}
                    <span className="text-sm text-gray-600">
                      {" - "}
                      {player.characterName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-600">
                      Timezone: {player.preferredTimezone}
                    </div>
                    <span
                      className={`inline-flex items-center m-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${classColors(
                        player.preferredClass
                      )}`}
                      title="Preferred Class"
                    >
                      {player.preferredClass}
                    </span>
                    /
                    <span
                      className={`inline-flex items-center m-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${classColors(
                        player.preferredSecondaryClass
                      )}`}
                      title="Secondary Class"
                    >
                      {player.preferredSecondaryClass}
                    </span>
                    <span
                      className={
                        "inline-flex items-center m-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white"
                      }
                      title="Discord Name"
                    >
                      Discord: {player.discordName}
                    </span>
                  </div>
                </div>
                {(() => {
                  const userInfo = localStorage.getItem("gsfUserInfo");
                  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
                  return parsedUserInfo &&
                    parsedUserInfo.role === "organizer" ? (
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="flex items-center space-x-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove player from group"
                    >
                      <UserMinus className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                  ) : null;
                })()}
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
