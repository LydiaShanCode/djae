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
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-6">
          {/* DJ Logo */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <img 
              src="/djae-logo.png" 
              alt="DJAE Logo" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>

          {/* Spotify URL Input */}
          <form onSubmit={handleSubmit} className="w-full sm:flex-1 max-w-2xl">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  name="spotifyUrl"
                  placeholder="Paste Spotify playlist URL..."
                  className="pl-10 bg-gray-100 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:bg-white rounded-full text-sm md:text-base"
                />
              </div>
              <Button 
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-4 md:px-6 text-sm md:text-base"
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