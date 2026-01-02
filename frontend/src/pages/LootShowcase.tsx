import Header from "../components/Header";
import Footer from "../components/Footer";
import LootGrid from "../components/loot-showcase/LootGrid";

export default function LootShowcase() {
  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-300 mb-4">
            Loot Showcase
          </h1>
          <p className="text-lg text-gray-400">
            Show off your latest finds and share the excitement with the
            community. Each item listed here is a testament to your skill and
            dedication. Whether it's a rare drop or a meticulously crafted
            piece, every item has a story to tell!
          </p>
        </div>

        <div className="space-y-8">
          <LootGrid />
        </div>
      </main>

      <Footer />
    </div>
  );
}
