import { useEffect, useState } from "react";
import { Headphones, Music, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onPlaylistImport: (url: string) => void;
  isImporting?: boolean;
  playlistTitle?: string;
  playlistImage?: string;
}

const Header = ({
  onPlaylistImport,
  isImporting = false,
  playlistTitle,
  playlistImage,
}: HeaderProps) => {
  const hasPlaylist = Boolean(playlistTitle);

  // Collapse the input bar when a playlist loads; clicking it re-expands
  const [inputExpanded, setInputExpanded] = useState(true);

  useEffect(() => {
    if (hasPlaylist) setInputExpanded(false);
  }, [hasPlaylist]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get("playlistUrl") as string;
    if (url && !isImporting) {
      onPlaylistImport(url);
      e.currentTarget.reset();
      // Collapse again after submitting a new URL
      if (hasPlaylist) setInputExpanded(false);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* DJ Logo */}
          <div className="flex items-center">
            <img
              src="/djae-logo.png"
              alt="DJAE Logo"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>

          {/* URL input + playlist pill — matching pill pair */}
          <div className="flex items-center gap-2">

            {/* Input pill */}
            <div
              className="transition-all duration-500 ease-in-out overflow-hidden"
              style={{ width: inputExpanded ? "340px" : "44px" }}
            >
              {inputExpanded ? (
                <form onSubmit={handleSubmit}>
                  <div
                    className="relative flex items-center h-[44px] rounded-full"
                    style={{ background: "#ECEAE6", border: "1px solid #D0CCC6" }}
                  >
                    <Headphones className="absolute left-4 w-4 h-4 flex-shrink-0" style={{ color: "#8A8680" }} />
                    <Input
                      type="text"
                      name="playlistUrl"
                      placeholder="Paste a Jamendo playlist or album link"
                      disabled={isImporting}
                      autoFocus={hasPlaylist}
                      className="w-full pl-10 pr-12 h-full bg-transparent border-none text-sm placeholder:text-[#A8A49E] focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-60"
                      style={{ color: "#3C3A36" }}
                    />
                    <Button
                      type="submit"
                      disabled={isImporting}
                      className="absolute right-1.5 w-[32px] h-[32px] bg-[#2A2825] hover:bg-[#3C3A36] text-white rounded-full p-0 flex items-center justify-center shadow-sm group disabled:opacity-60"
                    >
                      {isImporting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <img src="/disk-icon.png" alt="Submit" className="w-4 h-4 group-hover:animate-spin" />
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setInputExpanded(true)}
                  className="w-[44px] h-[44px] rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:brightness-95"
                  style={{ background: "#ECEAE6", border: "1px solid #D0CCC6" }}
                  title="Paste a new playlist link"
                >
                  <Headphones className="w-4 h-4" style={{ color: "#8A8680" }} />
                </button>
              )}
            </div>

            {/* Playlist pill */}
            {hasPlaylist && (
              <div
                className="flex items-center gap-2.5 h-[44px] pl-1.5 pr-4 rounded-full flex-shrink-0"
                style={{ background: "#ECEAE6", border: "1px solid #D0CCC6" }}
              >
                <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0 bg-[#D8D4CE]">
                  {playlistImage ? (
                    <img src={playlistImage} alt={playlistTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-3.5 h-3.5" style={{ color: "#8A8680" }} />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium whitespace-nowrap max-w-[160px] truncate" style={{ color: "#3C3A36" }}>
                  {playlistTitle}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
