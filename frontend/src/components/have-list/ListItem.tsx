import type { HaveItem } from "../../types/list";
import type { ModalContent } from "../../types/modal";
import { getQualityColor } from "../../utils/colors";
import {
  hasParsedDescription,
  normalizeDescriptionForModal,
  truncate,
} from "../../utils/strings";
import { Edit, Trash2, Image, FileText } from "lucide-react";

type ListItemProps = {
  item: HaveItem;
  editItem: (id: string) => void;
  deleteHaveItem: (itemId: string) => Promise<void>;
  toggleReservation: (itemId: string) => Promise<void>;
  setModalContent: React.Dispatch<React.SetStateAction<ModalContent | null>>;
  onHover: (e: React.MouseEvent) => void;
  onLeave: () => void;
};

export default function ListItem({
  item,
  editItem,
  deleteHaveItem,
  toggleReservation,
  setModalContent,
  onHover,
  onLeave,
}: ListItemProps) {
  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
  const accountName = parsedUserInfo.accountName;

  const handleItemClicked = () => {
    if (item.imageUrl) {
      setModalContent({
        type: "image",
        imageUrl: item.imageUrl,
      });
      return;
    }
    const normalized = normalizeDescriptionForModal(
      item.description,
      item.name
    );
    setModalContent({
      type: "text",
      description: normalized.description,
      name: normalized.name ?? item.name,
      foundBy: item.foundBy,
      quality: item.quality as string | undefined,
    });
  };
  return (
    <div
      key={item.id}
      className="grid grid-cols-3 p-6 hover:bg-gray-50 transition-colors"
    >
      <div
        className={`col-span-2 ${"hover:cursor-pointer"}`}
        title="Click to view details"
        onMouseEnter={onHover}
        onMouseMove={onHover}
        onMouseLeave={onLeave}
        onClick={handleItemClicked}
      >
        <div className="flex items-center gap-3 mb-2">
          <h3
            className={`text-lg font-semibold bg-opacity-0}`}
            title={item.name}
          >
            {truncate(item.name, 30)}
          </h3>
          {item.imageUrl && <Image className="h-5 w-5 text-blue-700" />}
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${getQualityColor(
              item.quality
            )}`}
            title={item.quality}
          >
            {truncate(item.quality, 30)}
          </span>
          {item.isReserved && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Reserved
            </span>
          )}
        </div>
        <p
          className={`text-sm mb-3 ${
            !item.description && item.imageUrl ? "italic" : "hidden"
          }`}
        >
          {item.description ? item.description : "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div className="space-y-1">
            <div>
              Found by:{" "}
              <span className="font-medium text-gray-700">{item.foundBy}</span>
            </div>
            {item.location && item.location !== "N/A" ? (
              <div className="font-medium text-gray-700">
                Location:{" "}
                <span className="font-medium text-gray-700">
                  {item.location}
                </span>
              </div>
            ) : null}
          </div>
          <div className="space-y-1">
            <div>
              Date found:{" "}
              <span className="font-medium text-gray-700">
                {new Date(item.createdAt).toLocaleDateString("en-CA")}
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

      <div className="flex items-center justify-self-end space-x-2 ml-4 mt-3">
        {accountName !== item.foundBy &&
          (!item.isReserved || accountName === item.reservedBy) && (
            <button
              onClick={() => toggleReservation(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                item.isReserved
                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {item.isReserved ? "Unreserve" : "Reserve"}
            </button>
          )}

        {accountName === item.foundBy && (
          <>
            <button
              onClick={() => editItem(item.id)}
              className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors"
              title="Edit item"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteHaveItem(item.id)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
