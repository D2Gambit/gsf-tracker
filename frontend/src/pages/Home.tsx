import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeContent from "../components/HomeContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Header />

      <HomeContent />

      <Footer />
    </div>
  );
}
