import { Search, Filter } from "lucide-react";
import { getQualityColor } from "../../utils/colors";

const QUALITY_OPTIONS = [
  "Charms",
  "Materials",
  "Normal",
  "Magic",
  "Rare",
  "Unique",
  "Set",
];

type ListFilterProps = {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedQualities: string[];
  setSelectedQualities: React.Dispatch<React.SetStateAction<string[]>>;
  showReservedOnly: boolean;
  setShowReservedOnly: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ListFilter({
  searchTerm,
  setSearchTerm,
  selectedQualities,
  setSelectedQualities,
  showReservedOnly,
  setShowReservedOnly,
}: ListFilterProps) {
  return (
    <div>
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

      {/* Filters */}
      <div className="flex items-center flex-wrap gap-2 mt-3 mb-3">
        <Filter className="flex h-4 w-4 text-zinc-300" />
        <label className="text-sm font-medium text-zinc-300">Filters: </label>

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
    </div>
  );
}
