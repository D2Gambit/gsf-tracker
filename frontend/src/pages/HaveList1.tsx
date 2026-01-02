import React, { useEffect, useState } from "react";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  Package,
  Image,
  Filter,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HaveItemForm from "../components/HaveItemForm";
import { toast } from "react-toastify";
import { useAuth } from "../../AuthContext";
import ImageModal from "../components/ImageModal";

//HaveItem1.tsx

interface HaveItem {
  id: string;
  name: string;
  description: string;
  quality:
    | "Charms"
    | "Materials"
    | "Normal"
    | "Magic"
    | "Rare"
    | "Set"
    | "Unique";
  foundBy: string;
  location: string;
  createdAt: string;
  isReserved: boolean;
  reservedBy?: string;
  imageUrl: string;
}

export default function HaveList() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddHaveItemClick = () => {
    setCurrentItem({});
    setIsModalOpen(true);
  };

  const [currentItem, setCurrentItem] = useState<Partial<HaveItem>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [haveItems, setHaveItems] = useState<HaveItem[]>([]);
  const [clickedImage, setClickedImage] = useState("");
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [showReservedOnly, setShowReservedOnly] = useState(false);

  const QUALITY_OPTIONS = [
    "Charms",
    "Materials",
    "Normal",
    "Magic",
    "Rare",
    "Unique",
    "Set",
  ];

  const { session } = useAuth();

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  useEffect(() => {
    // Fetch have items from backend API
    const fetchHaveItems = async () => {
      try {
        const response = await fetch(`/api/have-items/${session?.gsfGroupId}`);
        const data = await response.json();
        setHaveItems(data);
      } catch (error) {
        console.error("Error fetching have items:", error);
      }
    };

    fetchHaveItems();
  }, []);

  const filteredItems = haveItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuality =
      selectedQualities.length === 0 ||
      selectedQualities.includes(item.quality);

    // const matchesMyItems = ;

    const matchesReserved =
      !showReservedOnly ||
      (item.isReserved === false &&
        item.foundBy !== parsedUserInfo.accountName);

    return matchesSearch && matchesQuality && matchesReserved;
  });

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/delete-have-item/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      setHaveItems((items) => items.filter((item) => item.id !== id));
      toast.success("Item removed from have list");
    } catch (error) {
      console.error("Error deleting selected item:", error);
    }
  };

  const addItem = (id: string) => {
    toast.success("Item added to have list");
  };

  const editItem = (id: string) => {
    setCurrentItem(haveItems.find((item) => item.id === id) || {});
    setIsModalOpen(true);
  };

  const toggleReserved = async (id: string) => {
    try {
      var _currentItem = haveItems.find((item) => item.id === id);

      const formData = new FormData();
      formData.append("id", id);
      formData.append("isReserved", (!_currentItem?.isReserved).toString());
      formData.append("reservedBy", parsedUserInfo.accountName);

      const res = await fetch("/api/reserve-have-item", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setHaveItems((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                isReserved: !item.isReserved,
                reservedBy: parsedUserInfo.accountName,
              }
            : item
        )
      );
      toast.success("Reservation status updated");
    } catch (error) {
      console.error("Error finding item to toggle reserved flag:", error);
      return;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Charms":
        return "bg-purple-100 text-purple-800";
      case "Materials":
        return "bg-red-100 text-red-800";
      case "Normal":
        return "bg-gray-100 text-gray-800";
      case "Magic":
        return "bg-blue-100 text-blue-800";
      case "Rare":
        return "bg-yellow-100 text-yellow-800";
      case "Set":
        return "bg-green-100 text-green-800";
      case "Unique":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-zinc-300">Have List</h1>
            <button
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              onClick={handleAddHaveItemClick}
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>
          <p className="text-lg text-gray-400">
            Track items your group has found and available for distribution.
          </p>
        </div>

        {/* Search */}
        <div className="mb-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Search items by name or description..."
            />
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 mt-3 mb-3">
          <Filter className="flex h-4 w-4 text-zinc-300" />
          <label className="text-sm font-medium text-zinc-300">Filters: </label>
          {/* Quality filters */}
          {QUALITY_OPTIONS.map((quality) => {
            const isSelected = selectedQualities.includes(quality);

            return (
              <button
                key={quality}
                type="button"
                onClick={() =>
                  setSelectedQualities((prev) =>
                    prev.includes(quality)
                      ? prev.filter((q) => q !== quality)
                      : [...prev, quality]
                  )
                }
                className={`
          inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
          border transition
          ${
            isSelected
              ? `${getQualityColor(quality)} border-transparent`
              : `${getQualityColor(
                  quality
                )} opacity-70 border-zinc-300 hover:bg-zinc-200`
          }
        `}
              >
                {quality}
              </button>
            );
          })}
          {/* Reserved filter */}
          <button
            type="button"
            onClick={() => setShowReservedOnly((prev) => !prev)}
            className={`
      inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
      border transition
      ${
        showReservedOnly
          ? "bg-green-100 text-green-800 border-transparent"
          : "bg-green-100 text-green-800 opacity-70 border-zinc-300 hover:bg-zinc-200"
      }
    `}
          >
            Reservable
          </button>
        </div>

        {/* Items List */}
        <div className="bg-zinc-300 rounded-lg border border-gray-200 overflow-hidden">
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
                <div
                  key={item.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex-1 ${
                        item.imageUrl && "hover:cursor-pointer"
                      }`}
                      onClick={() => {
                        setClickedImage(item.imageUrl);
                      }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        {item.imageUrl && (
                          <Image className="h-6 w-6 text-blue-700" />
                        )}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityColor(
                            item.quality
                          )}`}
                        >
                          {item.quality}
                        </span>
                        {item.isReserved && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Reserved
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm mb-3 ${
                          !item.description && "italic"
                        }`}
                      >
                        {item.description
                          ? item.description
                          : "No description provided."}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>
                            Found by:{" "}
                            <span className="font-medium text-gray-700">
                              {item.foundBy}
                            </span>
                          </div>
                          <div>
                            Location:{" "}
                            <span className="font-medium text-gray-700">
                              {item.location ? item.location : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div>
                            Date found:{" "}
                            <span className="font-medium text-gray-700">
                              {new Date(item.createdAt).toLocaleDateString(
                                "en-CA"
                              )}
                            </span>
                          </div>
                          {item.isReserved && item.reservedBy && (
                            <div>
                              Reserved for:{" "}
                              <span className="font-medium text-red-600">
                                {item.reservedBy}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {parsedUserInfo.accountName !== item.foundBy &&
                        (!item.isReserved ||
                          parsedUserInfo.accountName === item.reservedBy) && (
                          <button
                            onClick={() => toggleReserved(item.id)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              item.isReserved
                                ? "bg-red-100 text-red-800 hover:bg-red-200"
                                : "bg-green-100 text-green-800 hover:bg-green-200"
                            }`}
                          >
                            {item.isReserved ? "Unreserve" : "Reserve"}
                          </button>
                        )}
                      {parsedUserInfo.accountName === item.foundBy && (
                        <button
                          onClick={() => editItem(item.id)}
                          className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Edit item"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {parsedUserInfo.accountName === item.foundBy && (
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {clickedImage && (
          <ImageModal
            imageUrl={clickedImage}
            onClose={() => setClickedImage("")}
          />
        )}

        {/* Modal for Add Item */}
        {isModalOpen && (
          <HaveItemForm
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            haveItems={haveItems}
            setHaveItems={setHaveItems}
            addItem={addItem}
            editItem={currentItem}
          />
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {haveItems.length}
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {haveItems.filter((i) => !i.isReserved).length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {haveItems.filter((i) => i.isReserved).length}
            </div>
            <div className="text-sm text-gray-600">Reserved</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {haveItems.filter((i) => i.quality === "Unique").length}
            </div>
            <div className="text-sm text-gray-600">Unique Items</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
