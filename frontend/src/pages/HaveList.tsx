import { useEffect, useState } from "react";
import type { ParsedItem } from "../types/list";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  Package,
  Image,
  FileText,
  Filter,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HaveItemForm from "../components/have-list/HaveItemForm";
import { toast } from "react-toastify";
import { useAuth } from "../../AuthContext";
import ItemModal from "../components/ItemModal";
import ListStats from "../components/have-list/ListStats";
import ListItem from "../components/have-list/ListItem";
import type { HaveItem, ListStat } from "../types/list";
import { getQualityColor } from "../utils/colors";
import { useHaves } from "../hooks/useHaves";
import ListFilter from "../components/have-list/ListFilter";
import type { ModalContent } from "../types/modal";
import { HoverPreview } from "../components/have-list/HoverPreview";

export default function HaveList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [currentItem, setCurrentItem] = useState<Partial<HaveItem>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [showReservedOnly, setShowReservedOnly] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<HaveItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { session } = useAuth();
  const {
    haveItems,
    loading,
    loadHaves,
    addHaveItem,
    deleteHaveItem,
    toggleReservation,
  } = useHaves();

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
  const accountName =
    parsedUserInfo?.accountName || (session as any)?.accountName || "";

  const createListStats = (): ListStat[] => {
    const listStats: ListStat[] = [];
    listStats.push({
      statTitle: "Total Items",
      statValue: String(haveItems.length),
      statColor: "text-gray-900",
    });
    listStats.push({
      statTitle: "Reservable",
      statValue: String(haveItems.filter((i) => !i.isReserved).length),
      statColor: "text-green-600",
    });
    listStats.push({
      statTitle: "Reserved",
      statValue: String(haveItems.filter((i) => i.isReserved).length),
      statColor: "text-red-600",
    });
    listStats.push({
      statTitle: "My Posts",
      statValue: String(
        haveItems.filter((i) => i.foundBy === accountName).length
      ),
      statColor: "text-blue-800",
    });
    return listStats;
  };

  useEffect(() => {
    if (!session?.gsfGroupId) return;
    loadHaves(session?.gsfGroupId);
  }, [session?.gsfGroupId]);

  const filteredItems = haveItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuality =
      selectedQualities.length === 0 ||
      selectedQualities.includes(item.quality);

    const matchesReserved =
      !showReservedOnly || (!item.isReserved && item.foundBy !== accountName);

    return matchesSearch && matchesQuality && matchesReserved;
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

          <ListStats listStats={createListStats()} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
