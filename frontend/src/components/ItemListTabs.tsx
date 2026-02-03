import type { HaveItem, NeedItem, TabKey } from "../types/list";

type ItemListTabsProps = {
  itemList: NeedItem[] | HaveItem[];
  activeTab: TabKey;
  setActiveTab: React.Dispatch<React.SetStateAction<TabKey>>;
  isHaveList: boolean;
  counts: {
    allCount: number;
    myItemsCount: number;
    requestsCount: number;
  } | null;
};

export default function ItemListTabs({
  itemList,
  activeTab,
  setActiveTab,
  isHaveList,
  counts,
}: ItemListTabsProps) {
  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
  const accountName = parsedUserInfo?.accountName;

  return (
    <div className="mt-4 mb-4 border-b border-zinc-600">
      <nav className="flex space-x-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "border-b-2 border-red-500 text-red-500"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          All Items
          <span className="ml-2 text-xs text-zinc-400">
            ({counts ? counts.allCount : itemList.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("mine")}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === "mine"
              ? "border-b-2 border-red-500 text-red-500"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          My Listed Items
          <span className="ml-2 text-xs text-zinc-400">
            (
            {counts
              ? counts.myItemsCount
              : itemList.filter((i) => {
                  if ("requestedBy" in i) {
                    return (i as NeedItem).requestedBy === accountName;
                  }
                }).length}
            )
          </span>
        </button>

        {isHaveList && (
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === "requests"
                ? "border-b-2 border-red-500 text-red-500"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Requests
            <span className="ml-2 text-xs text-zinc-400">
              (
              {counts
                ? counts.requestsCount
                : itemList.filter((i) => {
                    return (
                      (i as HaveItem).foundBy === accountName &&
                      (i as HaveItem).isReserved
                    );
                  }).length}
              )
            </span>
          </button>
        )}

        {isHaveList && (
          <button
            onClick={() => setActiveTab("itemsIWant")}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === "itemsIWant"
                ? "border-b-2 border-red-500 text-red-500"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Items I Want
            <span className="ml-2 text-xs text-zinc-400">
              (
              {counts
                ? counts.itemsIWantCount
                : itemList.filter((i) => {
                    return (
                      (i as HaveItem).reservedBy === accountName &&
                      (i as HaveItem).isReserved
                    );
                  }).length}
              )
            </span>
          </button>
        )}
      </nav>
    </div>
  );
}
