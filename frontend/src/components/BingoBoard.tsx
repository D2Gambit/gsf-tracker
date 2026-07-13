import { useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { useBingo } from "../hooks/useBingo";

const BingoBoard = ({ gsfGroupId }: { gsfGroupId: string }) => {
  const { userInfo } = useAuth();
  const { items, load, claim, unclaim } = useBingo();

  useEffect(() => {
    load(gsfGroupId);
  }, [gsfGroupId, load]);

  return (
    <section className="bg-zinc-300 rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {items.map((item) => {
          const isComplete = item.claims.length >= item.maxEntries;
          const isPartial = item.claims.length > 0 && !isComplete;

          return (
            <div
              key={item.id}
              className={`border rounded-lg p-3 transition-colors ${
                isComplete
                  ? "bg-green-900/80 border-green-600 text-green-200"
                  : isPartial
                    ? "bg-orange-900/60 border-orange-600 text-orange-200"
                    : "bg-zinc-800 border-zinc-700 text-zinc-100"
              }`}
            >
              <p className="font-medium text-sm mb-2">{item.label}</p>
              {Array.from({ length: item.maxEntries }).map((_, slot) => {
                const claimForSlot = item.claims.find(
                  (c) => c.slotIndex === slot,
                );
                const isMine =
                  claimForSlot?.accountName === userInfo?.accountName;
                const slotLabel =
                  item.slotLabels?.[slot] ??
                  (item.maxEntries > 1 ? `Player ${slot + 1}` : null);

                return (
                  <div
                    key={slot}
                    className="flex justify-between text-xs py-0.5"
                  >
                    {slotLabel && <span>{slotLabel}:</span>}
                    {claimForSlot ? (
                      <button
                        disabled={!isMine}
                        onClick={() =>
                          isMine &&
                          unclaim(
                            claimForSlot.id,
                            item.id,
                            userInfo!.accountName,
                          )
                        }
                        className={
                          isMine
                            ? "text-green-500 hover:underline"
                            : "text-green-300"
                        }
                      >
                        {claimForSlot.accountName}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          claim(
                            item.id,
                            gsfGroupId,
                            userInfo!.accountName,
                            item.slotLabels ? slot : undefined,
                          )
                        }
                        className="text-zinc-400 hover:text-red-400"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BingoBoard;
