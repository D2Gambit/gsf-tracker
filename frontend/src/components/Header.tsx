import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Users } from "lucide-react";
import { toast } from "react-toastify";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [gemActivated, setGemActivated] = useState(false);

  const navigation = [
    { name: "Group Organizer", href: "/" },
    { name: "Loot Showcase", href: "/loot-showcase" },
    { name: "Need List", href: "/need-list" },
    { name: "Have List", href: "/have-list" },
    { name: "Sign Up", href: "/signup" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-zinc-300 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex flex-row items-center gap-2">
            <button
              className={`${
                gemActivated ? "bg-fuchsia-800" : "bg-blue-700"
              } [clip-path:polygon(30%_0%,70%_0%,100%_30%,100%_70%,70%_100%,30%_100%,0%_70%,0%_30%)] hover:opacity-90 text-white font-bold py-4 px-4`}
              title="GEM"
              onClick={() => {
                setGemActivated(!gemActivated);
                toast(`Gem ${gemActivated ? "Deactivated" : "Activated"}`, {
                  className: "text-fuchsia-800 font-bold",
                });
              }}
            ></button>
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-zinc-800">
                GSF Tracker
              </span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-zinc-800 hover:text-red-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-zinc-800 hover:text-red-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-red-600 bg-red-50"
                    : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
