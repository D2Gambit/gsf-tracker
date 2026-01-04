import { useEffect, useRef, useState } from "react";
import type { TabKey } from "../types/list";
import { Plus, Package } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HaveItemForm from "../components/have-list/HaveItemForm";
import { toast } from "react-toastify";
import { useAuth } from "../../AuthContext";
import ItemModal from "../components/ItemModal";
import ListStats from "../components/have-list/ListStats";
import ListItem from "../components/have-list/ListItem";
import type { HaveItem, ListStat } from "../types/list";
import { useHaves } from "../hooks/useHaves";
import ListFilter from "../components/have-list/ListFilter";
import type { ModalContent } from "../types/modal";
import { HoverPreview } from "../components/have-list/HoverPreview";
import ItemListTabs from "../components/ItemListTabs";
import { fetchHaveItemCounts } from "../api/haves.api";

export default function HaveList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [currentItem, setCurrentItem] = useState<Partial<HaveItem>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [showReservedOnly, setShowReservedOnly] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<HaveItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [counts, setCounts] = useState({
    allCount: 0,
    myItemsCount: 0,
    requestsCount: 0,
  });

  const { session } = useAuth();
  const {
    haveItems,
    loading,
    loadHaves,
    addHaveItem,
    deleteHaveItem,
    toggleReservation,
    tabData,
  } = useHaves();

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
  const accountName = parsedUserInfo?.accountName;

  const currentTab = tabData[activeTab];

  const createListStats = (): ListStat[] => {
    const listStats: ListStat[] = [];
    listStats.push({
      statTitle: "Total Items",
      statValue: String(currentTab.items.length),
      statColor: "text-gray-900",
    });
    listStats.push({
      statTitle: "Reservable",
      statValue: String(currentTab.items.filter((i) => !i.isReserved).length),
      statColor: "text-green-600",
    });
    listStats.push({
      statTitle: "Reserved",
      statValue: String(currentTab.items.filter((i) => i.isReserved).length),
      statColor: "text-red-600",
    });
    listStats.push({
      statTitle: "My Posts",
      statValue: String(
        currentTab.items.filter((i) => i.foundBy === accountName).length
      ),
      statColor: "text-blue-800",
    });
    return listStats;
  };

  useEffect(() => {
    const tabState = tabData[activeTab];
    if (tabState.items.length === 0 && tabState.hasMore) {
      loadHaves(session?.gsfGroupId!, activeTab, true);
    }
  }, [session?.gsfGroupId, activeTab]);

  useEffect(() => {
    setSearchTerm("");
    setSelectedQualities([]);
    setShowReservedOnly(false);
  }, [activeTab]);

  useEffect(() => {
    if (!session?.gsfGroupId || !accountName) return;

    fetchHaveItemCounts(session.gsfGroupId, accountName)
      .then(setCounts)
      .catch((err) =>
        toast.error(
          err instanceof Error ? err.message : "Failed to load counts"
        )
      );
  }, [session?.gsfGroupId, accountName]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !session?.gsfGroupId || !currentTab.initialLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !currentTab.loading && currentTab.hasMore) {
          loadHaves(session.gsfGroupId, activeTab);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [session?.gsfGroupId, activeTab, currentTab.loading, currentTab.hasMore]);

  const filteredItems = currentTab.items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuality =
      selectedQualities.length === 0 ||
      selectedQualities.includes(item.quality);

    const matchesReserved =
      !showReservedOnly || (!item.isReserved && item.foundBy !== accountName);

    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "mine"
        ? item.foundBy === accountName
        : activeTab === "requests"
        ? item.foundBy === accountName && item.isReserved
        : true;

    return matchesSearch && matchesQuality && matchesReserved && matchesTab;
  });

  const editItem = (id: string) => {
    setCurrentItem(haveItems.find((item) => item.id === id) || {});
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Header />

      <main className="flex justify-center px-4 sm:px-6 lg:px-8 py-8">
        <section className="flex-col md:w-[500px] lg:w-[700px] ">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-zinc-300">Have List</h1>
              <button
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => {
                  setCurrentItem({});
                  setIsModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>
            <p className="text-lg text-gray-400">
              Track items your group has found and available for distribution.
            </p>
          </div>

          <ItemListTabs
            itemList={currentTab.items}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            counts={counts}
          />

          <ListFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedQualities={selectedQualities}
            setSelectedQualities={setSelectedQualities}
            showReservedOnly={showReservedOnly}
            setShowReservedOnly={setShowReservedOnly}
          />

          {/* Items List */}
          <div className="bg-zinc-300 rounded-lg border border-gray-200 overflow-hidden">
            {loading && <p className="text-zinc-400">Loading have items...</p>}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm
                    ? "No items match your search."
                    : "No items in have list yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    editItem={editItem}
                    deleteHaveItem={deleteHaveItem}
                    toggleReservation={toggleReservation}
                    setModalContent={setModalContent}
                    onHover={(e) => {
                      setHoveredItem(item);
                      setMousePos({ x: e.clientX, y: e.clientY });
                    }}
                    onLeave={() => setHoveredItem(null)}
                  />
                ))}
              </div>
            )}
          </div>

          {modalContent && (
            <ItemModal
              content={modalContent}
              onClose={() => setModalContent(null)}
            />
          )}

          {hoveredItem && (
            <HoverPreview item={hoveredItem} position={mousePos} />
          )}

          {isModalOpen && (
            <HaveItemForm
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              editItem={currentItem}
              addHaveItem={addHaveItem}
            />
          )}

          {currentTab.loading && (
            <p className="text-center text-zinc-500 mt-4">
              Loading more items...
            </p>
          )}

          {currentTab.hasMore && <div ref={loadMoreRef} className="h-1" />}

          <ListStats listStats={createListStats()} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
