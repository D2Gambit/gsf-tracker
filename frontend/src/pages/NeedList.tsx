import React, { useState, useEffect } from "react";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AddNeedItemForm from "../components/AddNeedItemForm";
import { toast } from "react-toastify";
import { useAuth } from "../../AuthContext";

interface NeedItem {
  id: string;
  name: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  requestedBy: string;
  isActive: boolean;
  createdAt: string;
}

export default function NeedList() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddItemClick = () => {
    setCurrentItem({});
    setIsModalOpen(true);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [needItems, setNeedItems] = useState<NeedItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<NeedItem>>({});

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  const { session } = useAuth();

  useEffect(() => {
    // Fetch need items from backend API
    const fetchNeedItems = async () => {
      try {
        const response = await fetch(`/api/need-items/${session?.gsfGroupId}`);
        const data = await response.json();
        setNeedItems(data);
      } catch (error) {
        console.error("Error fetching need items:", error);
      }
    };

    fetchNeedItems();
  }, []);

  const filteredItems = needItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleActive = async (id: string) => {
    try {
      var _currentItem = needItems.filter((item) => item.id === id)[0];

      const formData = new FormData();
      formData.append("isActive", _currentItem.isActive ? "false" : "true");
      formData.append("id", id);

      const res = await fetch("/api/update-is-active-need-item", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setNeedItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, isActive: !item.isActive } : item
        )
      );

      toast.success("Item status updated");
    } catch (err) {
      console.error("Error calling backend:", err);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/delete-need-item/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      setNeedItems((items) => items.filter((item) => item.id !== id));
      toast.success("Item removed from need list");
    } catch (error) {
      console.error("Error deleting selected item:", error);
    }
  };

  const addItem = (id: string) => {
    toast.success("Item added to need list");
  };

  const editItem = async (id: string) => {
    setCurrentItem(needItems.filter((item) => item.id === id)[0]);
    setIsModalOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="flex-col md:w-[500px] lg:w-[700px] ">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-zinc-300">Need List</h1>
              <button
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                onClick={handleAddItemClick}
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>
            <p className="text-lg text-gray-400">
              Track items your group needs to find. Toggle active status and
              manage priorities.
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
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

          {/* Items List */}
          <div className="bg-zinc-300 rounded-lg border border-gray-200 overflow-hidden">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {searchTerm
                    ? "No items match your search."
                    : "No items in need list yet."}
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
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3
                            className={`text-lg font-semibold ${
                              item.isActive ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {item.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                              item.priority
                            )}`}
                          >
                            {item.priority}
                          </span>
                          {!item.isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm mb-3 ${
                            item.isActive ? "text-gray-600" : "text-gray-400"
                          } ${!item.description && "italic"}`}
                        >
                          {item.description
                            ? item.description
                            : "No description provided."}
                        </p>
                        <div
                          className={`flex items-center space-x-4 text-sm justify-between ${
                            item.isActive ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          <span>
                            Requested by:{" "}
                            <span className="font-medium">
                              {item.requestedBy}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-x-4">
                        {parsedUserInfo.accountName === item.requestedBy && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => toggleActive(item.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                item.isActive
                                  ? "text-green-600 hover:bg-green-100"
                                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                              }`}
                              title={
                                item.isActive
                                  ? "Mark as inactive"
                                  : "Mark as active"
                              }
                            >
                              {item.isActive ? (
                                <ToggleRight className="h-5 w-5" />
                              ) : (
                                <ToggleLeft className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => editItem(item.id)}
                              className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors"
                              title="Edit item"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <br />
                        <span className="">
                          Added:{" "}
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString(
                                "en-CA"
                              )
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal for Add Item */}
          {isModalOpen && (
            <AddNeedItemForm
              setIsModalOpen={setIsModalOpen}
              needItems={needItems}
              setNeedItems={setNeedItems}
              addItem={addItem}
              editItem={currentItem}
            />
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {needItems.length}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {needItems.filter((i) => i.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-red-600">
                {needItems.filter((i) => i.priority === "High").length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-400">
                {needItems.filter((i) => !i.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
