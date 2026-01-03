import type { ListStat } from "../../types/list";

export default function ListStats({ listStats }: { listStats: ListStat[] }) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      {listStats.map((stat, i) => {
        return (
          <div
            key={i}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className={`text-2xl font-bold ${stat.statColor}`}>
              {stat.statValue}
            </div>
            <div className="text-sm text-gray-600">{stat.statTitle}</div>
          </div>
        );
      })}
    </div>
  );
}
