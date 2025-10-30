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
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Simple Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-3 shadow-lg border border-gray-200">
              <Music2 className="w-6 h-6 text-gray-800" />
            </div>
            <span className="text-2xl font-bold text-gray-800">cycle</span>
          </div>

          {/* Spotify URL Input */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  name="spotifyUrl"
                  placeholder="https://open.spotify.com/section/0JQ5DAuChZYPe9iDh..."
                  className="pl-10 bg-gray-100 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:bg-white rounded-full"
                />
              </div>
              <Button 
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-6"
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