import { Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onPlaylistImport: (url: string) => void;
}

const Header = ({ onPlaylistImport }: HeaderProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get("spotifyUrl") as string;
    if (url) {
      onPlaylistImport(url);
    }
  };

  return (
    <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 border-b border-purple-700 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Music2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DJ Simulator</h1>
              <p className="text-xs text-purple-200">Live Set Experience</p>
            </div>
          </div>

          {/* Spotify URL Input */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
            <div className="flex gap-2">
              <Input
                type="text"
                name="spotifyUrl"
                placeholder="Paste Spotify playlist URL here..."
                className="bg-purple-950/50 border-purple-600 text-white placeholder:text-purple-300 focus:border-purple-400"
              />
              <Button 
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
              >
                Load
              </Button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;