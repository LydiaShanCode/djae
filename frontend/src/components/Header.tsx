import { Headphones, Music } from "lucide-react";
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

          {/* Spotify URL Input and Playlist Chip */}
          <div className="w-full sm:flex-1 flex items-center gap-3 md:gap-4 max-w-3xl">
            <form onSubmit={handleSubmit} className="flex-1 max-w-[487px]">
              <div className="relative flex items-center">
                <Headphones className="absolute left-4 md:left-5 w-5 h-5 md:w-6 md:h-6 text-gray-400 z-10" />
                <Input
                  type="text"
                  name="spotifyUrl"
                  placeholder="Paste your playlist link here"
                  className="w-full pl-12 md:pl-14 pr-12 md:pr-14 py-5 md:py-6 bg-gray-100 border-none text-gray-800 placeholder:text-gray-400 rounded-full text-sm md:text-base shadow-neumorphic-inset focus:shadow-neumorphic-inset focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button 
                  type="submit"
                  className="absolute right-2 md:right-3 w-[30px] h-[30px] bg-gray-900 hover:bg-gray-800 text-white rounded-full p-0 flex items-center justify-center shadow-lg group"
                >
                  <img 
                    src="/disk-icon.png" 
                    alt="Submit" 
                    className="w-5 h-5 group-hover:animate-spin"
                  />
                </Button>
              </div>
            </form>

            {/* Playlist Chip */}
            <div className="hidden lg:flex items-center gap-3 pl-2 pr-4 py-2 h-[44px] bg-white border-2 border-dashed border-gray-300 rounded-full">
              <div className="w-[30px] h-[30px] rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Music className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-gray-400 text-sm font-medium whitespace-nowrap">
                Your playlist
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;