import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { usePersonalBingo } from "../hooks/usePersonalBingo";
import { CheckCircle2, Circle } from "lucide-react";
import type { Player } from "../types/list";

const PersonalBingoBoard = ({ gsfGroupId }: { gsfGroupId: string }) => {
  const { userInfo } = useAuth();
  const { items, summary, load, loadSummary, complete, uncomplete } =
    usePersonalBingo();
  const [players, setPlayers] = useState<Player[]>([]);
  const [viewingAccount, setViewingAccount] = useState("");

  useEffect(() => {
    if (userInfo?.accountName && !viewingAccount) {
      setViewingAccount(userInfo.accountName);
    }
  }, [userInfo, viewingAccount]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch(`/api/members/${gsfGroupId}`);
        const data = await res.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };
    fetchPlayers();
  }, [gsfGroupId]);

  useEffect(() => {
    loadSummary(gsfGroupId);
  }, [gsfGroupId, loadSummary]);

  useEffect(() => {
    if (viewingAccount) load(gsfGroupId, viewingAccount);
  }, [gsfGroupId, viewingAccount, load]);

  const isOwnCard = viewingAccount === userInfo?.accountName;

  const percentFor = (accountName: string) => {
    if (!summary || summary.totalItems === 0) return null;
    const completed =
      summary.counts.find((c) => c.accountName === accountName)
        ?.completedCount ?? 0;
    return Math.round((completed / summary.totalItems) * 100);
  };

  return (
    <section className="bg-zinc-300 rounded-lg border border-gray-200 p-6">
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm text-zinc-600">Viewing:</label>
        <select
          value={viewingAccount}
          onChange={(e) => setViewingAccount(e.target.value)}
          className="bg-zinc-800 text-zinc-100 text-sm rounded px-2 py-1 border border-zinc-700"
        >
          <option value={userInfo?.accountName}>
            {userInfo?.accountName} (me)
            {percentFor(userInfo?.accountName ?? "") !== null
              ? ` — ${percentFor(userInfo?.accountName ?? "")}%`
              : ""}
          </option>
          {players
            .filter((m) => m.accountName !== userInfo?.accountName)
            .map((m) => (
              <option key={m.accountName} value={m.accountName}>
                {m.accountName}
                {percentFor(m.accountName) !== null
                  ? ` — ${percentFor(m.accountName)}%`
                  : ""}
              </option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => {
          const done = Boolean(item.progress);
          return (
            <button
              key={item.id}
              disabled={!isOwnCard}
              onClick={() =>
                done
                  ? uncomplete(
                      item.id,
                      gsfGroupId,
                      viewingAccount,
                      userInfo!.accountName,
                    )
                  : complete(
                      item.id,
                      gsfGroupId,
                      viewingAccount,
                      userInfo!.accountName,
                    )
              }
              className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center text-sm transition-colors ${
                done
                  ? "bg-green-900/80 border-green-600 text-green-200"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300"
              } ${isOwnCard ? "hover:border-red-500 cursor-pointer" : "cursor-default"}`}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-500" />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {!isOwnCard && (
        <p className="text-xs text-zinc-500 mt-3">
          You're viewing {viewingAccount}'s card — only they can check items
          off.
        </p>
      )}
    </section>
  );
};

export default PersonalBingoBoard;
