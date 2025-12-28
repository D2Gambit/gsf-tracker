import Login from "../pages/Login";
import GroupOrganizer from "./GroupOrganizer.tsx";
import { useAuth } from "../../AuthContext.tsx";

const HomeContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-300 mb-4">
          Project Diablo 2 - Group Self Found Tracker
        </h1>
        <p className="text-lg text-gray-400">
          Organize your GSF challenge where group members can only use items
          found collectively. Track needs, share finds, and coordinate your
          group's progression.
        </p>
      </div>

      <div className="space-y-8">
        {isAuthenticated ? <GroupOrganizer /> : <Login />}
      </div>
    </main>
  );
};

export default HomeContent;
